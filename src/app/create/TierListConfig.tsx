"use client";
import { useState, Activity } from "react";
import type {
  RowGap,
  BorderStyle,
  TextColor,
} from "../../features/types/index";
import { useAtom } from "jotai";
import {
  tierListSettingsAtom,
  isTierListSettingsOpenAtom,
} from "../../features/atoms";
import {
  CHECKBOX_STYLE,
  LABEL_STYLE,
  SELECT_STYLE,
} from "./TierListConfig.style";

export default function TierListConfig() {
  const [settings, setSettings] = useAtom(tierListSettingsAtom);
  const [isOpen, setIsOpen] = useAtom(isTierListSettingsOpenAtom);
  const [draft, setDraft] = useState(settings);

  function cancel() {
    setDraft(settings);
    setIsOpen(false);
  }

  function save() {
    setSettings(draft);
    setIsOpen(false);
  }

  return (
    <Activity mode={isOpen ? "visible" : "hidden"}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <button
          type="button"
          className="absolute inset-0 cursor-default bg-black/70"
          onClick={cancel}
          aria-label="Close tier list settings"
        />
        <div
          className="relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-lg border border-zinc-500 bg-zinc-900 p-5 shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tier-settings-title"
        >
          <h3
            id="tier-settings-title"
            className="text-lg font-semibold text-zinc-100"
          >
            Tier list settings
          </h3>

          <label className={LABEL_STYLE}>Gap</label>
          <select
            value={draft.rowGap}
            onChange={(e) =>
              setDraft({ ...draft, rowGap: e.target.value as RowGap })
            }
            className={SELECT_STYLE}
          >
            <option value="none">none</option>
            <option value="small">small</option>
            <option value="medium">medium</option>
            <option value="large">large</option>
          </select>
          <label className={LABEL_STYLE}>Border style</label>
          <select
            value={draft.borderStyle}
            onChange={(e) =>
              setDraft({
                ...draft,
                borderStyle: e.target.value as BorderStyle,
              })
            }
            className={SELECT_STYLE}
          >
            <option value="none">none</option>
            <option value="dashed">dashed</option>
            <option value="solid">solid</option>
          </select>
          <label className={LABEL_STYLE}>Text color</label>
          <select
            value={draft.textColor}
            onChange={(e) =>
              setDraft({
                ...draft,
                textColor: e.target.value as TextColor,
              })
            }
            className={SELECT_STYLE}
          >
            <option value="black">black</option>
            <option value="white">white</option>
          </select>

          <div className="mt-5 space-y-3 border-t border-zinc-800 pt-4">
            <label className="flex items-center gap-3 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={draft.matchRowBackgroundToLabel}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    matchRowBackgroundToLabel: e.target.checked,
                  })
                }
                className={CHECKBOX_STYLE}
              />
              Match row background to label color
            </label>
            <label className="flex items-center gap-3 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={draft.roundedRows}
                onChange={(e) =>
                  setDraft({ ...draft, roundedRows: e.target.checked })
                }
                className={CHECKBOX_STYLE}
              />
              Rounded corners
            </label>
            <label className="flex items-center gap-3 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={draft.boldLabels}
                onChange={(e) =>
                  setDraft({ ...draft, boldLabels: e.target.checked })
                }
                className={CHECKBOX_STYLE}
              />
              Bold text
            </label>
            <label className="flex items-center gap-3 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={draft.spaceBetweenImages}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    spaceBetweenImages: e.target.checked,
                  })
                }
                className={CHECKBOX_STYLE}
              />
              Add spacing between images
            </label>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={cancel}
              className="h-9 rounded-md px-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
            >
              Cancel
            </button>
            <button
              onClick={save}
              className="h-9 rounded-md bg-amber-300 px-4 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-200"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </Activity>
  );
}
