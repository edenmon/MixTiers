"use client";
import type {
  TierListSettings,
  TierRow,
  TierListItem,
} from "../../features/types/index.js";
import type { ImageShape, RowGap } from "../../features/types";
import { Activity, useEffect, useRef, useState } from "react";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  attachInstruction,
  extractInstruction,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/list-item";
import { ClipboardPen, Trash } from "lucide-react";
import { useAtom, useStore } from "jotai";
import {
  tierListSettingsAtom,
  tierRowsAtom,
  itemsByRowIdAtom,
  imageShapeAtom,
} from "../../features/atoms";
import {
  setElementDragPreview,
  useTierListDrop,
  type TierListDragData,
  type TierListDropTargetData,
} from "./CreateDndWrapper";
import { getTierRowsMaxWidth } from "./imageLayout";

const rowImageShapeClasses: Record<ImageShape, string> = {
  original: "h-24 w-auto max-w-32",
  square: "h-24 w-24",
  circle: "h-24 w-24 rounded-full",
  vertical: "h-30 w-20",
  horizontal: "h-24 w-36",
};

type TierRowDragData = { type: "tier-row"; rowId: string };
type TierRowDropData = { type: "tier-row"; index: number };

function RowAppendDrop({
  rowId,
  index,
  hasImageSpacing,
}: {
  rowId: string;
  index: number;
  hasImageSpacing: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { onTierListHover, onTierListDrop } = useTierListDrop();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return dropTargetForElements({
      element: el,
      getData: () => ({ type: "row" as const, rowId, index }),
      canDrop: ({ source }) =>
        source.data?.type === "pool" || source.data?.type === "row",
      onDrag: ({ source, self }) => {
        const sourceData = source.data as TierListDragData | undefined;
        const targetData = self.data as TierListDropTargetData;
        if (sourceData?.type === "pool" || sourceData?.type === "row") {
          onTierListHover(sourceData, targetData);
        }
      },
      onDrop: ({ source, self }) => {
        const sd = source.data as TierListDragData | undefined;
        const td = self.data as TierListDropTargetData;
        if (sd?.type === "pool" || sd?.type === "row") onTierListDrop(sd, td);
      },
    });
  }, [rowId, index, onTierListHover, onTierListDrop]);

  return (
    <div
      ref={ref}
      className={[
        "min-h-24 min-w-0 basis-0 grow",
        hasImageSpacing ? "-ml-2" : "",
      ].join(" ")}
      aria-hidden
      data-export-ignore="true"
    />
  );
}

function RowEmptyDrop({ rowId }: { rowId: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { onTierListHover, onTierListDrop } = useTierListDrop();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return dropTargetForElements({
      element: el,
      getData: () => ({ type: "row" as const, rowId, index: 0 }),
      canDrop: ({ source }) =>
        source.data?.type === "pool" || source.data?.type === "row",
      onDrag: ({ source, self }) => {
        const sourceData = source.data as TierListDragData | undefined;
        const targetData = self.data as TierListDropTargetData;
        if (sourceData?.type === "pool" || sourceData?.type === "row") {
          onTierListHover(sourceData, targetData);
        }
      },
      onDrop: ({ source, self }) => {
        const sd = source.data as TierListDragData | undefined;
        const td = self.data as TierListDropTargetData;
        if (sd?.type === "pool" || sd?.type === "row") onTierListDrop(sd, td);
      },
    });
  }, [rowId, onTierListHover, onTierListDrop]);

  return (
    <div
      ref={ref}
      className="flex-1 min-h-24"
      aria-hidden
      data-export-ignore="true"
    />
  );
}

function moveItem<T>(list: T[], fromIndex: number, toIndex: number): T[] {
  const next = [...list];
  const [removed] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, removed);
  return next;
}

