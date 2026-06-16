"use client";

import { useEffect, useRef } from "react";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  attachInstruction,
  extractInstruction,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/list-item";
import { useAtom } from "jotai";
import {
  imagePoolItemsAtom,
  imageShapeAtom,
  tierListSettingsAtom,
  isPresentationModeAtom,
} from "../../features/atoms";
import {
  setElementDragPreview,
  useTierListDrop,
  type TierListDragData,
  type TierListDropTargetData,
} from "./CreateDndWrapper";
import type { ImageShape, TierListItem } from "../../features/types";
import { getImagePoolMaxWidth } from "./imageLayout";

const imageShapeClasses: Record<ImageShape, string> = {
  original: "h-24 w-auto",
  square: "aspect-square w-24",
  circle: "aspect-square w-24 rounded-full",
  vertical: "aspect-[2/3] w-20",
  horizontal: "aspect-[3/2] w-32",
};

function PoolAppendDrop({
  index,
  hasImageSpacing,
}: {
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
      getData: () => ({ type: "pool" as const, index }),
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
  }, [index, onTierListHover, onTierListDrop]);

  return (
    <div
      ref={ref}
      className={[
        "min-h-24 min-w-0 basis-0 grow",
        hasImageSpacing ? "-ml-3" : "",
      ].join(" ")}
      aria-hidden
    />
  );
}

function PoolEmptyDrop() {
  const ref = useRef<HTMLDivElement>(null);
  const { onTierListHover, onTierListDrop } = useTierListDrop();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return dropTargetForElements({
      element: el,
      getData: () => ({ type: "pool" as const, index: 0 }),
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
  }, [onTierListHover, onTierListDrop]);

  return <div ref={ref} className="flex-1 min-h-24 rounded " aria-hidden />;
}

function PoolImage({ item, index }: { item: TierListItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [imageShape] = useAtom(imageShapeAtom);
  const {
    activeDragId,
    onTierListDragStart,
    onTierListHover,
    onTierListDrop,
  } = useTierListDrop();
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
        type: "pool" as const,
        item,
        poolIndex: index,
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
          { type: "pool" as const, index },
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
          type: "pool",
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
        onTierListDrop(sd, { type: "pool", index: destIndex });
      },
    });
    return () => {
      cleanupDraggable();
      cleanupDrop();
    };
  }, [
    item,
    index,
    onTierListDragStart,
    onTierListHover,
    onTierListDrop,
  ]);

  return (
    <div
      ref={ref}
      className={`select-none cursor-grab active:cursor-grabbing overflow-hidden transition-all shrink-0 ${
        imageShapeClasses[imageShape]
      } ${
        isDragActive && !isPreview ? "opacity-50" : ""
      } ${isPreview ? "opacity-100 ring-2 ring-blue-400/70 shadow-lg scale-[1.02]" : ""}`}
    >
      <img
        src={item.url}
        alt={`Item ${index}`}
        className="w-full h-full object-cover pointer-events-none"
      />
    </div>
  );
}

export default function ImagePool() {
  const [poolItems] = useAtom(imagePoolItemsAtom);
  const [imageShape] = useAtom(imageShapeAtom);
  const [settings] = useAtom(tierListSettingsAtom);
  const [isPresentationMode] = useAtom(isPresentationModeAtom);
  return (
    <div
      className={`group mx-auto min-h-36 w-full select-none rounded-lg border p-4 transition-colors ${
        isPresentationMode
          ? "border-transparent bg-transparent hover:border-zinc-800 hover:bg-zinc-900/50"
          : "border-zinc-800 bg-zinc-900"
      }`}
      style={{
        maxWidth: getImagePoolMaxWidth(
          imageShape,
          settings.spaceBetweenImages,
        ),
      }}
    >
      <h3
        className={`mb-4 text-sm font-medium transition-colors ${
          isPresentationMode
            ? "text-transparent group-hover:text-zinc-400"
            : "text-zinc-300"
        }`}
      >
        Image pool{" "}
        <span
          className={
            isPresentationMode
              ? "text-transparent group-hover:text-zinc-500"
              : "text-zinc-500"
          }
        >
          ({poolItems.length})
        </span>
      </h3>
      <div
        className={`flex flex-wrap ${
          settings.spaceBetweenImages ? "gap-3" : ""
        } min-h-24 rounded-md`}
      >
        {poolItems.length === 0 ? (
          <PoolEmptyDrop />
        ) : (
          <>
            {poolItems.map((item, i) => (
              <PoolImage key={item.id} item={item} index={i} />
            ))}
            <PoolAppendDrop
              index={poolItems.length}
              hasImageSpacing={settings.spaceBetweenImages}
            />
          </>
        )}
      </div>
    </div>
  );
}
