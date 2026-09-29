"use client";

import { useId } from "react";
import { AlertCircle, ChevronDown } from "lucide-react";
import { cn } from "@projectx/utils";
import { fieldBase, fieldError } from "./Input";

export type SelectOption = { value: string; label: string };
export type SelectGroup = { label: string; options: SelectOption[] };

export type SelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  label?: string;
  options?: SelectOption[];
  /** Options under headings (rendered after `options`); empty groups are skipped. */
  groups?: SelectGroup[];
  placeholder?: string;
  error?: string;
};

export function Select({ label, options = [], groups = [], placeholder, error, className, id, ...rest }: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-semibold text-neutral-800">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          aria-invalid={error ? true : undefined}
          className={cn(fieldBase, "appearance-none min-h-[48px] pl-4 pr-11 text-base", error && fieldError, className)}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
          {groups
            .filter((g) => g.options.length > 0)
            .map((g) => (
              <optgroup key={g.label} label={g.label}>
                {g.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </optgroup>
            ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
      </div>
      {error && (
        <p className="flex items-start gap-1.5 text-xs font-medium text-danger-700">
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