function SortableTierRow({
  row,
  rowIndex,
  settings,
  openEditor,
}: {
  row: TierRow;
  rowIndex: number;
  settings: TierListSettings;
  openEditor: (rowIndex: number) => void;
}) {
  const store = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLButtonElement>(null);
  const [itemsByRowId] = useAtom(itemsByRowIdAtom);

  useEffect(() => {
    const labelEl = labelRef.current;
    if (!labelEl) return;
    return draggable({
      element: labelEl,
      onGenerateDragPreview: ({ nativeSetDragImage, location }) => {
        setElementDragPreview({
          element: labelEl,
          nativeSetDragImage,
          input: location.current.input,
        });
      },
      getInitialData: () => ({ type: "tier-row" as const, rowId: row.id }),
    });
  }, [row.id]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    return dropTargetForElements({
      element: el,
      getData: ({ input, element }) =>
        attachInstruction(
          { type: "tier-row" as const, index: rowIndex },
          {
            input,
            element,
            operations: {
              "reorder-before": "available",
              "reorder-after": "available",
            },
            axis: "vertical",
          },
        ),
      canDrop: ({ source }) =>
        (source.data as TierRowDragData | undefined)?.type === "tier-row",
      onDrop: ({ source, self }) => {
        const sd = source.data as TierRowDragData | undefined;
        if (sd?.type !== "tier-row") return;
        const rows = store.get(tierRowsAtom);

        const fromIndex = rows.findIndex((row) => row.id === sd.rowId);
        if (fromIndex < 0) return;
        const instruction = extractInstruction(self.data);
        const rawTarget =
          (self.data as TierRowDropData | undefined)?.index ?? rowIndex;
        const toIndexBase =
          instruction?.operation === "reorder-after"
            ? rawTarget + 1
            : rawTarget;
        const toIndex = Math.max(0, Math.min(toIndexBase, rows.length - 1));
        if (fromIndex === toIndex) return;

        const moved = moveItem(rows, fromIndex, toIndex);
        store.set(tierRowsAtom, moved);
      },
    });
  }, [rowIndex, store]);

  return (
    <div
      ref={containerRef}
      className={[
        "relative col-span-2 grid grid-cols-subgrid items-start overflow-hidden",
        settings.roundedRows ? "rounded-lg" : "",
        settings.borderStyle == "none"
          ? ""
          : "border-zinc-700 border-y border-r-2",
      ].join(" ")}
      style={{
        backgroundColor: settings.matchRowBackgroundToLabel
          ? row.color.startsWith("bg-")
            ? row.color.slice(4, -1)
            : row.color
          : "transparent",
      }}
    >
      <button
        ref={labelRef}
        type="button"
        onClick={() => openEditor(rowIndex)}
        aria-label={`Edit row ${row.label}`}
        className={[
          "min-w-16 px-2 self-stretch sm:min-w-20",
          settings.boldLabels ? "font-bold" : "font-normal",
          "flex items-center justify-center relative group transition-all whitespace-nowrap box-border",
          row.color.startsWith("bg-") ? row.color : "",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-300",
          settings.roundedRows ? "rounded-lg" : "rounded-none",
          "cursor-grab active:cursor-grabbing",
          settings.borderStyle == "none" ? "" : "border-x-2 border-zinc-700",
        ].join(" ")}
        style={{
          color: settings.textColor,
          backgroundColor: row.color.startsWith("bg-")
            ? undefined
            : row.color,
        }}
      >
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity" />
        <span className="relative z-10 transition-opacity duration-150 group-hover:opacity-0">
          {row.label}
        </span>
        <ClipboardPen className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity z-20" />
      </button>
      <div
        className={[
          "flex-1 flex flex-wrap items-center content-start",
          rowGapClass(settings.rowGap),
          settings.spaceBetweenImages ? "gap-2" : "",
          "min-h-24 min-w-0",
          settings.matchRowBackgroundToLabel
            ? "bg-transparent"
            : "bg-[#111114]",
        ].join(" ")}
      >
        {(itemsByRowId[row.id] ?? []).length === 0 ? (
          <RowEmptyDrop rowId={row.id} />
        ) : (
          <>
            {(itemsByRowId[row.id] ?? []).map((item, itemIndex) => (
              <RowItem
                key={item.id}
                item={item}
                rowId={row.id}
                index={itemIndex}
              />
            ))}
            <RowAppendDrop
              rowId={row.id}
              index={(itemsByRowId[row.id] ?? []).length}
              hasImageSpacing={settings.spaceBetweenImages}
            />
          </>
        )}
      </div>
    </div>
  );
}

