"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CalendarCheck, CheckCircle2, ChevronLeft, ChevronRight, Info, MapPin, Wallet } from "lucide-react";
import type { Appointment, AppointmentPayment, DoctorProfile, PaymentMethod, Slot } from "@projectx/types";
import { cn, formatMoney, isoDateFromNow, weekdayKey } from "@projectx/utils";
import { fmtDate } from "@projectx/utils/dates";
import { Avatar } from "@projectx/ui/Avatar";
import { Badge } from "@projectx/ui/Badge";
import { Button } from "@projectx/ui/Button";
import { Card } from "@projectx/ui/Card";
import { Chip } from "@projectx/ui/Chip";
import { EmptyState } from "@projectx/ui/EmptyState";
import { Textarea } from "@projectx/ui/Input";
import { PaymentBadge } from "@projectx/ui/payment/PaymentBadge";
import { PaymentSheet, ProviderButtons } from "@projectx/ui/payment/PaymentSheet";
import { useLocalAppointments } from "@projectx/ui/session/useLocalAppointments";

type Step = "slot" | "confirm" | "done";

/**
 * Pick a slot, confirm, done. With a priced doctor the confirm step offers to pay online (mock) or at
 * the visit; the booking is kept in the browser and shows up in "my appointments".
 * Rescheduling moves the existing appointment and leaves its payment as it is.
 */
