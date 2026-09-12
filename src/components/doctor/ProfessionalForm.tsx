"use client";

import { useTranslations } from "next-intl";
import { ExternalLink, Save } from "lucide-react";
import type { DoctorProfile } from "@projectx/types";
import { cityKeys, specialtyKeys } from "@projectx/mock/doctors";
import { Button } from "@projectx/ui/Button";
import { Card, CardHeader } from "@projectx/ui/Card";
import { Input, Textarea } from "@projectx/ui/Input";
import { Select } from "@projectx/ui/Select";
import { DoctorStatusBadge } from "@projectx/ui/StatusBadge";
import { Toast, useToast } from "@projectx/ui/Toast";

/** Professional details editor on the doctor profile page (UI only: validates and shows a toast). */
export function ProfessionalForm({ doctor: d }: { doctor: DoctorProfile }) {
  const t = useTranslations("doctor.profile");
  const tc = useTranslations("common");
  const ts = useTranslations("specialties");
  const tcat = useTranslations("categories");
  const tcity = useTranslations("cities");
  const { toast, show } = useToast();

  return (
    <Card>
      <CardHeader title={t("professional")} action={<DoctorStatusBadge status={d.status} />} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          show(t("saved"));
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label={t("specialty")} name="specialty" defaultValue={d.specialty} options={specialtyKeys.map((k) => ({ value: k, label: ts(k) }))} />
          <Select label={t("category")} name="category" defaultValue={d.category} options={(["highest", "first", "second", "none"] as const).map((k) => ({ value: k, label: tcat(k) }))} />
          <Input label={t("experience")} name="experience" type="number" min={0} max={60} required defaultValue={d.experienceYears} />
          <Input label={t("slotDuration")} name="slotDuration" type="number" min={5} max={120} step={5} required defaultValue={d.slotDurationMin} />
          <Input label={t("clinic")} name="clinic" required defaultValue={d.clinicName} />
          <Select label={tc("city")} name="city" defaultValue={d.city} options={cityKeys.map((k) => ({ value: k, label: tcity(k) }))} />
          <div className="sm:col-span-2">
            <Input label={t("address")} name="address" required defaultValue={d.address} />
          </div>
          <Input label={t("price")} name="price" type="number" min={0} defaultValue={d.price} />
          <div className="sm:col-span-2">
            <Textarea label={t("about")} name="about" defaultValue={d.about} rows={4} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <Button href={`/patient/doctors/${d.id}?from=doctor`} variant="ghost" size="sm" icon={<ExternalLink className="h-4 w-4" />}>
            {t("viewPublic")}
          </Button>
          <Button type="submit" icon={<Save className="h-4 w-4" />}>
            {tc("save")}
          </Button>
        </div>
      </form>
      <Toast message={toast} />
    </Card>
  );
}
