"use client";
import { useState } from "react";
import {
  CirclePlus,
  ArrowDownToLine,
  Eye,
  EyeOff,
  RefreshCw,
  CircleX,
} from "lucide-react";
import IconButton from "./IconButton";
import { toPng } from "html-to-image";
import { useAtom } from "jotai";
import {
  imagePoolItemsAtom,
  imageShapeAtom,
  tierRowsAtom,
  isPresentationModeAtom,
  itemsByRowIdAtom,
  tierListSettingsAtom,
} from "../../features/atoms";
import { createId } from "../../features/createId";
import type { TierListItem } from "../../features/types";
import { getTierRowsMaxWidth } from "./imageLayout";

function TierListTitle() {
  const [title, setTitle] = useState("Untitled list");
  return (
    <input
      type="text"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      className="min-w-0 flex-1 bg-transparent text-2xl font-semibold text-zinc-100 placeholder:text-zinc-500 focus:outline-none sm:text-3xl"
      aria-label="List title"
    />
  );
}

export function ClearImagesButton() {
  const [, setPoolItems] = useAtom(imagePoolItemsAtom);
  const [, setItemsByRowId] = useAtom(itemsByRowIdAtom);
  function handleClear() {
    setPoolItems([]);
    setItemsByRowId({});
  }
  return (
    <IconButton
      ariaLabel="Clear all images"
      buttonTitle="Clear all images"
      onClick={handleClear}
    >
      <CircleX className="size-[18px]" />
    </IconButton>
  );
}

export function ReturnImagesToPoolButton() {
  const [poolItems, setPoolItems] = useAtom(imagePoolItemsAtom);
  const [rows] = useAtom(tierRowsAtom);
  const [itemsByRowId, setItemsByRowId] = useAtom(itemsByRowIdAtom);

  function handleReset() {
    const itemsFromRows: TierListItem[] = [];
    for (const row of rows) {
      const rowItems = itemsByRowId[row.id] ?? [];
      for (const item of rowItems) itemsFromRows.push(item);
    }

    // Keep existing pool order, then append all row images.
    // De-dupe by item ID so each item exists in exactly one location.
    const nextPoolItems: TierListItem[] = [];
    const seen = new Set<string>();
    for (const item of [...poolItems, ...itemsFromRows]) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      nextPoolItems.push(item);
    }

    setPoolItems(nextPoolItems);
    setItemsByRowId({});
  }

  return (
    <IconButton
      ariaLabel="Return all images to pool"
      buttonTitle="Return all images to pool"
      onClick={handleReset}
    >
      <RefreshCw className="size-[18px]" />
    </IconButton>
  );
}

function AddRowButton() {
  const [, setRows] = useAtom(tierRowsAtom);
  function handleAddRow() {
    setRows((rows) => [
      ...rows,
      {
        id: createId(),
        label: "New Row",
        color: "bg-[#8a8a8a]",
      },
    ]);
  }
  return (
    <IconButton
      ariaLabel="Add row"
      buttonTitle="Add a new row"
      onClick={handleAddRow}
    >
      <CirclePlus className="size-[18px]" />
    </IconButton>
  );
}