export function BookingFlow({
  doctor,
  slots,
  patientId,
  appointments,
  rescheduleId,
}: {
  doctor: DoctorProfile;
  slots: Slot[];
  patientId: string;
  /** The patient's appointments (mock), to find the one being rescheduled. */
  appointments: Appointment[];
  rescheduleId?: string;
}) {
  const t = useTranslations("patient.book");
  const tc = useTranslations("common");
  const ts = useTranslations("specialties");
  const locale = useLocale();
  const name = `${doctor.firstName} ${doctor.lastName}`;

  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => isoDateFromNow(i)), []);
  const [day, setDay] = useState(days[0]);
  const [time, setTime] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [step, setStep] = useState<Step>("slot");
  const [weekOffset, setWeekOffset] = useState(0);
  const { merged, save } = useLocalAppointments(patientId, appointments);
  const rescheduled = rescheduleId ? merged.find((a) => a.id === rescheduleId) : undefined;
  const [paying, setPaying] = useState<PaymentMethod | null>(null);
  const [payment, setPayment] = useState<AppointmentPayment | undefined>();
  // Nothing to pay when the doctor set no price; a rescheduled visit keeps the payment it has.
  const price = rescheduled ? undefined : doctor.price;

  const book = (paid?: AppointmentPayment) => {
    if (!time) return;
    const pay = paid ?? (price ? { status: "onsite" as const, amount: price } : undefined);
    save(
      rescheduled
        ? { ...rescheduled, date: day, time }
        : { id: `apt-local-${Date.now()}`, doctorId: doctor.id, patientId, date: day, time, durationMin: doctor.slotDurationMin, status: "scheduled", reason: reason.trim() || undefined, payment: pay },
    );
    setPayment(rescheduled ? rescheduled.payment : pay);
    setPaying(null);
    setStep("done");
  };

  const daySlots = slots.filter((s) => s.date === day);
  const freeCount = (d: string) => slots.filter((s) => s.date === d && !s.isBooked).length;
  const morning = daySlots.filter((s) => Number(s.time.slice(0, 2)) < 13);
  const afternoon = daySlots.filter((s) => Number(s.time.slice(0, 2)) >= 13);
  const visibleDays = days.slice(weekOffset * 7, weekOffset * 7 + 7);

  const dayButton = (d: string, mobile: boolean) => {
    const free = freeCount(d);
    const active = d === day;
    const dayNum = Number(d.slice(8, 10));
    return (
      <button
        key={d}
        type="button"
        disabled={free === 0}
        aria-pressed={active}
        onClick={() => {
          setDay(d);
          setTime(null);
        }}
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border transition-colors",
          mobile ? "shrink-0 w-[64px] h-[76px]" : "h-[84px]",
          active ? "bg-primary border-primary text-white shadow-sm" : "bg-card border-line text-heading hover:border-primary",
          free === 0 && "opacity-40",
        )}
      >
        <span className={cn("text-[11px] uppercase", active ? "text-white/80" : "text-muted")}>{tc(`weekdaysShort.${weekdayKey(d)}`)}</span>
        <span className="text-xl font-bold leading-tight">{dayNum}</span>
        <span className={cn("text-[10px]", active ? "text-white/80" : free > 0 ? "text-success" : "text-muted")}>
          {free > 0 ? `${free} ${t("free").toLowerCase()}` : "—"}
        </span>
      </button>
    );
  };

  if (step === "done") {
    return (
      <Card className="text-center py-10">
        <span className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-success-soft text-success">
          <CheckCircle2 className="h-10 w-10" />
        </span>
        <h2 className="text-2xl font-bold text-heading">{t("successTitle")}</h2>
        <p className="mt-2 text-muted max-w-sm mx-auto">
          {t("successDesc", { doctor: name, date: fmtDate(locale, tc, day, "long"), time: time ?? "" })}
        </p>
        {payment && (
          <p className="mt-3 inline-flex flex-wrap items-center justify-center gap-2 text-sm text-heading">
            <PaymentBadge payment={payment} />
            <span className="font-semibold tabular-nums">{tc("sum", { value: formatMoney(payment.amount) })}</span>
          </p>
        )}
        <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
          <Button href="/patient/appointments" icon={<CalendarCheck className="h-4 w-4" />}>
            {t("goToAppointments")}
          </Button>
          <Button href="/patient/doctors" variant="secondary">
            {t("bookAnother")}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex flex-col gap-4">
        {/* Doctor summary */}
        <Card padding="sm" className="flex items-center gap-3">
          <Avatar src={doctor.avatarUrl} name={name} size="md" />
          <div className="min-w-0">
            <div className="font-bold text-heading truncate">{name}</div>
            <div className="text-sm text-primary-text">{ts(doctor.specialty)}</div>
            {/* A long clinic name must shorten, not widen the page: `truncate` needs a block-level box. */}
            <div className="flex min-w-0 items-center gap-1 text-xs text-muted">
              <MapPin className="h-3 w-3 shrink-0" /> <span className="truncate">{doctor.clinicName}</span>
            </div>
          </div>
          {rescheduleId && (
            <Badge tone="accent" className="ml-auto">
              {t("rescheduling")}
            </Badge>
          )}
        </Card>

        {step === "slot" ? (
          <>
            {/* Day picker */}
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-heading">{t("chooseDay")}</h2>
                <div className="hidden md:flex items-center gap-1">
                  <button type="button" disabled={weekOffset === 0} onClick={() => setWeekOffset(0)} className="h-9 w-9 rounded-md hover:bg-surface disabled:opacity-30 flex items-center justify-center">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button type="button" disabled={weekOffset === 1} onClick={() => setWeekOffset(1)} className="h-9 w-9 rounded-md hover:bg-surface disabled:opacity-30 flex items-center justify-center">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
              {/* Mobile: horizontal scroll */}
              <div className="md:hidden flex gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 pb-1">{days.map((d) => dayButton(d, true))}</div>
              {/* Desktop: 7-column week grid */}
              <div className="hidden md:grid grid-cols-7 gap-2">{visibleDays.map((d) => dayButton(d, false))}</div>
            </Card>

            {/* Time slots */}
            <Card>
              <h2 className="font-bold text-heading mb-1">{t("chooseTime")}</h2>
              <p className="text-sm text-muted mb-3 capitalize">{fmtDate(locale, tc, day, "weekday")}</p>
              {daySlots.length === 0 || daySlots.every((s) => s.isBooked) ? (
                <EmptyState compact title={t("noSlots")} description={t("noSlotsDesc")} />
              ) : (
                <div className="flex flex-col gap-4">
                  {[
                    { label: t("morning"), list: morning },
                    { label: t("afternoon"), list: afternoon },
                  ]
                    .filter((g) => g.list.length > 0)
                    .map((g) => (
                      <div key={g.label}>
                        <div className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">{g.label}</div>
                        <div className="flex flex-wrap gap-2">
                          {g.list.map((s) => (
                            <Chip key={s.id} active={time === s.time} disabled={s.isBooked} onClick={() => setTime(s.time)} className="min-w-[72px]">
                              {s.time}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    ))}
                  <div className="flex items-center gap-4 text-xs text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-full border border-line bg-card" /> {t("free")}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-full bg-line" /> {t("booked")}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-full bg-primary" /> {t("selected")}
                    </span>
                  </div>
                </div>
              )}
            </Card>
          </>
        ) : (
          <Card>
            <h2 className="font-bold text-heading mb-3">{t("confirmTitle")}</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted">{t("doctor")}</dt>
              <dd className="font-semibold text-heading">{name}</dd>
              <dt className="text-muted">{tc("date")}</dt>
              <dd className="font-semibold text-heading capitalize">{fmtDate(locale, tc, day, "weekday")}</dd>
              <dt className="text-muted">{tc("time")}</dt>
              <dd className="font-semibold text-heading">
                {time} · {tc("min", { count: doctor.slotDurationMin })}
              </dd>
              <dt className="text-muted">{t("clinic")}</dt>
              <dd className="text-heading">
                {doctor.clinicName}
                <div className="text-xs text-muted">{doctor.address}</div>
              </dd>
              <dt className="text-muted">{t("price")}</dt>
              <dd className="font-semibold text-heading">{doctor.price ? tc("sum", { value: formatMoney(doctor.price) }) : "—"}</dd>
            </dl>
            <div className="mt-4">
              <Textarea label={`${t("reasonLabel")} (${tc("optional")})`} placeholder={t("reasonPlaceholder")} value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            {price !== undefined && (
              <section className="mt-4 rounded-lg border border-line p-3" aria-labelledby="booking-payment">
                <div className="flex items-center justify-between gap-3">
                  <h3 id="booking-payment" className="inline-flex items-center gap-2 font-bold text-heading">
                    <Wallet className="h-4 w-4 text-primary-text" /> {t("payment.title")}
                  </h3>
                  <span className="text-lg font-bold tabular-nums text-heading">{tc("sum", { value: formatMoney(price) })}</span>
                </div>
                <div className="mt-3 text-sm font-semibold text-heading">{t("payment.online")}</div>
                <p className="mb-2 text-xs text-muted">{t("payment.onlineHint")}</p>
                <ProviderButtons onPick={setPaying} />
                <div className="mt-3 border-t border-line pt-3 text-sm">
                  <span className="font-semibold text-heading">{t("payment.onsite")}</span>
                  <span className="block text-xs text-muted">{t("payment.onsiteHint", { button: t("confirm") })}</span>
                </div>
              </section>
            )}
            <div className="mt-3 flex items-start gap-2 rounded-md bg-primary-soft px-3 py-2 text-xs text-primary-text">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{t("autoConfirm")}</span>
            </div>
          </Card>
        )}
      </div>

      {/* Summary / actions: sticky bottom on mobile, side card on desktop */}
      <div className="lg:sticky lg:top-20 self-start">
        <div className="fixed inset-x-0 bottom-14 md:bottom-0 z-20 bg-card border-t border-line p-3 safe-bottom lg:static lg:bg-transparent lg:border-0 lg:p-0">
          <Card padding="none" className="lg:p-4 border-0 shadow-none lg:border lg:shadow-card">
            <div className="hidden lg:block mb-3">
              <div className="text-xs text-muted uppercase tracking-wide">{t("step", { current: step === "slot" ? 1 : 2, total: 2 })}</div>
              <div className="font-bold text-heading text-lg mt-1 capitalize">{fmtDate(locale, tc, day, "weekday")}</div>
              <div className="text-primary-text font-semibold">{time ?? "--:--"}</div>
            </div>
            <div className="flex gap-2 max-w-[1280px] mx-auto">
              {step === "confirm" && (
                <Button variant="secondary" onClick={() => setStep("slot")} icon={<ChevronLeft className="h-4 w-4" />}>
                  {tc("back")}
                </Button>
              )}
              {step === "slot" ? (
                <Button fullWidth size="lg" disabled={!time} onClick={() => setStep("confirm")}>
                  {t("continue")} {time ? `· ${time}` : ""}
                </Button>
              ) : (
                <Button fullWidth size="lg" onClick={() => book()} icon={<CalendarCheck className="h-5 w-5" />}>
                  {t("confirm")}
                </Button>
              )}
            </div>
          </Card>
        </div>
        <div className="h-20 lg:hidden" />
      </div>

      {price !== undefined && <PaymentSheet open={paying !== null} amount={price} provider={paying ?? undefined} onPaid={book} onClose={() => setPaying(null)} />}
    </div>
  );
}
