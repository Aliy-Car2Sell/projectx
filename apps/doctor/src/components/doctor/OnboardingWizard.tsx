"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, CheckCircle2, ChevronLeft, ChevronRight, FileUp, MapPin, Send } from "lucide-react";
import type { CityKey } from "@projectx/types";
import { cityCenters, cityKeys, specialtyKeys } from "@projectx/mock/doctors";
import { onboardingDraft as draft } from "@projectx/mock/onboarding";
import { cn } from "@projectx/utils";
import { AvatarUpload } from "@projectx/ui/AvatarUpload";
import { Button } from "@projectx/ui/Button";
import { Card } from "@projectx/ui/Card";
import { Chip } from "@projectx/ui/Chip";
import { Input, Textarea } from "@projectx/ui/Input";
import { Select } from "@projectx/ui/Select";
import { MapView } from "@projectx/ui/map/MapView";

const steps = ["personal", "specialty", "workplace", "contact", "documents"] as const;
type Step = (typeof steps)[number];

export function OnboardingWizard() {
  const t = useTranslations("doctor.onboarding");
  const tc = useTranslations("common");
  const ts = useTranslations("specialties");
  const tcat = useTranslations("categories");
  const tcity = useTranslations("cities");
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [city, setCity] = useState<CityKey>(draft.city);
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [duration, setDuration] = useState(draft.slotDurationMin);
  const [files, setFiles] = useState<Record<string, string | null>>({ diploma: null, certificate: null, license: null });

  const step: Step = steps[idx];
  const stepLabel = (s: Step) => t(`step${s[0].toUpperCase()}${s.slice(1)}` as "stepPersonal");

  if (done) {
    return (
      <Card className="text-center py-10 max-w-xl mx-auto">
        <span className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-success-soft text-success">
          <CheckCircle2 className="h-10 w-10" />
        </span>
        <h2 className="text-2xl font-bold text-heading">{t("submittedTitle")}</h2>
        <p className="mt-2 text-muted max-w-md mx-auto">{t("submittedDesc")}</p>
        <Button href="/doctor?state=pending" className="mt-6">
          {t("goDashboard")}
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
      {/* Stepper */}
      <aside>
        <div className="lg:hidden text-xs font-semibold uppercase tracking-wide text-muted mb-2">{t("stepOf", { current: idx + 1, total: steps.length })}</div>
        <ol className="flex lg:flex-col gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 lg:mx-0 lg:px-0">
          {steps.map((s, i) => {
            const state = i < idx ? "done" : i === idx ? "active" : "todo";
            return (
              <li key={s} className="shrink-0">
                <button
                  type="button"
                  disabled={i >= idx}
                  aria-current={i === idx ? "step" : undefined}
                  onClick={() => i < idx && setIdx(i)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 min-h-[40px] text-sm font-medium w-full text-left",
                    state === "active" && "bg-primary text-white",
                    state === "done" && "bg-success-soft text-green-700",
                    state === "todo" && "bg-card border border-line text-muted",
                    "disabled:cursor-default",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      state === "active" ? "bg-white text-primary" : state === "done" ? "bg-success text-white" : "bg-surface text-muted",
                    )}
                  >
                    {state === "done" ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  {stepLabel(s)}
                </button>
              </li>
            );
          })}
        </ol>
      </aside>

      {/* Step body */}
      <Card>
        {step === "personal" && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-bold text-heading">{t("personalTitle")}</h2>
              <p className="text-sm text-muted">{t("personalDesc")}</p>
            </div>
            <AvatarUpload name="D" label={t("uploadPhoto")} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label={t("firstName")} defaultValue={draft.firstName} />
              <Input label={t("lastName")} defaultValue={draft.lastName} />
              <Input label={t("birthDate")} type="date" defaultValue={draft.birthDate} />
            </div>
            <Textarea label={t("about")} placeholder={t("aboutPlaceholder")} rows={4} />
          </div>
        )}

        {step === "specialty" && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-heading">{t("specialtyTitle")}</h2>
            <Select label={t("specialty")} defaultValue={draft.specialty} options={specialtyKeys.map((k) => ({ value: k, label: ts(k) }))} />
            <Select label={t("category")} defaultValue={draft.category} options={(["highest", "first", "second", "none"] as const).map((k) => ({ value: k, label: tcat(k) }))} />
            <Input label={t("experience")} type="number" min={0} max={60} defaultValue={draft.experienceYears} hint={t("experienceHint")} />
          </div>
        )}

        {step === "workplace" && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-bold text-heading">{t("workplaceTitle")}</h2>
              <p className="text-sm text-muted">{t("workplaceDesc")}</p>
            </div>
            <Input label={t("clinicName")} defaultValue={draft.clinicName} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select label={t("city")} value={city} onChange={(e) => { setCity(e.target.value as CityKey); setPin(null); }} options={cityKeys.map((k) => ({ value: k, label: tcity(k) }))} />
              <Input label={t("address")} defaultValue={draft.address} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-heading inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-primary" /> {t("mapHint")}
                </span>
                <span className={cn("text-xs font-semibold", pin ? "text-success" : "text-muted")}>{pin ? t("pinSet") : t("pinNotSet")}</span>
              </div>
              <MapView
                key={city}
                pins={pin ? [{ id: "pin", lat: pin.lat, lng: pin.lng, title: draft.clinicName, active: true }] : []}
                center={cityCenters[city]}
                zoom={12}
                fit={false}
                onClick={(lat, lng) => setPin({ lat, lng })}
                className="h-64 md:h-80 cursor-crosshair"
              />
              {pin && (
                <div className="mt-1 text-xs text-muted">
                  {pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}
                </div>
              )}
            </div>
          </div>
        )}

        {step === "contact" && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-heading">{t("contactTitle")}</h2>
            <Input label={t("phone")} type="tel" defaultValue={draft.phone} hint={t("phoneHint")} />
            <Input label={`${t("price")} (${tc("optional")})`} type="number" defaultValue={draft.price} hint={t("priceHint")} />
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-heading">{t("slotDuration")}</span>
              <div className="flex flex-wrap gap-2">
                {[15, 20, 30, 45, 60].map((m) => (
                  <Chip key={m} active={duration === m} onClick={() => setDuration(m)}>
                    {tc("min", { count: m })}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === "documents" && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-bold text-heading">{t("documentsTitle")}</h2>
              <p className="text-sm text-muted">{t("documentsDesc")}</p>
            </div>
            {(["diploma", "certificate", "license"] as const).map((k) => (
              <div key={k} className="flex items-center justify-between gap-3 rounded-xl border border-line p-3">
                <div className="min-w-0">
                  <div className="font-semibold text-heading text-sm">{t(k)}</div>
                  <div className="text-xs text-muted truncate">{files[k] ?? t("fileFormats")}</div>
                </div>
                {files[k] ? (
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-success shrink-0">
                    <Check className="h-4 w-4" /> {t("fileAdded")}
                  </span>
                ) : (
                  <Button variant="secondary" size="sm" icon={<FileUp className="h-4 w-4" />} onClick={() => setFiles((f) => ({ ...f, [k]: `${k}.pdf` }))} className="shrink-0">
                    {t("addFile")}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-2 border-t border-line pt-4">
          <Button variant="ghost" disabled={idx === 0} onClick={() => setIdx((i) => i - 1)} icon={<ChevronLeft className="h-4 w-4" />}>
            {t("back")}
          </Button>
          {idx < steps.length - 1 ? (
            <Button onClick={() => setIdx((i) => i + 1)}>
              {t("next")} <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="accent" onClick={() => setDone(true)} icon={<Send className="h-4 w-4" />} disabled={!files.diploma}>
              {t("submit")}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
