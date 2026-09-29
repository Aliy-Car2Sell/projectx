import { highlightRanges } from "./groupRecords";

/** `text` with the words of the notebook search marked (plain text when there is no search). */
export function Highlight({ text, q }: { text: string; q?: string }) {
  const ranges = q ? highlightRanges(text, q) : [];
  if (!ranges.length) return <>{text}</>;
  const out: React.ReactNode[] = [];
  let at = 0;
  for (const [start, end] of ranges) {
    if (start > at) out.push(text.slice(at, start));
    out.push(
      <mark key={start} className="rounded-sm bg-warning-soft px-0.5 text-heading ring-1 ring-warning/40">
        {text.slice(start, end)}
      </mark>,
    );
    at = end;
  }
  if (at < text.length) out.push(text.slice(at));
  return <>{out}</>;
}
