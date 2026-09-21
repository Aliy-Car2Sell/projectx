"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Ban, ExternalLink, Search, ShieldCheck, Stethoscope } from "lucide-react";
import type { DoctorProfile } from "@projectx/types";
import { Avatar } from "@projectx/ui/Avatar";
import { Button } from "@projectx/ui/Button";
import { EmptyState } from "@projectx/ui/EmptyState";
import { Input } from "@projectx/ui/Input";
import { Modal } from "@projectx/ui/Modal";
import { StarRating } from "@projectx/ui/StarRating";
import { DoctorStatusBadge } from "@projectx/ui/StatusBadge";
import { Toast } from "@projectx/ui/Toast";
import { DataList } from "./DataList";

export function AdminDoctors({ doctors: initial }: { doctors: DoctorProfile[] }) {
  const t = useTranslations("admin.doctors");
  const tc = useTranslations("common");
  const ta = useTranslations("admin.applications");
  const ts = useTranslations("specialties");
  const tcity = useTranslations("cities");
  const [q, setQ] = useState("");
  const [doctors, setDoctors] = useState(initial);
  const [target, setTarget] = useState<DoctorProfile | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return doctors.filter((d) => !s || `${d.firstName} ${d.lastName} ${d.clinicName} ${ts(d.specialty)}`.toLowerCase().includes(s));
  }, [doctors, q, ts]);

  const name = (d: DoctorProfile) => `${d.firstName} ${d.lastName}`;
  const show = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2500);
  };
  const toggle = (d: DoctorProfile) => {
    const next = d.status === "blocked" ? "approved" : "blocked";
    setDoctors((all) => all.map((x) => (x.id === d.id ? { ...x, status: next } : x)));
    show(next === "blocked" ? t("blocked") : t("unblocked"));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <Input wrapperClassName="flex-1 min-w-0" placeholder={t("searchPlaceholder")} value={q} onChange={(e) => setQ(e.target.value)} leftIcon={<Search className="h-4 w-4" />} type="search" />
        <span className="text-sm text-muted shrink-0">{t("found", { count: rows.length })}</span>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={<Stethoscope className="h-7 w-7" />} title={t("noDoctors")} description={t("noDoctorsDesc")} />
      ) : (
        <DataList
          rows={rows}
          keyOf={(d) => d.id}
          columns={[
            {
              key: "doctor",
              header: tc("name"),
              render: (d) => (
                <div className="flex items-center gap-3">
                  <Avatar src={d.avatarUrl} name={name(d)} size="sm" />
                  <div>
                    <div className="font-semibold text-heading">{name(d)}</div>
                    <div className="text-xs text-muted">{d.clinicName}</div>
                  </div>
                </div>
              ),
            },
            { key: "specialty", header: ta("specialty"), render: (d) => ts(d.specialty) },
            { key: "city", header: tc("city"), render: (d) => tcity(d.city) },
            { key: "rating", header: t("rating"), render: (d) => <StarRating value={d.rating} size="xs" showValue count={d.reviewCount} /> },
            { key: "status", header: tc("status"), render: (d) => <DoctorStatusBadge status={d.status} /> },
          ]}
          actions={(d) => (
            <div className="inline-flex gap-1">
              <Button href={`/admin/doctors/${d.id}`} variant="ghost" size="sm" icon={<ExternalLink className="h-4 w-4" />}>
                {t("viewProfile")}
              </Button>
              {d.status === "blocked" ? (
                <Button variant="secondary" size="sm" icon={<ShieldCheck className="h-4 w-4" />} onClick={() => toggle(d)}>
                  {t("unblock")}
                </Button>
              ) : (
                <Button variant="ghost" size="sm" className="text-danger" icon={<Ban className="h-4 w-4" />} onClick={() => setTarget(d)}>
                  {t("block")}
                </Button>
              )}
            </div>
          )}
          mobileCard={(d) => (
            <div className="flex items-start gap-3">
              <Avatar src={d.avatarUrl} name={name(d)} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-heading truncate">{name(d)}</span>
                  <DoctorStatusBadge status={d.status} />
                </div>
                <div className="text-sm text-primary-text">{ts(d.specialty)}</div>
                <div className="text-xs text-muted">
                  {d.clinicName} · {tcity(d.city)}
                </div>
                <div className="mt-1">
                  <StarRating value={d.rating} size="xs" showValue count={d.reviewCount} />
                </div>
              </div>
            </div>
          )}
        />
      )}

      <Modal
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        title={t("blockTitle")}
        closeLabel={tc("close")}
        footer={
          <>
            <Button variant="ghost" onClick={() => setTarget(null)}>
              {tc("cancel")}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (target) toggle(target);
                setTarget(null);
              }}
            >
              {t("block")}
            </Button>
          </>
        }
      >
        <p className="text-base md:text-[15px] text-heading">{target && t("blockDesc", { name: name(target) })}</p>
      </Modal>

      <Toast message={toast} />
    </div>
  );
}
