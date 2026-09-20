"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@projectx/utils";

const WIDTH = 260;
const GAP = 8;

/**
 * Small (i) hint. Hover or focus shows it on desktop; on touch a tap toggles it and a tap
 * anywhere else (or Escape) closes it. The bubble is fixed-positioned and clamped to the
 * viewport, so it never causes horizontal scroll on a 375px screen.
 */
export function Tooltip({ text, label, className }: { text: string; label: string; className?: string }) {
  const id = useId();
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; above: boolean } | null>(null);

  const open = () => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const width = Math.min(WIDTH, window.innerWidth - 2 * GAP);
    const left = Math.max(GAP, Math.min(r.left + r.width / 2 - width / 2, window.innerWidth - width - GAP));
    const above = r.top > 140;
    setPos({ left, top: above ? r.top - GAP : r.bottom + GAP, above });
  };
  const close = () => setPos(null);

  useEffect(() => {
    if (!pos) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && close();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
    };
  }, [pos]);

  return (
    <span
      ref={ref}
      className={cn("record-noprint relative inline-flex align-middle", className)}
      onPointerEnter={(e) => e.pointerType === "mouse" && open()}
      onPointerLeave={(e) => e.pointerType === "mouse" && close()}
    >
      <button
        type="button"
        aria-label={label}
        aria-expanded={pos !== null}
        aria-describedby={pos ? id : undefined}
        onClick={() => (pos ? close() : open())}
        onFocus={open}
        onBlur={close}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <Info className="h-4 w-4" />
      </button>
      {pos && (
        <span
          id={id}
          role="tooltip"
          style={{ left: pos.left, top: pos.top, width: Math.min(WIDTH, window.innerWidth - 2 * GAP) }}
          className={cn("fixed z-[60] rounded-lg bg-heading px-3 py-2 text-left text-sm font-normal normal-case leading-snug tracking-normal text-white shadow-lg", pos.above && "-translate-y-full")}
        >
          {text}
        </span>
      )}
    </span>
  );
}
