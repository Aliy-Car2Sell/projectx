import { cn } from "@projectx/utils";

export type Column<T> = {
  key: string;
  header: React.ReactNode;
  render: (row: T) => React.ReactNode;
  className?: string;
};

/**
 * Responsive data list: a real table on md+ and stacked cards below md
 * (no horizontal scrolling on phones). Rows are told apart by the hover, not by zebra stripes.
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
      <div className="hidden md:block bg-card rounded-lg shadow-sm border border-neutral-200/70 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-line bg-neutral-50 text-left text-xs uppercase tracking-wider text-neutral-600">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={cn("px-2.5 py-3.5 first:pl-5 last:pr-5 font-semibold", c.className)}>
                  {c.header}
                </th>
              ))}
              {actions && <th className="px-2.5 py-3.5 first:pl-5 last:pr-5 text-right" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={keyOf(r)} className="transition-colors hover:bg-accent-50/60">
                {columns.map((c) => (
                  <td key={c.key} className={cn("px-2.5 py-3.5 first:pl-5 last:pr-5 align-middle", c.className)}>
                    {c.render(r)}
                  </td>
                ))}
                {actions && <td className="px-2.5 py-3.5 first:pl-5 last:pr-5 text-right whitespace-nowrap">{actions(r)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {rows.map((r) => (
          <div key={keyOf(r)} className="bg-card rounded-lg shadow-sm border border-neutral-200/70 p-4 flex flex-col gap-3">
            {mobileCard(r)}
            {actions && <div className="flex flex-wrap gap-2 border-t border-line pt-3">{actions(r)}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
