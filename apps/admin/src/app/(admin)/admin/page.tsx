import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { CalendarDays, ChevronRight, ClipboardCheck, FileCheck2, MessageSquareWarning, Stethoscope, UserPlus, Users, Star, type LucideIcon } from "lucide-react";
import type { ActivityItem } from "@projectx/types";
import { users } from "@projectx/mock/users";
import { approvedDoctors, pendingDoctors } from "@projectx/mock/doctors";
import { appointments } from "@projectx/mock/appointments";
import { recentActivity, reviews } from "@projectx/mock/reviews";
import { countPendingRecords } from "@projectx/mock/records";
import { fmtDate, fmtTime } from "@projectx/utils/dates";
import { isSameDay } from "@projectx/utils";
import { Button } from "@projectx/ui/Button";
import { Card, StatCard } from "@projectx/ui/Card";
import { PageHeader, SectionTitle } from "@projectx/ui/PageHeader";

const activityIcon: Record<ActivityItem["type"], { icon: LucideIcon; cls: string }> = {
  user_registered: { icon: UserPlus, cls: "bg-primary-soft text-primary-text" },
  doctor_applied: { icon: FileCheck2, cls: "bg-warning-soft text-warning" },
  appointment_created: { icon: CalendarDays, cls: "bg-success-soft text-success" },
  review_posted: { icon: Star, cls: "bg-accent-soft text-accent" },
  review_reported: { icon: MessageSquareWarning, cls: "bg-danger-soft text-danger" },
};

export default async function AdminDashboard() {
  const t = await getTranslations("admin.dashboard");
  const tc = await getTranslations("common");
  const locale = await getLocale();
  const reported = reviews.filter((r) => r.reportReason && !r.isHidden).length;

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} actions={<Button href="/admin/applications" icon={<FileCheck2 className="h-4 w-4" />} className="max-md:hidden">{t("viewApplications")}</Button>} />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        <StatCard label={t("users")} value={users.length + 120} hint={t("growth", { count: 14 })} icon={<Users className="h-5 w-5" />} tone="white" />
        <StatCard label={t("doctors")} value={approvedDoctors.length} hint={t("growth", { count: 2 })} icon={<Stethoscope className="h-5 w-5" />} tone="white" />
        <StatCard label={t("appointments")} value={appointments.length + 340} hint={t("growth", { count: 57 })} icon={<CalendarDays className="h-5 w-5" />} tone="primary" />
        <StatCard label={t("pendingApplications")} value={pendingDoctors.length} icon={<FileCheck2 className="h-5 w-5" />} tone="accent" />
        <Link href="/admin/records" className="contents">
          <StatCard label={t("pendingRecords")} value={countPendingRecords()} icon={<ClipboardCheck className="h-5 w-5" />} tone="white" className="hover:border-primary transition-colors" />
        </Link>
        <StatCard label={t("reportedReviews")} value={reported} icon={<MessageSquareWarning className="h-5 w-5" />} tone="white" className="col-span-2 lg:col-span-1" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="lg:col-span-2">
          <SectionTitle>{t("recentActivity")}</SectionTitle>
          <Card padding="none" className="divide-y divide-line">
            {recentActivity.map((a) => {
              const { icon: Icon, cls } = activityIcon[a.type];
              return (
                <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${cls}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-heading">{t(`activity.${a.type}`)}</div>
                    <div className="text-sm text-muted truncate">{a.text}</div>
                  </div>
                  <div className="text-xs text-muted shrink-0">{isSameDay(a.at, 0) ? fmtTime(a.at) : fmtDate(locale, tc, a.at, "short")}</div>
                </div>
              );
            })}
          </Card>
        </section>

        <section>
          <SectionTitle>{t("pendingApplications")}</SectionTitle>
          <Card padding="none" className="divide-y divide-line">
            {pendingDoctors.map((d) => (
              <Link key={d.id} href={`/admin/applications/${d.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-heading truncate">
                    {d.firstName} {d.lastName}
                  </div>
                  <div className="text-xs text-muted truncate">{d.clinicName}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted" />
              </Link>
            ))}
            <div className="p-3">
              <Button href="/admin/applications" variant="secondary" size="sm" fullWidth>
                {t("viewApplications")}
              </Button>
            </div>
          </Card>
        </section>
      </div>
    </>
  );
}
