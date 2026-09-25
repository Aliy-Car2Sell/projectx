"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ClipboardCheck, FileText, Paperclip } from "lucide-react";
import type { MedicalRecord, RecordStatus, User } from "@projectx/types";
import { fmtDate, fmtTime } from "@projectx/utils/dates";
import { isSameDay } from "@projectx/utils";
import { Avatar } from "@projectx/ui/Avatar";
import { Button } from "@projectx/ui/Button";
import { EmptyState, ErrorState } from "@projectx/ui/EmptyState";
import { RetryButton } from "@projectx/ui/RetryButton";
import { ListSkeleton } from "@projectx/ui/Skeleton";
import { RecordStatusBadge } from "@projectx/ui/StatusBadge";
import { Tabs } from "@projectx/ui/Tabs";
import type { DemoState } from "@projectx/ui/demo/state";
import { DataList } from "./DataList";

export type ReviewRow = { record: MedicalRecord; patient: User };

const tabs: RecordStatus[] = ["pending", "approved", "rejected"];

/** The review queue: pending first, with the already decided ones one tab away. */
export function RecordsReviewList({ rows, state = "normal" }: { rows: ReviewRow[]; state?: DemoState }) {
  const t = useTranslations("admin.records");
  const tr = useTranslations("records");
  const tc = useTranslations("common");
  const tst = useTranslations("states");
  const locale = useLocale();
  const [tab, setTab] = useState<RecordStatus>("pending");
  const shown = rows.filter((r) => r.record.status === tab);
  const name = (u: User) => `${u.firstName} ${u.lastName}`;
  const when = (iso?: string) => (iso ? (isSameDay(iso, 0) ? fmtTime(iso) : `${fmtDate(locale, tc, iso, "short")} · ${fmtTime(iso)}`) : "—");
  const file = (r: MedicalRecord) =>
    r.fileName ? (
      <span className="inline-flex items-center gap-1 text-heading">
        <Paperclip className="h-4 w-4 text-muted" /> {r.fileName}
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-muted">
        <FileText className="h-4 w-4" /> {t("noFile")}
      </span>
    );

  return (
    <div className="flex flex-col gap-4">
      <Tabs items={tabs.map((k) => ({ key: k, label: t(`tabs.${k}`), count: rows.filter((r) => r.record.status === k).length }))} value={tab} onChange={(k) => setTab(k as RecordStatus)} />
      {state === "loading" ? (
        <ListSkeleton rows={4} />
      ) : state === "error" ? (
        <ErrorState title={tst("errorTitle")} description={tst("errorDesc")} action={<RetryButton />} />
      ) : shown.length === 0 ? (
        <EmptyState icon={<ClipboardCheck className="h-7 w-7" />} title={t(`empty.${tab}`)} description={tab === "pending" ? t("emptyPendingDesc") : undefined} />
      ) : (
        <DataList
          rows={shown}
          keyOf={({ record }) => record.id}
          columns={[
            {
              key: "patient",
              header: t("patient"),
              render: ({ patient }) => (
                <div className="flex items-center gap-3">
                  <Avatar src={patient.avatarUrl} name={name(patient)} size="sm" />
                  <div>
                    <div className="font-semibold text-heading">{name(patient)}</div>
                    <div className="text-xs text-muted">{patient.phone}</div>
                  </div>
                </div>
              ),
            },
            { key: "type", header: t("type"), render: ({ record }) => tr(`types.${record.type}`) },
            {
              key: "title",
              header: t("recordTitle"),
              render: ({ record }) => (
                <span className="inline-flex items-center gap-1.5">
                  <span className="font-medium text-heading">{record.title}</span>
                  {record.private && <span className="text-xs text-muted">({tr("privateBadge")})</span>}
                </span>
              ),
            },
            { key: "date", header: t("recordDate"), render: ({ record }) => fmtDate(locale, tc, record.date) },
            { key: "submitted", header: t("submittedAt"), render: ({ record }) => when(record.submittedAt) },
            { key: "file", header: t("file"), render: ({ record }) => file(record) },
            { key: "status", header: tc("status"), render: ({ record }) => <RecordStatusBadge status={record.status} /> },
          ]}
          actions={({ record }) => (
            <Button href={`/admin/records/${record.id}`} size="sm" variant={record.status === "pending" ? "primary" : "secondary"}>
              {t("review")}
            </Button>
          )}
          mobileCard={({ record, patient }) => (
            <div className="flex items-start gap-3">
              <Avatar src={patient.avatarUrl} name={name(patient)} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/admin/records/${record.id}`} className="font-bold text-heading truncate">
                    {record.title}
                  </Link>
                  <RecordStatusBadge status={record.status} />
                </div>
                <div className="text-sm text-primary-text">
                  {name(patient)} · {tr(`types.${record.type}`)}
                </div>
                <div className="text-xs text-muted">
                  {fmtDate(locale, tc, record.date)} · {t("submittedAt")}: {when(record.submittedAt)}
                </div>
                <div className="mt-1 text-xs">{file(record)}</div>
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}
