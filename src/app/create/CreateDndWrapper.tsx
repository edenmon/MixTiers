"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAtom, useStore } from "jotai";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  imagePoolItemsAtom,
  itemsByRowIdAtom,
} from "../../features/atoms";
import type { TierListItem } from "../../features/types";

export type TierListDragData =
  | { type: "pool"; item: TierListItem; poolIndex: number }
  | { type: "row"; item: TierListItem; rowId: string; rowIndex: number };

export type TierListDropTargetData =
  | { type: "pool"; index: number }
  | { type: "row"; rowId: string; index: number }
  | { type: "delete" };

export function setElementDragPreview({
  element,
  nativeSetDragImage,
  input,
}: {
  element: HTMLElement;
  nativeSetDragImage: DataTransfer["setDragImage"] | null;
  input: { clientX: number; clientY: number };
}) {
  window.getSelection()?.removeAllRanges();
  const rect = element.getBoundingClientRect();
  nativeSetDragImage?.(
    element,
    input.clientX - rect.left,
    input.clientY - rect.top,
  );
}

type DragOrigin =
  | { type: "pool"; index: number }
  | { type: "row"; rowId: string; index: number };

type TierListDropContextValue = {
  activeDragId: string | null;
  onTierListDragStart: (source: TierListDragData) => void;
  onTierListHover: (
    source: TierListDragData,
    target: TierListDropTargetData,
  ) => void;
  onTierListDrop: (
    source: TierListDragData,
    target: TierListDropTargetData,
  ) => void;
};

const TierListDropContext = createContext<TierListDropContextValue | null>(null);

export function useTierListDrop() {
  const context = useContext(TierListDropContext);
  if (!context) {
    throw new Error("useTierListDrop must be used within CreateDndWrapper");
  }
  return context;
}

function insertItemAt(
  items: TierListItem[],
  item: TierListItem,
  index: number,
) {
  const clampedIndex = Math.max(0, Math.min(index, items.length));
  return [
    ...items.slice(0, clampedIndex),
    item,
    ...items.slice(clampedIndex),
  ];
}

function removeItemFromAllRows(
  itemsByRowId: Record<string, TierListItem[]>,
  itemId: string,
): Record<string, TierListItem[]> {
  const nextItemsByRowId: Record<string, TierListItem[]> = {};
  for (const [rowId, rowItems] of Object.entries(itemsByRowId)) {
    const remainingItems = rowItems.filter((item) => item.id !== itemId);
    if (remainingItems.length > 0) {
      nextItemsByRowId[rowId] = remainingItems;
    }
  }
  return nextItemsByRowId;
}

function insertIntoRow(
  itemsByRowId: Record<string, TierListItem[]>,
  rowId: string,
  item: TierListItem,
  index: number,
): Record<string, TierListItem[]> {
  const itemsWithoutDraggedItem = removeItemFromAllRows(
    itemsByRowId,
    item.id,
  );
  const rowItems = itemsWithoutDraggedItem[rowId] ?? [];
  return {
    ...itemsWithoutDraggedItem,
    [rowId]: insertItemAt(rowItems, item, index),
  };
}

function getHoverTargetKey(target: TierListDropTargetData) {
  if (target.type === "delete") return "delete";
  if (target.type === "pool") return `pool:${target.index}`;
  return `row:${target.rowId}:${target.index}`;
}

