"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, Send } from "lucide-react";
import type { Appointment, DoctorProfile } from "@projectx/types";
import { fmtDate } from "@projectx/utils/dates";
import { Avatar } from "@projectx/ui/Avatar";
import { Button } from "@projectx/ui/Button";
import { Card } from "@projectx/ui/Card";
import { Textarea } from "@projectx/ui/Input";
import { StarRating } from "@projectx/ui/StarRating";

export function ReviewForm({ appointment, doctor }: { appointment: Appointment; doctor: DoctorProfile }) {
  const t = useTranslations("patient.review");
  const ts = useTranslations("specialties");
  const locale = useLocale();
  const tc = useTranslations("common");
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const name = `${doctor.firstName} ${doctor.lastName}`;

  if (done) {
    return (
      <Card className="text-center py-10">
        <span className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-success-soft text-success">
          <CheckCircle2 className="h-10 w-10" />
        </span>
        <h2 className="text-2xl font-bold text-heading">{t("successTitle")}</h2>
        <p className="mt-2 text-muted">{t("successDesc")}</p>
        <Button href="/patient/appointments" className="mt-6">
          {t("backToAppointments")}
        </Button>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <Card padding="sm" className="flex items-center gap-3">
        <Avatar src={doctor.avatarUrl} name={name} size="md" />
        <div className="min-w-0">
          <div className="font-bold text-heading truncate">{name}</div>
          <div className="text-sm text-primary">{ts(doctor.specialty)}</div>
          <div className="text-xs text-muted">
            {fmtDate(locale, tc, appointment.date)} · {appointment.time}
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-bold text-heading text-lg">{t("subtitle")}</h2>
        <div className="mt-4 flex flex-col items-center gap-2 py-2">
          <StarRating value={rating} onChange={setRating} size="lg" />
          <span className="text-sm font-medium text-heading min-h-[20px]">{rating > 0 ? t(`rating${rating}` as "rating1") : t("yourRating")}</span>
        </div>
        <div className="mt-4">
          <Textarea label={t("commentLabel")} placeholder={t("commentPlaceholder")} value={text} onChange={(e) => setText(e.target.value)} rows={5} />
        </div>
        <p className="mt-3 text-xs text-muted">{t("onlyVisited")}</p>
        <Button className="mt-4" fullWidth size="lg" disabled={rating === 0} onClick={() => setDone(true)} icon={<Send className="h-4 w-4" />}>
          {t("submit")}
        </Button>
      </Card>
    </div>
  );
}
