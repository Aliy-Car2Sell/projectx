import { useTranslations } from "next-intl";
import type { AppointmentStatus, DoctorStatus, RecordStatus, UserStatus } from "@projectx/types";
import { Badge, type BadgeTone } from "./Badge";

const appointmentTone: Record<AppointmentStatus, BadgeTone> = {
  scheduled: "primary",
  completed: "success",
  cancelled: "neutral",
  no_show: "danger",
};

const doctorTone: Record<DoctorStatus, BadgeTone> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  blocked: "neutral",
};

const recordTone: Record<RecordStatus, BadgeTone> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

const userTone: Record<UserStatus, BadgeTone> = {
  active: "success",
  blocked: "danger",
};

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const t = useTranslations("status.appointment");
  return (
    <Badge tone={appointmentTone[status]} dot>
      {t(status)}
    </Badge>
  );
}

export function DoctorStatusBadge({ status }: { status: DoctorStatus }) {
  const t = useTranslations("status.doctor");
  return (
    <Badge tone={doctorTone[status]} dot>
      {t(status)}
    </Badge>
  );
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  const t = useTranslations("status.user");
  return (
    <Badge tone={userTone[status]} dot>
      {t(status)}
    </Badge>
  );
}

/** Review state of a patient's upload (records.status.*). */
export function RecordStatusBadge({ status }: { status: RecordStatus }) {
  const t = useTranslations("records.status");
  return (
    <Badge tone={recordTone[status]} dot>
      {t(status)}
    </Badge>
  );
}
