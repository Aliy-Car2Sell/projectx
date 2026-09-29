import { cn } from "@projectx/utils";
import { Illustration, type IllustrationName } from "../illustrations";
import { IconBox } from "./IconBox";

/**
 * Nothing to show: an illustration, a title, a sentence and (when there is a way out) a button.
 * `icon` is the older way of calling it and still works; new code names an illustration.
 */
export function EmptyState({
  illustration,
  icon,
  title,
  description,
  action,
  className,
  compact,
}: {
  illustration?: IllustrationName;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-lg border border-dashed border-neutral-300 bg-card/70",
        compact ? "px-5 py-6" : "px-6 py-10 md:py-12",
        className,
      )}
    >
      {illustration || !icon ? (
        <Illustration name={illustration ?? "records"} width={compact ? 112 : 160} className={compact ? "mb-2" : "mb-4"} />
      ) : (
        <IconBox size="xl" className="mb-4">
          {icon}
        </IconBox>
      )}
      <h3 className={cn("text-heading", compact ? "text-base font-bold" : "text-h3")}>{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title,
  description,
  action,
  className,
  illustration = "error",
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  illustration?: IllustrationName;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-lg border border-neutral-200/70 bg-card px-6 py-10 shadow-sm",
        className,
      )}
    >
      <Illustration name={illustration} className="mb-4" />
      <h3 className="text-h3 text-heading">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
