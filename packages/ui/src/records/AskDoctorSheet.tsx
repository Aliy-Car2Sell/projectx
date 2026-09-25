"use client";

import { useTranslations } from "next-intl";
import { ChevronRight, Search } from "lucide-react";
import type { DoctorProfile, MedicalRecord } from "@projectx/types";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { RecordCard } from "./RecordCard";

/**
 * "Ask a doctor" about an entry no doctor wrote: pick one of the patient's own doctors
 * (upcoming visits first, then recent ones) or go to the doctor search.
 */
export function AskDoctorSheet({
  record,
  doctors,
  searchHref,
  onPick,
  onClose,
}: {
  record: MedicalRecord | null;
  doctors: DoctorProfile[];
  searchHref: string;
  onPick: (doctor: DoctorProfile) => void;
  onClose: () => void;
}) {
  const t = useTranslations("records.askDoctor");
  const ts = useTranslations("specialties");
  const tc = useTranslations("common");
  return (
    <Modal open={record !== null} onClose={onClose} title={t("title")} closeLabel={tc("close")}>
      {record && (
        <div className="flex flex-col gap-3">
          <RecordCard record={record} />
          <p className="text-sm text-muted">{t("pickDesc")}</p>
          {doctors.length > 0 && (
            <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
              {doctors.map((d) => (
                <li key={d.id}>
                  <button type="button" onClick={() => onPick(d)} className="flex min-h-[56px] w-full items-center gap-3 px-3 py-2 text-left hover:bg-surface">
                    <Avatar src={d.avatarUrl} name={`${d.firstName} ${d.lastName}`} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-heading">
                        {d.firstName} {d.lastName}
                      </span>
                      <span className="block text-xs text-primary-text">{ts(d.specialty)}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Button href={searchHref} variant="secondary" fullWidth icon={<Search className="h-4 w-4" />}>
            {t("other")}
          </Button>
        </div>
      )}
    </Modal>
  );
}
