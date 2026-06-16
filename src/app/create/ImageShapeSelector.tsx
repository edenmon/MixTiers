"use client";
import { useAtom } from "jotai";
import { imageShapeAtom, isPresentationModeAtom } from "../../features/atoms";
import type { ImageShape } from "../../features/types/index.js";
import {
  Circle,
  CircleOff,
  RectangleHorizontal,
  RectangleVertical,
  Square,
} from "lucide-react";
import { Activity, type ReactNode } from "react";

const IMAGE_SHAPE_OPTIONS: Array<{
  id: ImageShape;
  label: string;
  icon: ReactNode;
}> = [
  { id: "original", label: "Original", icon: <CircleOff size={18} /> },
  { id: "square", label: "Square", icon: <Square size={18} /> },
  { id: "circle", label: "Circle", icon: <Circle size={18} /> },
  {
    id: "vertical",
    label: "Vertical",
    icon: <RectangleVertical size={18} />,
  },
  {
    id: "horizontal",
    label: "Horizontal",
    icon: <RectangleHorizontal size={18} />,
  },
];

export default function ImageShapeSelector() {
  const [imageShape, setImageShape] = useAtom(imageShapeAtom);
  const [isPresentationMode] = useAtom(isPresentationModeAtom);

  return (
    <Activity mode={isPresentationMode ? "hidden" : "visible"}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold uppercase text-zinc-500">
          Image shape
        </p>

        <div
          className="grid grid-cols-2 gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1 sm:flex"
          role="group"
          aria-label="Image shape"
        >
          {IMAGE_SHAPE_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => setImageShape(option.id)}
              aria-pressed={imageShape === option.id}
              className={`flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm transition-colors
                ${
                  imageShape === option.id
                    ? "bg-amber-300 text-zinc-950"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                }`}
            >
              {option.icon}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </Activity>
  );
}