function RowItem({
  item,
  rowId,
  index,
}: {
  item: TierListItem;
  rowId: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [imageShape] = useAtom(imageShapeAtom);
  const { activeDragId, onTierListDragStart, onTierListHover, onTierListDrop } =
    useTierListDrop();
  const isDragActive = activeDragId != null;
  const isPreview = activeDragId === item.id;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cleanupDraggable = draggable({
      element: el,
      onGenerateDragPreview: ({ nativeSetDragImage, location }) => {
        setElementDragPreview({
          element: el,
          nativeSetDragImage,
          input: location.current.input,
        });
      },
      getInitialData: () => ({
        type: "row" as const,
        item,
        rowId,
        rowIndex: index,
      }),
      getInitialDataForExternal: () => ({ "text/plain": "tier-list-item" }),
      onDragStart: ({ source }) => {
        const sd = source.data as TierListDragData | undefined;
        if (sd?.type === "pool" || sd?.type === "row") onTierListDragStart(sd);
      },
    });
    const cleanupDrop = dropTargetForElements({
      element: el,
      getData: ({ input, element }) =>
        attachInstruction(
          { type: "row" as const, rowId, index },
          {
            input,
            element,
            operations: {
              "reorder-before": "available",
              "reorder-after": "available",
            },
            axis: "horizontal",
          },
        ),
      canDrop: ({ source }) =>
        source.data?.type === "pool" || source.data?.type === "row",
      onDrag: ({ source, self }) => {
        if (source.element === self.element) return;
        const sourceData = source.data as TierListDragData | undefined;
        if (sourceData?.type !== "pool" && sourceData?.type !== "row") return;
        const instruction = extractInstruction(self.data);
        const destinationIndex =
          instruction?.operation === "reorder-after" ? index + 1 : index;
        onTierListHover(sourceData, {
          type: "row",
          rowId,
          index: destinationIndex,
        });
      },
      onDrop: ({ source, self }) => {
        if (source.element === self.element) return;
        const sd = source.data as TierListDragData | undefined;
        if (sd?.type !== "pool" && sd?.type !== "row") return;
        const instr = extractInstruction(self.data);
        const destIndex =
          instr?.operation === "reorder-after" ? index + 1 : index;
        onTierListDrop(sd, { type: "row", rowId, index: destIndex });
      },
    });
    return () => {
      cleanupDraggable();
      cleanupDrop();
    };
  }, [
    item,
    rowId,
    index,
    onTierListDragStart,
    onTierListHover,
    onTierListDrop,
  ]);

  return (
    <div
      ref={ref}
      className={`shrink-0 select-none overflow-hidden cursor-grab active:cursor-grabbing transition-all ${rowImageShapeClasses[imageShape]} ${
        isDragActive && !isPreview ? "opacity-50" : ""
      } ${isPreview ? "opacity-100 ring-2 ring-blue-400/70 shadow-lg scale-[1.02]" : ""}`}
    >
      <img
        src={item.url}
        alt=""
        className="h-full w-full object-cover pointer-events-none"
      />
    </div>
  );
}

function rowGapClass(rowGap: RowGap) {
  switch (rowGap) {
    case "none":
      return "gap-y-0";
    case "small":
      return "gap-y-1";
    case "medium":
      return "gap-y-2";
    case "large":
      return "gap-y-4";
  }
  return "gap-y-2";
}

