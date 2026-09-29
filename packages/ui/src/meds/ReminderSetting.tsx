"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { BellRing } from "lucide-react";
import { Card, CardHeader } from "../ui/Card";
import { Switch } from "../ui/Chip";
import { useReminderSettings, type ReminderPermission } from "./reminders";

/** Profile: "medicine reminders" on/off. Turning it on asks the browser for permission when needed. */
export function ReminderSetting() {
  const t = useTranslations("meds.reminder");
  const { settings, enable, disable } = useReminderSettings();
  const [problem, setProblem] = useState<ReminderPermission | null>(null);

  return (
    <Card>
      <CardHeader title={t("setting")} subtitle={t("settingDesc")} action={<BellRing className="h-5 w-5 text-primary-text" />} />
      <Switch
        checked={settings.enabled}
        label={t(settings.enabled ? "on" : "off")}
        onChange={async (on) => {
          if (!on) {
            setProblem(null);
            return disable();
          }
          const p = await enable();
          setProblem(p === "granted" ? null : p);
        }}
      />
      <p className="mt-2 text-sm text-muted">{t("openOnly")}</p>
      {problem && <p className="mt-1 text-sm text-amber-700">{t(problem === "unsupported" ? "unsupported" : "blocked")}</p>}
    </Card>
  );
}
