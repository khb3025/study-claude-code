import { Badge } from "@/components/ui/badge";
import {
  CARPOOL_PASSENGER_STATUS,
  EVENT_STATUS,
  PARTICIPANT_STATUS,
  type CarpoolPassengerStatus,
  type EventStatus,
  type ParticipantStatus,
} from "@/types/event";

const EVENT_STATUS_LABEL: Record<EventStatus, string> = {
  [EVENT_STATUS.RECRUITING.value]: EVENT_STATUS.RECRUITING.label,
  [EVENT_STATUS.CLOSED.value]: EVENT_STATUS.CLOSED.label,
  [EVENT_STATUS.FINISHED.value]: EVENT_STATUS.FINISHED.label,
};

const PARTICIPANT_STATUS_LABEL: Record<ParticipantStatus, string> = {
  [PARTICIPANT_STATUS.CONFIRMED.value]: PARTICIPANT_STATUS.CONFIRMED.label,
  [PARTICIPANT_STATUS.WAITLISTED.value]: PARTICIPANT_STATUS.WAITLISTED.label,
  [PARTICIPANT_STATUS.PENDING_APPROVAL.value]:
    PARTICIPANT_STATUS.PENDING_APPROVAL.label,
  [PARTICIPANT_STATUS.CANCELLED.value]: PARTICIPANT_STATUS.CANCELLED.label,
  [PARTICIPANT_STATUS.KICKED.value]: PARTICIPANT_STATUS.KICKED.label,
};

const CARPOOL_PASSENGER_STATUS_LABEL: Record<CarpoolPassengerStatus, string> = {
  [CARPOOL_PASSENGER_STATUS.INVITED.value]:
    CARPOOL_PASSENGER_STATUS.INVITED.label,
  [CARPOOL_PASSENGER_STATUS.REQUESTED.value]:
    CARPOOL_PASSENGER_STATUS.REQUESTED.label,
  [CARPOOL_PASSENGER_STATUS.CONFIRMED.value]:
    CARPOOL_PASSENGER_STATUS.CONFIRMED.label,
  [CARPOOL_PASSENGER_STATUS.REJECTED.value]:
    CARPOOL_PASSENGER_STATUS.REJECTED.label,
};

export function EventStatusBadge({ status }: { status: EventStatus }) {
  const variant = status === "recruiting" ? "default" : "secondary";
  return <Badge variant={variant}>{EVENT_STATUS_LABEL[status]}</Badge>;
}

export function ParticipantStatusBadge({
  status,
}: {
  status: ParticipantStatus;
}) {
  const variant =
    status === "confirmed"
      ? "default"
      : status === "waitlisted"
        ? "secondary"
        : status === "kicked"
          ? "destructive"
          : status === "pending_approval"
            ? "outline"
            : "outline";
  return <Badge variant={variant}>{PARTICIPANT_STATUS_LABEL[status]}</Badge>;
}

export function CarpoolPassengerStatusBadge({
  status,
}: {
  status: CarpoolPassengerStatus;
}) {
  const variant =
    status === "confirmed"
      ? "default"
      : status === "requested" || status === "invited"
        ? "secondary"
        : "outline";
  return (
    <Badge variant={variant}>{CARPOOL_PASSENGER_STATUS_LABEL[status]}</Badge>
  );
}
