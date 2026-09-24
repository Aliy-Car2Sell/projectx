import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Clock, Lock, UserRound } from "lucide-react";
import { getRecordById } from "@projectx/mock/records";
import { getUserById } from "@projectx/mock/users";
import { fmtDate, fmtTime } from "@projectx/utils/dates";
import { Avatar } from "@projectx/ui/Avatar";
import { Badge } from "@projectx/ui/Badge";
import { Card, CardHeader } from "@projectx/ui/Card";
import { PageHeader } from "@projectx/ui/PageHeader";
import { RecordStatusBadge } from "@projectx/ui/StatusBadge";
import { RecordDecision } from "@/components/admin/RecordDecision";
import { RecordFilePreview } from "@/components/admin/RecordFilePreview";

/** One patient upload in full (text, values, file) with the approve / reject decision. */
export default async function AdminRecordDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = getRecordById(id);
  // Only patient uploads are reviewed; a doctor's entry is never in this queue.
  if (!record || record.authorRole !== "patient") notFound();
  const patient = getUserById(record.patientId);
  if (!patient) notFound();

  const t = await getTranslations("admin.records");
  const tr = await getTranslations("records");
  const tc = await getTranslations("common");
  const locale = await getLocale();
  const name = `${patient.firstName} ${patient.lastName}`;

  return (
    <>
      <PageHeader
        title={t("detailTitle")}
        subtitle={record.submittedAt ? `${t("submittedAt")}: ${fmtDate(locale, tc, record.submittedAt)} · ${fmtTime(record.submittedAt)}` : undefined}
        backHref="/admin/records"
        backLabel={t("backToList")}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-4">
          <Card>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="primary">{tr(`types.${record.type}`)}</Badge>
              <RecordStatusBadge status={record.status} />
              {record.private && (
                <Badge tone="neutral">
                  <Lock className="h-3 w-3" /> {tr("privateBadge")}
                </Badge>
              )}
            </div>
            <h2 className="mt-2 text-xl font-bold text-heading">{record.title}</h2>
            <div className="mt-1 text-sm text-muted">
              {t("recordDate")}: {fmtDate(locale, tc, record.date)}
            </div>
            {record.private && (
              <p className="mt-3 flex items-start gap-2 rounded-lg bg-surface px-3 py-2 text-sm text-muted">
                <Lock className="mt-0.5 h-4 w-4 shrink-0" /> {t("privateNote")}
              </p>
            )}
            {record.description ? (
              <>
                <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">{t("text")}</div>
                <p className="mt-1 whitespace-pre-line leading-relaxed text-heading">{record.description}</p>
              </>
            ) : (
              <p className="mt-4 text-sm text-muted">{t("noText")}</p>
            )}
            {record.values && record.values.length > 0 && (
              <>
                <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">{t("values")}</div>
                <table className="mt-1 w-full text-sm">
                  <tbody>
                    {record.values.map((v) => (
                      <tr key={v.name} className="border-t border-line/70 first:border-t-0">
                        <td className="py-1 pr-2 text-heading">{v.name}</td>
                        <td className="py-1 pr-2 font-semibold text-heading whitespace-nowrap">
                          {v.value} {v.unit}
                        </td>
                        <td className="py-1 text-right text-muted whitespace-nowrap">{v.norm && tr("norm", { range: v.norm })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </Card>

          <Card>
            <CardHeader title={t("file")} />
            <RecordFilePreview record={record} />
          </Card>

          <Card>
            <CardHeader title={t("patient")} />
            <div className="flex items-center gap-3">
              <Avatar src={patient.avatarUrl} name={name} size="md" />
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-heading">{name}</div>
                <div className="truncate text-xs text-muted">
                  {patient.phone} · {patient.email}
                </div>
              </div>
              <Link href="/admin/users" className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-primary-text hover:bg-primary-soft">
                <UserRound className="h-4 w-4" /> {t("patientLink")}
              </Link>
            </div>
            {record.submittedAt && (
              <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted">
                <Clock className="h-3.5 w-3.5" /> {t("submittedAt")}: {fmtDate(locale, tc, record.submittedAt)} · {fmtTime(record.submittedAt)}
              </div>
            )}
          </Card>
        </div>

        <aside className="self-start">
          <RecordDecision initialStatus={record.status} initialReason={record.rejectReason} />
        </aside>
      </div>
    </>
  );
}
