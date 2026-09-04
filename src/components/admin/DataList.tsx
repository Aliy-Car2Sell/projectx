import { cn } from "@/lib/utils";

export type Column<T> = {
  key: string;
  header: React.ReactNode;
  render: (row: T) => React.ReactNode;
  className?: string;
};

/**
 * Responsive data list: a real table on md+ and stacked cards below md
 * (no horizontal scrolling on phones).
 */
export function DataList<T>({
  rows,
  columns,
  keyOf,
  mobileCard,
  actions,
  className,
}: {
  rows: T[];
  columns: Column<T>[];
  keyOf: (row: T) => string;
  mobileCard: (row: T) => React.ReactNode;
  actions?: (row: T) => React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {/* Desktop table */}
      <div className="hidden md:block bg-card rounded-xl shadow-card border border-line/60 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={cn("px-4 py-3 font-semibold", c.className)}>
                  {c.header}
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-right" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={keyOf(r)} className="hover:bg-surface/60">
                {columns.map((c) => (
                  <td key={c.key} className={cn("px-4 py-3 align-middle", c.className)}>
                    {c.render(r)}
                  </td>
                ))}
                {actions && <td className="px-4 py-3 text-right whitespace-nowrap">{actions(r)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {rows.map((r) => (
          <div key={keyOf(r)} className="bg-card rounded-xl shadow-card border border-line/60 p-4 flex flex-col gap-3">
            {mobileCard(r)}
            {actions && <div className="flex flex-wrap gap-2 border-t border-line pt-3">{actions(r)}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
