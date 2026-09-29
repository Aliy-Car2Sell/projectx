import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { cn } from "@projectx/utils";

/** Top of a page: the title, a line about it, and on the right what can be done here. */
export function PageHeader({
  title,
  subtitle,
  actions,
  backHref,
  backLabel,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  className?: string;
}) {
  const tc = useTranslations("common");
  return (
    <div className={cn("mb-5 md:mb-8", className)}>
      {backHref && (
        <Link
          href={backHref}
          className="-ml-1 mb-2 inline-flex min-h-[32px] items-center gap-1.5 rounded-pill px-1 text-sm font-medium text-muted transition-colors hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" /> {backLabel ?? tc("back")}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <h1 className="text-h2 md:text-h1 text-primary-900">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm md:text-base text-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}

/** Title of a section inside a page, with an optional line under it and an action on the right. */
export function SectionHeader({
  children,
  description,
  action,
  className,
}: {
  children: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-3 mb-3 mt-1", className)}>
      <div className="min-w-0">
        <h2 className="text-lg md:text-h3 font-bold text-heading">{children}</h2>
        {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** The older name of SectionHeader. */
export const SectionTitle = SectionHeader;