export default function CreateDndWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [, setPoolItems] = useAtom(imagePoolItemsAtom);
  const [, setItemsByRowId] = useAtom(itemsByRowIdAtom);
  const store = useStore();
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const dragSessionRef = useRef<{
    item: TierListItem;
    origin: DragOrigin;
  } | null>(null);
  const lastHoverKeyRef = useRef<string | null>(null);

  const restoreDragSession = useCallback(() => {
    const session = dragSessionRef.current;
    if (!session) return;
    const { item, origin } = session;
    const poolItems = store.get(imagePoolItemsAtom);
    const itemsByRowId = store.get(itemsByRowIdAtom);

    let nextPoolItems = poolItems.filter(
      (candidate) => candidate.id !== item.id,
    );
    let nextItemsByRowId = removeItemFromAllRows(itemsByRowId, item.id);

    if (origin.type === "pool") {
      const index = Math.min(origin.index, nextPoolItems.length);
      nextPoolItems = insertItemAt(nextPoolItems, item, index);
    } else {
      nextItemsByRowId = insertIntoRow(
        nextItemsByRowId,
        origin.rowId,
        item,
        origin.index,
      );
    }

    store.set(imagePoolItemsAtom, nextPoolItems);
    store.set(itemsByRowIdAtom, nextItemsByRowId);
    dragSessionRef.current = null;
    lastHoverKeyRef.current = null;
  }, [store]);

  const onTierListDragStart = useCallback(
    (source: TierListDragData) => {
      const item = source.item;
      setActiveDragId(item.id);

      if (source.type === "pool") {
        dragSessionRef.current = {
          item,
          origin: { type: "pool", index: source.poolIndex },
        };
        setPoolItems((poolItems) =>
          poolItems.filter((_, index) => index !== source.poolIndex),
        );
      } else {
        dragSessionRef.current = {
          item,
          origin: {
            type: "row",
            rowId: source.rowId,
            index: source.rowIndex,
          },
        };
        setItemsByRowId((itemsByRowId) => {
          const remainingItems = (itemsByRowId[source.rowId] ?? []).filter(
            (_, index) => index !== source.rowIndex,
          );
          const nextItemsByRowId = {
            ...itemsByRowId,
            [source.rowId]: remainingItems,
          };
          if (remainingItems.length === 0) {
            delete nextItemsByRowId[source.rowId];
          }
          return nextItemsByRowId;
        });
      }

      lastHoverKeyRef.current = null;
    },
    [setItemsByRowId, setPoolItems],
  );

  const onTierListHover = useCallback(
    (source: TierListDragData, target: TierListDropTargetData) => {
      if (target.type === "delete") return;
      const item = source.item;
      const hoverTargetKey = getHoverTargetKey(target);
      if (lastHoverKeyRef.current === hoverTargetKey) return;
      lastHoverKeyRef.current = hoverTargetKey;

      const poolItems = store.get(imagePoolItemsAtom);
      const itemsByRowId = store.get(itemsByRowIdAtom);

      if (target.type === "pool") {
        const nextItemsByRowId = removeItemFromAllRows(
          itemsByRowId,
          item.id,
        );
        const poolItemsWithoutDraggedItem = poolItems.filter(
          (candidate) => candidate.id !== item.id,
        );
        const nextPoolItems = insertItemAt(
          poolItemsWithoutDraggedItem,
          item,
          target.index,
        );
        store.set(itemsByRowIdAtom, nextItemsByRowId);
        store.set(imagePoolItemsAtom, nextPoolItems);
      } else {
        const nextPoolItems = poolItems.filter(
          (candidate) => candidate.id !== item.id,
        );
        const nextItemsByRowId = insertIntoRow(
          itemsByRowId,
          target.rowId,
          item,
          target.index,
        );
        store.set(imagePoolItemsAtom, nextPoolItems);
        store.set(itemsByRowIdAtom, nextItemsByRowId);
      }
    },
    [store],
  );

  const onTierListDrop = useCallback(
    (source: TierListDragData, target: TierListDropTargetData) => {
      const itemId = source.item.id;

      if (target.type === "delete") {
        setPoolItems((poolItems) =>
          poolItems.filter((item) => item.id !== itemId),
        );
        setItemsByRowId((itemsByRowId) =>
          removeItemFromAllRows(itemsByRowId, itemId),
        );
        dragSessionRef.current = null;
        lastHoverKeyRef.current = null;
        setActiveDragId(null);
        return;
      }

      lastHoverKeyRef.current = null;
      onTierListHover(source, target);
    },
    [onTierListHover, setItemsByRowId, setPoolItems],
  );

  useEffect(() => {
    return monitorForElements({
      canMonitor: ({ source }) =>
        source.data?.type === "pool" || source.data?.type === "row",
      onDrop: ({ location }) => {
        if (!dragSessionRef.current) {
          lastHoverKeyRef.current = null;
          setActiveDragId(null);
          return;
        }

        if (location.current.dropTargets.length === 0) {
          if (lastHoverKeyRef.current == null) {
            restoreDragSession();
          } else {
            dragSessionRef.current = null;
            lastHoverKeyRef.current = null;
          }
          setActiveDragId(null);
          return;
        }

        dragSessionRef.current = null;
        lastHoverKeyRef.current = null;
        setActiveDragId(null);
      },
    });
  }, [restoreDragSession]);

  const value = useMemo(
    () => ({
      activeDragId,
      onTierListDragStart,
      onTierListHover,
      onTierListDrop,
    }),
    [activeDragId, onTierListDragStart, onTierListHover, onTierListDrop],
  );

  return (
    <TierListDropContext.Provider value={value}>
      {children}
    </TierListDropContext.Provider>
  );
}
