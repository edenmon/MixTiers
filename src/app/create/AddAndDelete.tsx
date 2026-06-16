"use client";

import { useEffect, useRef, useState, Activity } from "react";
import {
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useAtom } from "jotai";
import {
  imagePoolItemsAtom,
  isPresentationModeAtom,
} from "../../features/atoms";
import { createId } from "../../features/createId";
import { Trash } from "lucide-react";
import {
  useTierListDrop,
  type TierListDragData,
} from "./CreateDndWrapper";

function isPointerInside(
  element: HTMLElement | null,
  input: { clientX: number; clientY: number },
) {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  return (
    input.clientX >= rect.left &&
    input.clientX <= rect.right &&
    input.clientY >= rect.top &&
    input.clientY <= rect.bottom
  );
}

export default function AddAndDelete() {
  const [, setPoolItems] = useAtom(imagePoolItemsAtom);
  const [isPresentationMode] = useAtom(isPresentationModeAtom);
  const [isDragging, setIsDragging] = useState(false);
  const [isOverDelete, setIsOverDelete] = useState(false);
  const deleteRef = useRef<HTMLDivElement>(null);
  const { onTierListDrop } = useTierListDrop();

  useEffect(() => {
    const el = deleteRef.current;
    if (!el) return;
    return dropTargetForElements({
      element: el,
      getData: () => ({ type: "delete" as const }),
      getDropEffect: () => "move",
      canDrop: ({ source }) =>
        source.data?.type === "pool" || source.data?.type === "row",
    });
  }, []);

  useEffect(() => {
    return monitorForElements({
      canMonitor: ({ source }) =>
        source.data?.type === "pool" || source.data?.type === "row",
      onDrag: ({ location }) => {
        setIsOverDelete(
          isPointerInside(deleteRef.current, location.current.input),
        );
      },
      onDrop: ({ source, location }) => {
        const shouldDelete = isPointerInside(
          deleteRef.current,
          location.current.input,
        );
        setIsOverDelete(false);
        const sourceData = source.data as TierListDragData | undefined;
        if (
          shouldDelete &&
          (sourceData?.type === "pool" || sourceData?.type === "row")
        ) {
          onTierListDrop(sourceData, { type: "delete" });
        }
      },
    });
  }, [onTierListDrop]);

  const processFiles = (files: FileList) => {
    const items = Array.from(files).map((file) => ({
      id: createId(),
      url: URL.createObjectURL(file),
    }));
    setPoolItems((previousItems) => [...previousItems, ...items]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) processFiles(files);
    e.currentTarget.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    const isFile = e.dataTransfer.types.includes("Files");
    const isFromPool = e.dataTransfer.types.includes("text/plain");
    if (isFile && !isFromPool) {
      e.preventDefault();
      setIsDragging(true);
    } else {
      setIsDragging(false);
    }
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDeleteDragOver = (event: React.DragEvent) => {
    if (!event.dataTransfer.types.includes("text/plain")) return;
    event.preventDefault();
    setIsOverDelete(true);
  };

  return (
    <Activity mode={isPresentationMode ? "hidden" : "visible"}>
      <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(12rem,1fr)]">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex min-h-28 items-center justify-center rounded-lg border border-dashed transition-colors
                ${
                  isDragging
                    ? "border-amber-300 bg-amber-300/10"
                    : "border-zinc-700 bg-zinc-900/40 hover:border-zinc-600 hover:bg-zinc-900"
                }`}
        >
          <label className="flex min-h-28 w-full items-center justify-center px-5 text-center">
            <div>
              <p className="text-sm font-medium text-zinc-300">
                {isDragging
                  ? "Drop images to add"
                  : "Choose images or drag them here"}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                PNG, JPG, GIF, or WebP
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              multiple
              accept="image/*"
              onChange={handleFileInput}
            />
          </label>
        </div>

        <div
          ref={deleteRef}
          onDragOver={handleDeleteDragOver}
          className={`flex min-h-28 items-center justify-center rounded-lg border border-dashed transition-colors ${
            isOverDelete
              ? "border-red-400 bg-red-400/10"
              : "border-zinc-700 bg-zinc-900/40 hover:border-red-400/60 hover:bg-red-400/5"
          }`}
        >
          <div className="flex items-center gap-2 px-4 text-center">
            <Trash
              className={isOverDelete ? "text-red-300" : "text-zinc-500"}
              size={17}
            />
            <p
              className={`text-sm font-medium ${
                isOverDelete ? "text-red-200" : "text-zinc-400"
              }`}
            >
              {isOverDelete ? "Release to delete" : "Drop to delete"}
            </p>
          </div>
        </div>
      </div>
    </Activity>
  );
}
