"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, CheckCircle2, X, XCircle } from "lucide-react";
import type { DoctorStatus } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { DoctorStatusBadge } from "@/components/ui/StatusBadge";

export function ApplicationDecision({ initialStatus }: { initialStatus: DoctorStatus }) {
  const t = useTranslations("admin.applications");
  const tc = useTranslations("common");
  const [status, setStatus] = useState<DoctorStatus>(initialStatus);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const show = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <Card className="lg:sticky lg:top-20">
      <CardHeader title={t("decision")} subtitle={t("decisionHint")} action={<DoctorStatusBadge status={status} />} />
      {status === "approved" ? (
        <div className="flex items-center gap-2 rounded-lg bg-success-soft px-3 py-2 text-sm text-green-700">
          <CheckCircle2 className="h-5 w-5" /> {t("approved")}
        </div>
      ) : status === "rejected" ? (
        <div className="flex items-start gap-2 rounded-lg bg-danger-soft px-3 py-2 text-sm text-red-700">
          <XCircle className="h-5 w-5 shrink-0" />
          <div>
            {t("rejectedToast")}
            {reason && <div className="mt-1 text-xs text-red-800/80">«{reason}»</div>}
          </div>
        </div>
      ) : null}
      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <Button
          fullWidth
          icon={<Check className="h-4 w-4" />}
          disabled={status === "approved"}
          onClick={() => {
            setStatus("approved");
            show(t("approved"));
          }}
        >
          {t("approve")}
        </Button>
        <Button fullWidth variant="danger" icon={<X className="h-4 w-4" />} disabled={status === "rejected"} onClick={() => setRejectOpen(true)}>
          {t("reject")}
        </Button>
      </div>

      <Modal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title={t("rejectTitle")}
        closeLabel={tc("close")}
        footer={
          <>
            <Button variant="ghost" onClick={() => setRejectOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button
              variant="danger"
              disabled={reason.trim().length < 5}
              onClick={() => {
                setRejectOpen(false);
                setStatus("rejected");
                show(t("rejectedToast"));
              }}
            >
              {t("rejectConfirm")}
            </Button>
          </>
        }
      >
        <Textarea label={t("rejectReason")} placeholder={t("rejectReasonPlaceholder")} value={reason} onChange={(e) => setReason(e.target.value)} rows={4} />
      </Modal>

      {toast && <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-heading text-white px-4 py-2.5 text-sm shadow-lg">{toast}</div>}
    </Card>
  );
}
