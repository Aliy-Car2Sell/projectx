"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, CheckCircle2, Trash2, X, XCircle } from "lucide-react";
import type { MedicalRecord, RecordAuditEntry, User } from "@projectx/types";
import { cn } from "@projectx/utils";
import { Button } from "@projectx/ui/Button";
import { Card, CardHeader } from "@projectx/ui/Card";
import { FieldLabel, Textarea } from "@projectx/ui/Input";
import { Modal } from "@projectx/ui/Modal";
import { RecordStatusBadge } from "@projectx/ui/StatusBadge";
import { Toast, useToast } from "@projectx/ui/Toast";
import { RecordHistory } from "@projectx/ui/records/RecordHistory";
import { useRecordAudit } from "@projectx/ui/records/audit";
import { useLocalRecords } from "@projectx/ui/records/useLocalRecords";

/** Ready-made rejection reasons; "other" needs the free text, the rest may add it. */
const reasonKeys = ["notMedical", "unreadable", "otherPerson", "other"] as const;
type ReasonKey = (typeof reasonKeys)[number];

/**
 * Approve / reject a patient upload, with the entry's history underneath. The decision is kept in
 * this browser (there is no backend yet) and goes into the audit trail.
 */
export function RecordDecision({ record: mock, admin, audit }: { record: MedicalRecord; admin: User; audit: RecordAuditEntry[] }) {
  const t = useTranslations("admin.records");
  const tc = useTranslations("common");
  const mockList = useMemo(() => [mock], [mock]);
  const { merged, save } = useLocalRecords(mock.patientId, mockList);
  const record = merged.find((r) => r.id === mock.id) ?? mock;
  const { historyOf, log } = useRecordAudit(audit);
  const actor = { id: admin.id, role: "admin" as const, name: `${admin.firstName} ${admin.lastName}` };
  const { status } = record;
  const reason = record.rejectReason ?? "";
  const deleted = status === "deleted";
  const [rejectOpen, setRejectOpen] = useState(false);
  const [chip, setChip] = useState<ReasonKey | null>(null);
  const [custom, setCustom] = useState("");
  const { toast, show } = useToast(3000);

  const customOk = custom.trim().length >= 5;
  const canReject = chip !== null && (chip !== "other" || customOk);
  const composedReason = () => {
    const head = chip && chip !== "other" ? t(`reasons.${chip}`) : "";
    const tail = custom.trim();
    return [head, tail].filter(Boolean).join(". ");
  };

  return (
    <div className="flex flex-col gap-4 lg:sticky lg:top-20">
      <Card>
        <CardHeader title={t("decision")} subtitle={t("decisionHint")} action={<RecordStatusBadge status={status} />} />
        {status === "approved" ? (
          <div className="flex items-center gap-2 rounded-lg bg-success-soft px-3 py-2 text-sm text-green-700">
            <CheckCircle2 className="h-5 w-5" /> {t("approvedNote")}
          </div>
        ) : status === "rejected" ? (
          <div className="flex items-start gap-2 rounded-lg bg-danger-soft px-3 py-2 text-sm text-red-700">
            <XCircle className="h-5 w-5 shrink-0" />
            <div>
              {t("rejectedNote")}
              {reason && <div className="mt-1 text-xs text-red-800/80">«{reason}»</div>}
            </div>
          </div>
        ) : deleted ? (
          <div className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-sm text-muted">
            <Trash2 className="h-5 w-5 shrink-0" /> {t("deletedNote")}
          </div>
        ) : null}
        <div className={cn("mt-4 flex flex-col gap-2 sm:flex-row", deleted && "hidden")}>
          <Button
            fullWidth
            icon={<Check className="h-4 w-4" />}
            disabled={status === "approved"}
            onClick={() => {
              save({ ...record, status: "approved", rejectReason: undefined });
              log(record.id, actor, "approved");
              show(t("approvedToast"));
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
                disabled={!canReject}
                onClick={() => {
                  const why = composedReason();
                  save({ ...record, status: "rejected", rejectReason: why });
                  log(record.id, actor, "rejected", [{ field: "rejectReason", from: "", to: why }]);
                  setRejectOpen(false);
                  show(t("rejectedToast"));
                }}
              >
                {t("rejectConfirm")}
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <div>
              <FieldLabel>{t("rejectReason")}</FieldLabel>
              <div className="mt-1.5 flex flex-wrap gap-2" role="radiogroup" aria-label={t("rejectReason")}>
                {reasonKeys.map((k) => (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={chip === k}
                    onClick={() => setChip(k)}
                    className={cn(
                      "min-h-[40px] rounded-full border px-3.5 text-sm font-medium transition-colors",
                      chip === k ? "border-danger bg-danger-soft text-red-700" : "border-line text-heading hover:border-danger",
                    )}
                  >
                    {t(`reasons.${k}`)}
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              label={chip === "other" ? t("reasonCustomRequired") : t("reasonCustom")}
              placeholder={t("reasonCustomPlaceholder")}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              rows={3}
              required={chip === "other"}
            />
            <p className="text-xs text-muted">{t("rejectHint")}</p>
          </div>
        </Modal>

        <Toast message={toast} />
      </Card>

      <Card>
        <CardHeader title={t("history")} subtitle={t("historyHint")} />
        <RecordHistory entries={historyOf(record.id)} variant="open" />
      </Card>
    </div>
  );
}
