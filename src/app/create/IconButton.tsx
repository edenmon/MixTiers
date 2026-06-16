import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  ariaLabel?: string;
  buttonTitle?: string;
};

export default function IconButton({
  children,
  ariaLabel,
  buttonTitle,
  className,
  ...buttonProps
}: IconButtonProps) {
  return (
    <button
      aria-label={ariaLabel}
      title={buttonTitle}
      className={[
        "flex size-9 shrink-0 items-center justify-center rounded-md border border-transparent text-zinc-400 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100 active:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
