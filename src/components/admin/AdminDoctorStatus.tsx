"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Ban, ShieldCheck } from "lucide-react";
import type { DoctorStatus } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { DoctorStatusBadge } from "@/components/ui/StatusBadge";
import { Toast } from "@/components/ui/Toast";

/** Block / unblock card on the admin doctor page (state lives in the session only). */
export function AdminDoctorStatus({ doctor }: { doctor: { id: string; name: string; status: DoctorStatus } }) {
  const t = useTranslations("admin.doctors");
  const tc = useTranslations("common");
  const [status, setStatus] = useState<DoctorStatus>(doctor.status);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const show = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <Card className="lg:sticky lg:top-20">
      <CardHeader title={t("statusTitle")} subtitle={t("statusHint")} action={<DoctorStatusBadge status={status} />} />
      {status === "blocked" ? (
        <Button
          fullWidth
          variant="secondary"
          icon={<ShieldCheck className="h-4 w-4" />}
          onClick={() => {
            setStatus("approved");
            show(t("unblocked"));
          }}
        >
          {t("unblock")}
        </Button>
      ) : (
        <Button fullWidth variant="danger" icon={<Ban className="h-4 w-4" />} disabled={status !== "approved"} onClick={() => setConfirmOpen(true)}>
          {t("block")}
        </Button>
      )}

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t("blockTitle")}
        closeLabel={tc("close")}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirmOpen(false);
                setStatus("blocked");
                show(t("blocked"));
              }}
            >
              {t("block")}
            </Button>
          </>
        }
      >
        <p className="text-[15px] text-heading">{t("blockDesc", { name: doctor.name })}</p>
      </Modal>

      <Toast message={toast} />
    </Card>
  );
}
