import type { IllustrationProps } from "./Frame";
import { EmptyAppointments } from "./EmptyAppointments";
import { EmptyChat } from "./EmptyChat";
import { EmptyRecords } from "./EmptyRecords";
import { ErrorOccurred } from "./ErrorOccurred";
import { FindDoctor } from "./FindDoctor";
import { Offline } from "./Offline";
import { PendingApproval } from "./PendingApproval";
import { SearchNotFound } from "./SearchNotFound";
import { Success } from "./Success";

export type { IllustrationProps };
export { EmptyAppointments, EmptyChat, EmptyRecords, ErrorOccurred, FindDoctor, Offline, PendingApproval, SearchNotFound, Success };

export const illustrations = {
  appointments: EmptyAppointments,
  records: EmptyRecords,
  chat: EmptyChat,
  search: SearchNotFound,
  error: ErrorOccurred,
  offline: Offline,
  pending: PendingApproval,
  success: Success,
  findDoctor: FindDoctor,
} as const;

export type IllustrationName = keyof typeof illustrations;

/** An empty-state illustration by name: `<Illustration name="chat" />`. */
export function Illustration({ name, ...props }: IllustrationProps & { name: IllustrationName }) {
  const Drawing = illustrations[name];
  return <Drawing {...props} />;
}
