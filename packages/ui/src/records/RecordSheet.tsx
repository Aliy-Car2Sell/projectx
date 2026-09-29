import { cn } from "@projectx/utils";

/**
 * The white "sheet of paper" the medical record is written on: centred on desktop, full width on mobile.
 * On a phone it bleeds over the page's 20px gutter and keeps 16px inside: a lab table with its norms needs the width.
 */
export function RecordSheet({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("record-sheet mx-auto w-full max-w-[800px] bg-card md:rounded-xs md:border md:border-neutral-200/70 md:shadow-md max-md:-mx-5 max-md:w-auto px-4 py-6 md:px-12 md:py-10", className)}>
      {children}
    </div>
  );
}
