"use client";
import { Settings } from "lucide-react";
import { useAtom } from "jotai";
import { isTierListSettingsOpenAtom } from "@/src/features/atoms";
export default function CustomSettings() {
  const [, setIsOpen] = useAtom(isTierListSettingsOpenAtom);
  return (
    <button
      className="wrapper"
      onClick={() => setIsOpen(true)}
      aria-label="Open tier list settings"
      title="Tier list settings"
    >
      <Settings className="size-6" />
    </button>
  );
}
