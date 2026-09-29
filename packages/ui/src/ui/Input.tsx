"use client";

import { useId } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@projectx/utils";

/** Shared by Input, Textarea and Select: radius md, 2px primary-500 ring on focus, red in the error state. */
export const fieldBase =
  "w-full rounded-md border border-neutral-300 bg-card text-heading placeholder:text-neutral-500 transition-[border-color,box-shadow] hover:border-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 focus:outline-none disabled:bg-neutral-100 disabled:text-muted disabled:hover:border-neutral-300";
export const fieldError = "border-danger-500 hover:border-danger-500 focus:border-danger-500 focus:ring-danger-500";
const labelClass = "text-sm font-semibold text-neutral-800";

function FieldMessage({ id, error, hint }: { id: string; error?: string; hint?: string }) {
  if (error) {
    return (
      <p id={id} className="flex items-start gap-1.5 text-xs font-medium text-danger-700">
        <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
        {error}
      </p>
    );
  }
  if (hint) {
    return (
      <p id={id} className="text-xs text-neutral-500">
        {hint}
      </p>
    );
  }
  return null;
}

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightSlot?: React.ReactNode;
  wrapperClassName?: string;
};

export function Input({
  label,
  hint,
  error,
  leftIcon,
  rightSlot,
  className,
  wrapperClassName,
  id,
  ...rest
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-message`;
  return (
    <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
      {label && (
        <label htmlFor={inputId} className={labelClass}>
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          className={cn(
            fieldBase,
            "min-h-[48px] px-4 text-base",
            leftIcon && "pl-11",
            rightSlot && "pr-12",
            error && fieldError,
            className,
          )}
          {...rest}
        />
        {rightSlot && <span className="absolute right-1.5 top-1/2 -translate-y-1/2">{rightSlot}</span>}
      </div>
      <FieldMessage id={messageId} error={error} hint={hint} />
    </div>
  );
}

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Textarea({ label, hint, error, className, id, ...rest }: TextareaProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-message`;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className={labelClass}>
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? messageId : undefined}
        className={cn(fieldBase, "min-h-[112px] px-4 py-3 text-base resize-y", error && fieldError, className)}
        {...rest}
      />
      <FieldMessage id={messageId} error={error} hint={hint} />
    </div>
  );
}

export function FieldLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn(labelClass, className)}>{children}</span>;
}
