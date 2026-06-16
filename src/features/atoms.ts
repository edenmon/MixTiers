import { atom } from "jotai";
import type {
  ImageShape,
  TierRow,
  TierListItem,
  TierListSettings,
} from "./types/index.js";
const imagePoolItemsAtom = atom<TierListItem[]>([]);
const imageShapeAtom = atom<ImageShape>("square");
const tierListSettingsAtom = atom<TierListSettings>({
  rowGap: "none",
  boldLabels: false,
  textColor: "black",
  matchRowBackgroundToLabel: false,
  roundedRows: false,
  spaceBetweenImages: false,
  borderStyle: "none",
});
const isTierListSettingsOpenAtom = atom(false);
const isPresentationModeAtom = atom<boolean>(false);

const DEFAULT_TIER_ROWS: TierRow[] = [
  { id: "row-s", label: "S", color: "bg-[#e51f1f]" },
  { id: "row-a", label: "A", color: "bg-[#f2a134]" },
  { id: "row-b", label: "B", color: "bg-[#f7e379]" },
  { id: "row-c", label: "C", color: "bg-[#bbdb44]" },
  { id: "row-d", label: "D", color: "bg-[#44ce1b]" },
];
const tierRowsAtom = atom<TierRow[]>(DEFAULT_TIER_ROWS);

/** Which images are in which row; key = row.id. */
const itemsByRowIdAtom = atom<Record<string, TierListItem[]>>({});

export {
  imagePoolItemsAtom,
  imageShapeAtom,
  tierListSettingsAtom,
  isTierListSettingsOpenAtom,
  tierRowsAtom,
  itemsByRowIdAtom,
  isPresentationModeAtom,
};
