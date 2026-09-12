import { Inbox, AlertTriangle } from "lucide-react";
import { cn } from "@projectx/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  compact,
}: {
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
        "flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-line bg-card/60",
        compact ? "px-4 py-6" : "px-6 py-12",
        className,
      )}
    >
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
        {icon ?? <Inbox className="h-7 w-7" />}
      </div>
      <h3 className="text-base font-bold text-heading">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-xl border border-danger/30 bg-danger-soft/40 px-6 py-10",
        className,
      )}
    >
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-danger-soft text-danger">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h3 className="text-base font-bold text-heading">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
