"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { FileCheck2, FileText } from "lucide-react";
import type { DoctorProfile } from "@projectx/types";
import { fmtDate } from "@projectx/utils/dates";
import { Avatar } from "@projectx/ui/Avatar";
import { Button } from "@projectx/ui/Button";
import { EmptyState } from "@projectx/ui/EmptyState";
import { DoctorStatusBadge } from "@projectx/ui/StatusBadge";
import { Tabs } from "@projectx/ui/Tabs";
import { DataList } from "./DataList";

export function ApplicationsList({ pending, rejected }: { pending: DoctorProfile[]; rejected: DoctorProfile[] }) {
  const t = useTranslations("admin.applications");
  const tc = useTranslations("common");
  const ts = useTranslations("specialties");
  const tcity = useTranslations("cities");
  const locale = useLocale();
  const [tab, setTab] = useState<"pending" | "rejected">("pending");
  const rows = tab === "pending" ? pending : rejected;

  const name = (d: DoctorProfile) => `${d.firstName} ${d.lastName}`;

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        items={[
          { key: "pending", label: t("pending"), count: pending.length },
          { key: "rejected", label: t("rejected"), count: rejected.length },
        ]}
        value={tab}
        onChange={(k) => setTab(k as "pending" | "rejected")}
      />
      {rows.length === 0 ? (
        <EmptyState icon={<FileCheck2 className="h-7 w-7" />} title={t("noApplications")} description={t("noApplicationsDesc")} />
      ) : (
        <DataList
          rows={rows}
          keyOf={(d) => d.id}
          columns={[
            {
              key: "doctor",
              header: t("doctor"),
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
            { key: "specialty", header: t("specialty"), render: (d) => ts(d.specialty) },
            { key: "city", header: t("city"), render: (d) => tcity(d.city) },
            { key: "applied", header: t("appliedAt"), render: (d) => (d.appliedAt ? fmtDate(locale, tc, d.appliedAt) : "—") },
            {
              key: "docs",
              header: t("documents"),
              render: (d) => (
                <span className="inline-flex items-center gap-1 text-muted">
                  <FileText className="h-4 w-4" /> {d.documents.length > 0 ? t("docsCount", { count: d.documents.length }) : t("noDocs")}
                </span>
              ),
            },
            { key: "status", header: tc("status"), render: (d) => <DoctorStatusBadge status={d.status} /> },
          ]}
          actions={(d) => (
            <Button href={`/admin/applications/${d.id}`} size="sm" variant={d.status === "pending" ? "primary" : "secondary"}>
              {t("review")}
            </Button>
          )}
          mobileCard={(d) => (
            <div className="flex items-start gap-3">
              <Avatar src={d.avatarUrl} name={name(d)} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/admin/applications/${d.id}`} className="font-bold text-heading truncate">
                    {name(d)}
                  </Link>
                  <DoctorStatusBadge status={d.status} />
                </div>
                <div className="text-sm text-primary-text">{ts(d.specialty)}</div>
                <div className="text-xs text-muted">
                  {d.clinicName} · {tcity(d.city)}
                </div>
                <div className="text-xs text-muted mt-1">
                  {d.appliedAt && fmtDate(locale, tc, d.appliedAt)} · {d.documents.length > 0 ? t("docsCount", { count: d.documents.length }) : t("noDocs")}
                </div>
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}
