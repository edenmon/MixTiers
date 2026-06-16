import type { ImageShape } from "../../features/types";

const ITEMS_PER_ROW = 9;
const VERTICAL_ITEMS_PER_ROW = 11;
const HORIZONTAL_ITEMS_PER_ROW = 7;
const ROW_IMAGE_GAP = 8;
const POOL_IMAGE_GAP = 12;
const IMAGE_POOL_CHROME_WIDTH = 34;
const DEFAULT_ORIGINAL_IMAGE_WIDTH = 96;

const rowImageWidths: Record<ImageShape, number> = {
  original: DEFAULT_ORIGINAL_IMAGE_WIDTH,
  square: 96,
  circle: 96,
  vertical: 80,
  horizontal: 144,
};

const poolImageWidths: Record<ImageShape, number> = {
  original: DEFAULT_ORIGINAL_IMAGE_WIDTH,
  square: 96,
  circle: 96,
  vertical: 80,
  horizontal: 128,
};

function getLineWidth(
  imageShape: ImageShape,
  imageWidths: Record<ImageShape, number>,
  gap: number,
) {
  const imageWidth = imageWidths[imageShape];
  const itemsPerRow =
    imageShape === "vertical"
      ? VERTICAL_ITEMS_PER_ROW
      : imageShape === "horizontal"
        ? HORIZONTAL_ITEMS_PER_ROW
        : ITEMS_PER_ROW;
  return imageWidth * itemsPerRow + gap * (itemsPerRow - 1);
}

export function getTierRowsMaxWidth(
  imageShape: ImageShape,
  hasImageSpacing: boolean,
) {
  const lineWidth = getLineWidth(
    imageShape,
    rowImageWidths,
    hasImageSpacing ? ROW_IMAGE_GAP : 0,
  );

  return `min(100%, calc(var(--tier-label-width) + ${lineWidth}px))`;
}

export function getImagePoolMaxWidth(
  imageShape: ImageShape,
  hasImageSpacing: boolean,
) {
  const lineWidth = getLineWidth(
    imageShape,
    poolImageWidths,
    hasImageSpacing ? POOL_IMAGE_GAP : 0,
  );

  return `min(100%, ${lineWidth + IMAGE_POOL_CHROME_WIDTH}px)`;
}

export function getImagePoolSectionMaxWidth(
  imageShape: ImageShape,
  hasImageSpacing: boolean,
) {
  const lineWidth = getLineWidth(
    imageShape,
    poolImageWidths,
    hasImageSpacing ? POOL_IMAGE_GAP : 0,
  );

  return `min(100%, calc(${lineWidth + IMAGE_POOL_CHROME_WIDTH}px + var(--under-list-x-padding)))`;
}
