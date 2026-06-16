type ImageShape =
  | "original"
  | "square"
  | "circle"
  | "vertical"
  | "horizontal";

type TierRow = {
  id: string;
  label: string;
  color: string;
};

type TierListItem = {
  id: string;
  url: string;
};

type TierListSettings = {
  rowGap: RowGap;
  textColor: TextColor;
  matchRowBackgroundToLabel: boolean;
  roundedRows: boolean;
  boldLabels: boolean;
  spaceBetweenImages: boolean;
  borderStyle: BorderStyle;
};

type RowGap = "none" | "small" | "medium" | "large";
type TextColor = "white" | "black";
type BorderStyle = "dashed" | "solid" | "none";

export type {
  ImageShape,
  TierRow,
  TierListItem,
  TierListSettings,
  RowGap,
  TextColor,
  BorderStyle,
};