export default function Rows() {
  const [settings] = useAtom(tierListSettingsAtom);
  const [rows, setRows] = useAtom(tierRowsAtom);
  const [imageShape] = useAtom(imageShapeAtom);
  const [, setItemsByRowId] = useAtom(itemsByRowIdAtom);
  const [isRowEditorOpen, setIsRowEditorOpen] = useState(false);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [draftLabel, setDraftLabel] = useState("");
  const [draftColor, setDraftColor] = useState("#ffffff");

  function openEditor(rowIndex: number) {
    const row = rows[rowIndex];
    setEditingRowIndex(rowIndex);
    setDraftLabel(row.label);
    setDraftColor(
      row.color.startsWith("bg-") ? row.color.slice(4, -1) : row.color,
    );
    setIsRowEditorOpen(true);
  }

  function saveEditor() {
    if (editingRowIndex === null) return;
    const newRows = [...rows];
    newRows[editingRowIndex] = {
      ...newRows[editingRowIndex],
      label: draftLabel || newRows[editingRowIndex].label,
      color: draftColor,
    };
    setRows(newRows);
    setIsRowEditorOpen(false);
    setEditingRowIndex(null);
  }

  function deleteRow() {
    if (editingRowIndex === null) return;
    const rowId = rows[editingRowIndex].id;
    setRows(rows.filter((_, rowIndex) => rowIndex !== editingRowIndex));
    setItemsByRowId((prev) => {
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
    setIsRowEditorOpen(false);
    setEditingRowIndex(null);
  }
  return (
    <div className="w-full">
      <div
        id="tier-rows-capture"
        className={[
          "relative mx-auto grid w-full max-w-5xl select-none grid-cols-[max-content_minmax(0,1fr)] gap-x-0 box-border [--tier-label-width:4rem] sm:[--tier-label-width:5rem]",
          rowGapClass(settings.rowGap),
          settings.borderStyle == "none" || settings.rowGap !== "none"
            ? ""
            : "border-zinc-700 border-y",
          settings.roundedRows ? "rounded-lg" : "",
        ].join(" ")}
        style={{
          maxWidth: getTierRowsMaxWidth(
            imageShape,
            settings.spaceBetweenImages,
          ),
        }}
      >
        {rows.map((row, rowIndex) => (
          <SortableTierRow
            key={row.id}
            row={row}
            rowIndex={rowIndex}
            settings={settings}
            openEditor={openEditor}
          />
        ))}
      </div>
      <Activity
        mode={
          isRowEditorOpen && editingRowIndex !== null ? "visible" : "hidden"
        }
      >
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            onClick={() => setIsRowEditorOpen(false)}
            aria-label="Close row editor"
          />
          <div
            className="relative w-full max-w-sm rounded-lg border border-zinc-500 bg-zinc-900 p-5 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="row-editor-title"
          >
            <h3
              id="row-editor-title"
              className="text-lg font-semibold text-zinc-100"
            >
              Edit row
            </h3>
            <label className="mt-5 block text-sm font-medium text-zinc-300">
              Label
            </label>
            <input
              value={draftLabel}
              onChange={(e) => setDraftLabel(e.target.value)}
              className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 focus:border-amber-300/60 focus:outline-none focus:ring-2 focus:ring-amber-300/20"
            />

            <label className="mt-4 block text-sm font-medium text-zinc-300">
              Color
            </label>
            <input
              type="color"
              value={draftColor}
              onChange={(e) => setDraftColor(e.target.value)}
              className="mt-2 size-10 rounded-md border border-zinc-700 bg-zinc-950 p-1"
            />

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={deleteRow}
                className="mr-auto flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-red-300 transition-colors hover:bg-red-400/10"
              >
                <Trash className="size-4" />
                Delete
              </button>
              <button
                onClick={() => setIsRowEditorOpen(false)}
                className="h-9 rounded-md px-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
              >
                Cancel
              </button>
              <button
                onClick={saveEditor}
                className="h-9 rounded-md bg-amber-300 px-4 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-200"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </Activity>
    </div>
  );
}
