import { useTranslations } from "next-intl";
import type { AppointmentPayment, PaymentStatus } from "@projectx/types";
import { Badge, type BadgeTone } from "../ui/Badge";

const tone: Record<PaymentStatus, BadgeTone> = { paid: "success", unpaid: "warning", onsite: "neutral" };

/** "Paid" / "Not paid" / "Pays at the visit". Renders nothing for an appointment without a payment (no price). */
export function PaymentBadge({ payment, className }: { payment?: AppointmentPayment; className?: string }) {
  const t = useTranslations("payment.status");
  if (!payment) return null;
  return (
    <Badge tone={tone[payment.status]} className={className}>
      {t(payment.status)}
    </Badge>
  );
}
