"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import type { AppointmentPayment, PaymentMethod } from "@projectx/types";
import { formatMoney } from "@projectx/utils";
import { Modal } from "../ui/Modal";
import { ProviderMark, providerName, providers } from "./ProviderMark";

const REDIRECT_MS = 2000;
const PAID_MS = 1200;

/** Choose a provider (with the amount above the buttons). */
export function ProviderButtons({ onPick, disabled }: { onPick: (p: PaymentMethod) => void; disabled?: boolean }) {
  const t = useTranslations("payment");
  return (
    <div className="grid grid-cols-2 gap-2">
      {providers.map((p) => (
        <button
          key={p}
          type="button"
          disabled={disabled}
          onClick={() => onPick(p)}
          aria-label={t("payWith", { provider: providerName[p] })}
          className="flex min-h-[52px] items-center justify-center gap-2 rounded-md border border-line bg-card px-3 font-semibold text-heading transition-colors hover:border-primary hover:bg-primary-soft/50 disabled:opacity-50"
        >
          <ProviderMark provider={p} className="h-7 w-7 shrink-0" />
          {providerName[p]}
        </button>
      ))}
    </div>
  );
}

/**
 * Mock online payment: "redirecting to <provider>…" for two seconds, then "paid", then `onPaid`.
 * No money moves and nothing leaves the browser. With no `provider` it first asks for one.
 * Closing the sheet before "paid" cancels the payment.
 */
export function PaymentSheet({
  open,
  amount,
  provider: preset,
  onPaid,
  onClose,
}: {
  open: boolean;
  amount: number;
  provider?: PaymentMethod;
  onPaid: (payment: AppointmentPayment) => void;
  onClose: () => void;
}) {
  const t = useTranslations("payment");
  const tc = useTranslations("common");
  const [picked, setPicked] = useState<PaymentMethod | null>(null);
  const [paid, setPaid] = useState(false);
  const provider = preset ?? picked;

  // A sheet that was closed starts over the next time it opens.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (!open) {
      setPicked(null);
      setPaid(false);
    }
  }

  useEffect(() => {
    if (!open || !provider || paid) return;
    const id = setTimeout(() => setPaid(true), REDIRECT_MS);
    return () => clearTimeout(id);
  }, [open, provider, paid]);

  useEffect(() => {
    if (!open || !provider || !paid) return;
    const id = setTimeout(() => onPaid({ status: "paid", amount, method: provider, paidAt: new Date().toISOString() }), PAID_MS);
    return () => clearTimeout(id);
  }, [open, provider, paid, amount, onPaid]);

  return (
    <Modal open={open} onClose={paid ? () => {} : onClose} title={t("title")} closeLabel={tc("close")}>
      <div className="flex flex-col items-center gap-3 pb-2 text-center" aria-live="polite">
        <div className="text-sm text-muted">{t("amount")}</div>
        <div className="-mt-2 text-2xl font-bold tabular-nums text-heading">{tc("sum", { value: formatMoney(amount) })}</div>

        {!provider ? (
          <div className="w-full">
            <ProviderButtons onPick={setPicked} />
          </div>
        ) : paid ? (
          <>
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-success">
              <CheckCircle2 className="h-9 w-9" />
            </span>
            <div className="text-lg font-bold text-heading">{t("paid")}</div>
          </>
        ) : (
          <>
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary-text">
              <Loader2 className="h-8 w-8 animate-spin" />
            </span>
            <div className="inline-flex items-center gap-2 font-semibold text-heading">
              <ProviderMark provider={provider} className="h-6 w-6" />
              {t("redirecting", { provider: providerName[provider] })}
            </div>
          </>
        )}

        <p className="inline-flex items-start gap-1.5 text-left text-xs text-muted">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {t("demoNote")}
        </p>
      </div>
    </Modal>
  );
}
