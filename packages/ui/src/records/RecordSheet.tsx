import { cn } from "@projectx/utils";

/** The white "sheet of paper" the medical record is written on: centred on desktop, full width on mobile. */
export function RecordSheet({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("record-sheet mx-auto w-full max-w-[800px] bg-card md:rounded-sm md:shadow-[0_1px_3px_rgba(16,24,40,.08),0_12px_32px_-12px_rgba(16,24,40,.18)] max-md:-mx-4 max-md:w-auto px-4 py-5 md:px-12 md:py-10", className)}>
      {children}
    </div>
  );
}
