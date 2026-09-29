"use client";

import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardHeader } from "../ui/Card";
import { clearDemoData } from "./store";

/** Profile: forget everything this browser stored for the demo and show the mock data again. */
export function ClearDemoData({ onCleared }: { onCleared?: () => void }) {
  const t = useTranslations("profile.demo");
  return (
    <Card>
      <CardHeader title={t("title")} subtitle={t("desc")} action={<RotateCcw className="h-5 w-5 text-muted" />} />
      <Button
        variant="secondary"
        fullWidth
        icon={<RotateCcw className="h-4 w-4" />}
        onClick={() => {
          if (!window.confirm(t("confirm"))) return;
          clearDemoData();
          onCleared?.();
        }}
      >
        {t("button")}
      </Button>
    </Card>
  );
}
