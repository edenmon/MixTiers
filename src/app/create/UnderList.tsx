"use client";
import ImagePool from "./ImagePool";
import ImageShapeSelector from "./ImageShapeSelector";
import AddAndDelete from "./AddAndDelete";
import { useAtom } from "jotai";
import { imageShapeAtom, tierListSettingsAtom } from "../../features/atoms";
import { getImagePoolSectionMaxWidth } from "./imageLayout";

export default function UnderList() {
  const [imageShape] = useAtom(imageShapeAtom);
  const [settings] = useAtom(tierListSettingsAtom);

  return (
    <section
      className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 pt-5 [--under-list-x-padding:2rem] sm:px-6 sm:[--under-list-x-padding:3rem]"
      style={{
        maxWidth: getImagePoolSectionMaxWidth(
          imageShape,
          settings.spaceBetweenImages,
        ),
      }}
    >
      <ImageShapeSelector />
      <ImagePool />
      <AddAndDelete />
    </section>
  );
}
