"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CustomSettings from "./buttons/CustomSettings";
import TierListConfig from "../create/TierListConfig";
import { useAtom } from "jotai";
import { isPresentationModeAtom } from "../../features/atoms";
import Image from "next/image";
import { Activity } from "react";

export default function TopNav() {
  const [isPresentationMode] = useAtom(isPresentationModeAtom);
  const pathname = usePathname();
  const isCreatePage = pathname === "/create";
  const hideNav = isPresentationMode && pathname === "/create";
  const sourceUrl =
    process.env.NEXT_PUBLIC_SOURCE_URL ??
    "https://github.com/edenmon/MixTiers";

  return (
    <Activity mode={hideNav ? "hidden" : "visible"}>
      <nav className="sticky top-0 z-40 flex h-16 w-full items-center border-b border-zinc-800 bg-zinc-950 px-4 text-white sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-semibold text-zinc-100 transition-colors hover:text-amber-200"
        >
          <span
            className="flex size-7 items-center justify-center rounded-md bg-amber-300 text-xs font-black text-zinc-950"
            aria-hidden
          >
            M
          </span>
          MixTiers
        </Link>

        <div className="ml-auto flex items-center gap-1">
          <Activity mode={isCreatePage ? "visible" : "hidden"}>
            <CustomSettings />
          </Activity>
          <TierListConfig />
          <Link
            href="https://x.com/aydnmon"
            className="wrapper"
            target="_blank"
            rel="noopener noreferrer"
            title="My Twitter"
            aria-label="My X profile"
          >
            <Image src="/x.svg" alt="" width={22} height={22} />
          </Link>
          <Link
            href={sourceUrl}
            className="wrapper"
            target="_blank"
            rel="noopener noreferrer"
            title="Source code"
            aria-label="Source code"
          >
            <Image src="/github.svg" alt="" width={22} height={22} />
          </Link>
        </div>
      </nav>
    </Activity>
  );
}
