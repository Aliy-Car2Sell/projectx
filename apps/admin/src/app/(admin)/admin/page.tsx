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
import { Avatar } from "@projectx/ui/Avatar";
import { Button } from "@projectx/ui/Button";
import { Card, StatCard } from "@projectx/ui/Card";
import { IconBox, type IconTone } from "@projectx/ui/IconBox";
import { PageHeader, SectionHeader } from "@projectx/ui/PageHeader";

const activityIcon: Record<ActivityItem["type"], { icon: LucideIcon; tone: IconTone }> = {
  user_registered: { icon: UserPlus, tone: "primary" },
  doctor_applied: { icon: FileCheck2, tone: "warning" },
  appointment_created: { icon: CalendarDays, tone: "success" },
  review_posted: { icon: Star, tone: "accent" },
  review_reported: { icon: MessageSquareWarning, tone: "danger" },
};

export default async function AdminDashboard() {
  const t = await getTranslations("admin.dashboard");
  const tc = await getTranslations("common");
  const locale = await getLocale();
  const reported = reviews.filter((r) => r.reportReason && !r.isHidden).length;

  return (
    <>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <Button href="/admin/applications" icon={<FileCheck2 />} className="max-md:hidden">
            {t("viewApplications")}
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 md:mb-8 md:grid-cols-3 md:gap-4">
        <StatCard compact href="/admin/users" label={t("users")} value={users.length + 120} hint={t("growth", { count: 14 })} icon={<Users />} tone="accent" />
        <StatCard compact href="/admin/doctors" label={t("doctors")} value={approvedDoctors.length} hint={t("growth", { count: 2 })} icon={<Stethoscope />} />
        <StatCard compact label={t("appointments")} value={appointments.length + 340} hint={t("growth", { count: 57 })} icon={<CalendarDays />} tone="success" />
        <StatCard compact href="/admin/applications" label={t("pendingApplications")} value={pendingDoctors.length} icon={<FileCheck2 />} tone="warning" />
        <StatCard compact href="/admin/records" label={t("pendingRecords")} value={countPendingRecords()} icon={<ClipboardCheck />} tone="warning" />
        <StatCard compact href="/admin/reviews" label={t("reportedReviews")} value={reported} icon={<MessageSquareWarning />} tone="danger" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <SectionHeader>{t("recentActivity")}</SectionHeader>
          <Card padding="none" className="divide-y divide-line overflow-hidden">
            {recentActivity.map((a) => {
              const { icon: Icon, tone } = activityIcon[a.type];
              return (
                <div key={a.id} className="flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-neutral-50">
                  <IconBox tone={tone} size="md">
                    <Icon />
                  </IconBox>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-heading">{t(`activity.${a.type}`)}</div>
                    <div className="truncate text-sm text-muted">{a.text}</div>
                  </div>
                  <div className="shrink-0 text-xs tabular-nums text-neutral-500">{isSameDay(a.at, 0) ? fmtTime(a.at) : fmtDate(locale, tc, a.at, "short")}</div>
                </div>
              );
            })}
          </Card>
        </section>

        <section>
          <SectionHeader>{t("pendingApplications")}</SectionHeader>
          <Card padding="none" className="divide-y divide-line overflow-hidden">
            {pendingDoctors.map((d) => (
              <Link key={d.id} href={`/admin/applications/${d.id}`} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-accent-50/60">
                <Avatar src={d.avatarUrl} name={`${d.firstName} ${d.lastName}`} size="sm" className="h-10 w-10" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-heading">
                    {d.firstName} {d.lastName}
                  </div>
                  <div className="truncate text-xs text-muted">{d.clinicName}</div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-neutral-500" />
              </Link>
            ))}
            <div className="p-4">
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
