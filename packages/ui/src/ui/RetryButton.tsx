"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import { Button } from "./Button";

/** "Retry" for error states: drops the demo `?state=` query and refetches the page. */
export function RetryButton() {
  const tc = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();
  return (
    <Button
      variant="secondary"
      icon={<RotateCcw className="h-4 w-4" />}
      onClick={() => {
        router.push(pathname);
        router.refresh();
      }}
    >
      {tc("retry")}
    </Button>
  );
}
