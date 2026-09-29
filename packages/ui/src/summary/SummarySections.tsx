import type { SummarySection } from "@projectx/types";
import { cn } from "@projectx/utils";
import { Highlight } from "../records/Highlight";

/** A structured summary: each part on its own line(s), its title in bold. */
export function SummarySections({ sections, highlight, className }: { sections: SummarySection[]; highlight?: string; className?: string }) {
  return (
    <span className={cn("flex flex-col gap-1.5", className)}>
      {sections.map((s) => (
        <span key={s.title} className="block whitespace-pre-line leading-relaxed text-heading/90">
          <span className="font-bold text-heading">
            <Highlight text={s.title} q={highlight} />:
          </span>{" "}
          <Highlight text={s.body} q={highlight} />
        </span>
      ))}
    </span>
  );
}
