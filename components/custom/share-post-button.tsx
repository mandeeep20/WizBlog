"use client";

import { type ReactNode, useState } from "react";

import { cn } from "@/lib/utils";

type SharePostButtonProps = {
  path: string;
  icon: ReactNode;
  disabled?: boolean;
};

export function SharePostButton({ path, icon, disabled = false }: SharePostButtonProps) {
  const [label, setLabel] = useState("Share");

  async function handleClick() {
    if (disabled) {
      return;
    }

    const shareUrl = typeof window === "undefined" ? path : new URL(path, window.location.origin).toString();

    try {
      await navigator.clipboard.writeText(shareUrl);
      setLabel("Copied");
      window.setTimeout(() => setLabel("Share"), 1500);
    } catch {
      setLabel("Failed");
      window.setTimeout(() => setLabel("Share"), 1500);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-medium",
        disabled
          ? "cursor-not-allowed bg-slate-100 text-slate-400"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