function ExportImageButton() {
  async function waitForImages(container: HTMLElement) {
    const imgs = Array.from(container.querySelectorAll("img"));
    await Promise.all(
      imgs.map((img) => {
        const el = img as HTMLImageElement;
        if (el.complete && el.naturalWidth > 0) return Promise.resolve();

        const dec = el.decode?.bind(el);
        if (dec) return dec().catch(() => {});

        return new Promise<void>((resolve) => {
          const done = () => resolve();
          el.addEventListener("load", done, { once: true });
          el.addEventListener("error", done, { once: true });
        });
      }),
    );
  }

  function inlineLoadedImages(container: HTMLElement) {
    const imgs = Array.from(container.querySelectorAll("img"));
    const restores: Array<() => void> = [];

    for (const imgEl of imgs) {
      const img = imgEl as HTMLImageElement;
      if (!img.complete || img.naturalWidth === 0) continue;

      const prevSrc = img.src;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        ctx.drawImage(img, 0, 0);
        img.src = canvas.toDataURL("image/png");
        restores.push(() => {
          img.src = prevSrc;
        });
      } catch {
        // Canvas can be tainted by CORS; ignore and keep original src
      }
    }

    return () => {
      for (const restore of restores) restore();
    };
  }

  async function handleSave() {
    const node = document.getElementById("tier-rows-capture");
    if (!node) return;

    try {
      // Avoid capturing focus rings / carets
      (document.activeElement as HTMLElement | null)?.blur?.();

      await waitForImages(node);
      const restoreImages = inlineLoadedImages(node);

      // The rows grid is centered with `mx-*` but still lays out
      // as a full-width grid (`1fr` track + `flex-1` row body). Temporarily
      // shrink-wrap the live node for export, then restore.
      const prevNodeStyle = node.getAttribute("style");
      const touched: Array<{ el: HTMLElement; prevStyle: string | null }> = [];

      const remember = (el: HTMLElement) => {
        touched.push({ el, prevStyle: el.getAttribute("style") });
      };

      remember(node);
      node.style.marginLeft = "0px";
      node.style.marginRight = "0px";
      node.style.display = "inline-grid";
      node.style.width = "fit-content";
      node.style.maxWidth = "none";
      // Remove the `1fr` expansion for export.
      node.style.gridTemplateColumns = "max-content max-content";

      for (const el of Array.from(
        node.querySelectorAll<HTMLElement>('[data-export-ignore="true"]'),
      )) {
        remember(el);
        el.style.display = "none";
      }

      // Row body uses `flex-1` in the live UI; make it `fit-content` for export.
      for (const el of Array.from(
        node.querySelectorAll<HTMLElement>(".flex-1"),
      )) {
        if (el.dataset.exportIgnore === "true") continue;
        remember(el);
        el.style.flex = "0 0 auto";
        el.style.width = "fit-content";
      }

      // Let layout settle with the temporary export styles applied.
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );

      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        cacheBust: false,
        backgroundColor: "#111114",
        filter: (n) =>
          !(n instanceof HTMLElement) || n.dataset.exportIgnore !== "true",
      });
      restoreImages();

      // Restore styles
      for (const { el, prevStyle } of touched) {
        if (prevStyle == null) el.removeAttribute("style");
        else el.setAttribute("style", prevStyle);
      }
      if (prevNodeStyle == null) node.removeAttribute("style");
      else node.setAttribute("style", prevNodeStyle);

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "tier-list.png";
      a.click();
    } catch (err) {
      console.error("Failed to export tier list image", err);
    }
  }
  return (
    <IconButton
      ariaLabel="Save"
      buttonTitle="Save as image"
      onClick={handleSave}
      className="border-amber-300/30 bg-amber-300 text-zinc-950 hover:border-amber-200 hover:bg-amber-200 hover:text-zinc-950"
    >
      <ArrowDownToLine className="size-[18px]" />
    </IconButton>
  );
}

function PresentationModeButton() {
  const [isPresentationMode, setIsPresentationMode] = useAtom(
    isPresentationModeAtom,
  );
  function handlePresentationMode() {
    setIsPresentationMode((prev) => !prev);
  }
  return (
    <IconButton
      ariaLabel="Toggle presentation mode"
      buttonTitle="Toggle presentation mode"
      onClick={handlePresentationMode}
    >
      {isPresentationMode ? (
        <EyeOff className="size-[18px]" />
      ) : (
        <Eye className="size-[18px]" />
      )}
    </IconButton>
  );
}

export default function TierListHeader() {
  const [isPresentationMode] = useAtom(isPresentationModeAtom);
  const [imageShape] = useAtom(imageShapeAtom);
  const [settings] = useAtom(tierListSettingsAtom);
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      data-export-ignore="true"
      className={`mx-auto flex w-full max-w-5xl flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between [--tier-label-width:4rem] sm:[--tier-label-width:5rem] ${
        isPresentationMode ? "mt-2" : ""
      }`}
      style={{
        maxWidth: getTierRowsMaxWidth(
          imageShape,
          settings.spaceBetweenImages,
        ),
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <TierListTitle />
      <div
        className={`flex items-center gap-1 self-end rounded-lg border border-zinc-800 bg-zinc-900 p-1 transition-opacity sm:self-auto ${
          isPresentationMode && !isHovering ? "opacity-0" : "opacity-100"
        }`}
      >
        <PresentationModeButton />
        <ClearImagesButton />
        <ReturnImagesToPoolButton />
        <AddRowButton />
        <ExportImageButton />
      </div>
    </div>
  );
}
