"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Coffee, Plus, Save, Sparkles, X } from "lucide-react";
import type { DoctorSchedule, ScheduleDay } from "@projectx/types";
import { cn } from "@projectx/utils";
import { Button } from "@projectx/ui/Button";
import { Card, CardHeader } from "@projectx/ui/Card";
import { Chip, Switch } from "@projectx/ui/Chip";
import { Toast } from "@projectx/ui/Toast";

const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const toTime = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

function slotsFor(day: ScheduleDay, duration: number): string[] {
  if (!day.enabled) return [];
  const out: string[] = [];
  const bs = day.breakStart ? toMin(day.breakStart) : -1;
  const be = day.breakEnd ? toMin(day.breakEnd) : -1;
  for (let m = toMin(day.start); m + duration <= toMin(day.end); m += duration) {
    if (bs >= 0 && m < be && m + duration > bs) continue;
    out.push(toTime(m));
  }
  return out;
}

export function ScheduleEditor({ initial }: { initial: DoctorSchedule }) {
  const t = useTranslations("doctor.schedule");
  const tc = useTranslations("common");
  const [days, setDays] = useState<ScheduleDay[]>(initial.days);
  const [duration, setDuration] = useState(initial.slotDurationMin);
  const [toast, setToast] = useState<string | null>(null);

  const update = (i: number, patch: Partial<ScheduleDay>) => setDays((d) => d.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const applyToAll = (i: number) => {
    const src = days[i];
    setDays((d) => d.map((x) => (x.enabled ? { ...x, start: src.start, end: src.end, breakStart: src.breakStart, breakEnd: src.breakEnd } : x)));
  };

  const perDay = useMemo(() => days.map((d) => slotsFor(d, duration)), [days, duration]);
  const weekTotal = perDay.reduce((s, l) => s + l.length, 0);
  const previewIdx = days.findIndex((d) => d.enabled);

  const timeInput = (value: string, onChange: (v: string) => void) => (
    <input
      type="time"
      value={value}
      step={300}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 rounded-lg border border-line bg-card px-2 text-sm text-heading focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 w-[124px]"
    />
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader title={t("slotDuration")} />
          <div className="flex flex-wrap gap-2">
            {[15, 20, 30, 45, 60].map((m) => (
              <Chip key={m} active={duration === m} onClick={() => setDuration(m)}>
                {tc("min", { count: m })}
              </Chip>
            ))}
          </div>
        </Card>

        <Card padding="none">
          <div className="p-4 md:p-5 pb-0">
            <CardHeader title={t("workDays")} subtitle={t("hours")} />
          </div>
          <ul className="divide-y divide-line">
            {days.map((d, i) => (
              <li key={d.day} className={cn("p-4 md:px-5 flex flex-col gap-3", !d.enabled && "bg-surface/60")}>
                <div className="flex items-center justify-between gap-3">
                  <Switch checked={d.enabled} onChange={(v) => update(i, { enabled: v })} label={tc(`weekdays.${d.day}`)} />
                  <span className="text-xs text-muted shrink-0">{d.enabled ? t("slotsPerDay", { count: perDay[i].length }) : t("dayOff")}</span>
                </div>
                {d.enabled && (
                  <div className="flex flex-col gap-2 pl-0 sm:pl-[60px]">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
                      {timeInput(d.start, (v) => update(i, { start: v }))}
                      <span>—</span>
                      {timeInput(d.end, (v) => update(i, { end: v }))}
                      <button type="button" onClick={() => applyToAll(i)} className="text-xs text-primary font-medium hover:underline ml-auto sm:ml-2">
                        {t("applyToAll")}
                      </button>
                    </div>
                    {d.breakStart ? (
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
                        <Coffee className="h-4 w-4" />
                        {timeInput(d.breakStart, (v) => update(i, { breakStart: v }))}
                        <span>—</span>
                        {timeInput(d.breakEnd ?? "14:00", (v) => update(i, { breakEnd: v }))}
                        <button type="button" aria-label={t("removeBreak")} title={t("removeBreak")} onClick={() => update(i, { breakStart: undefined, breakEnd: undefined })} className="h-8 w-8 rounded-md hover:bg-surface flex items-center justify-center">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => update(i, { breakStart: "13:00", breakEnd: "14:00" })} className="self-start inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline">
                        <Plus className="h-3.5 w-3.5" /> {t("addBreak")}
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Card>

        <div className="flex justify-end">
          <Button
            size="lg"
            icon={<Save className="h-4 w-4" />}
            onClick={() => {
              setToast(t("saved"));
              setTimeout(() => setToast(null), 2500);
            }}
          >
            {t("save")}
          </Button>
        </div>
      </div>

      {/* Preview */}
      <aside className="lg:sticky lg:top-20 self-start">
        <div className="rounded-xl gradient-accent text-white p-4 md:p-5">
          <div className="flex items-center gap-2 font-bold">
            <Sparkles className="h-5 w-5" /> {t("previewTitle")}
          </div>
          <div className="mt-1 text-sm text-white/90">{t("weekTotal", { count: weekTotal })}</div>
          {previewIdx >= 0 && (
            <>
              <div className="mt-3 text-xs uppercase tracking-wide text-white/80">
                {t("previewDesc", { day: tc(`weekdays.${days[previewIdx].day}`), count: perDay[previewIdx].length })}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {perDay[previewIdx].map((s) => (
                  <span key={s} className="rounded-md bg-white/20 px-2 py-1 text-xs font-semibold">
                    {s}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </aside>

      <Toast message={toast} />
    </div>
  );
}
