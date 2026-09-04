import { useTranslations } from "next-intl";
import type { AppointmentStatus, DoctorStatus, UserStatus } from "@/types";
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
