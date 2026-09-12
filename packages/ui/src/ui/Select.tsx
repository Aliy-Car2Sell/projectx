"use client";

import { useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@projectx/utils";

export type SelectOption = { value: string; label: string };

export type SelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
};

export function Select({ label, options, placeholder, error, className, id, ...rest }: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-heading">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            "w-full appearance-none min-h-[44px] rounded-lg border border-line bg-card pl-3 pr-10 text-[15px] text-heading focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none",
            error && "border-danger",
            className,
          )}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
