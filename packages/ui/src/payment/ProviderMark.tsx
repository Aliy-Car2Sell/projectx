import type { PaymentMethod } from "@projectx/types";

export const providers: PaymentMethod[] = ["payme", "click"];
export const providerName: Record<PaymentMethod, string> = { payme: "Payme", click: "Click" };

/**
 * Placeholder mark for a payment provider: a neutral tile with a generic glyph.
 * Deliberately not the provider's logo or colours; the real assets come with the integration.
 */
export function ProviderMark({ provider, className }: { provider: PaymentMethod; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label={providerName[provider]} fill="none">
      <rect x="1" y="1" width="30" height="30" rx="8" className="fill-surface stroke-line" strokeWidth="1.5" />
      {provider === "payme" ? (
        // a card
        <>
          <rect x="7" y="10" width="18" height="12" rx="2.5" className="stroke-heading" strokeWidth="1.8" />
          <path d="M7 14.5h18" className="stroke-heading" strokeWidth="1.8" />
          <path d="M10.5 18.5h4" className="stroke-muted" strokeWidth="1.8" strokeLinecap="round" />
        </>
      ) : (
        // a pointer tap
        <>
          <circle cx="16" cy="16" r="3" className="fill-heading" />
          <circle cx="16" cy="16" r="7.5" className="stroke-muted" strokeWidth="1.8" strokeDasharray="3 3.2" />
        </>
      )}
    </svg>
  );
}
