"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { CarpoolPassengerStatusBadge } from "@/components/event-status-badge";
import type { CarpoolPassengerStatus } from "@/types/event";
import { respondCarpoolPassenger } from "@/app/events/carpool-actions";

// 카풀 탑승 요청/초대 상태에 따라 응답 주체(탑승자 본인 또는 운전자)에게만 수락/거절 버튼을 보여준다
export function CarpoolPassengerActions({
  carpoolPassengerId,
  eventId,
  status,
  viewerRole,
}: {
  carpoolPassengerId: string;
  eventId: string;
  status: CarpoolPassengerStatus;
  viewerRole: "driver" | "passenger" | "other";
}) {
  const [isPending, startTransition] = useTransition();

  const respond = (accept: boolean) =>
    startTransition(async () => {
      await respondCarpoolPassenger(carpoolPassengerId, accept, eventId);
    });

  if (
    (status === "invited" && viewerRole === "passenger") ||
    (status === "requested" && viewerRole === "driver")
  ) {
    return (
      <div className="flex items-center gap-2">
        <Button size="sm" disabled={isPending} onClick={() => respond(true)}>
          수락
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => respond(false)}
        >
          거절
        </Button>
      </div>
    );
  }

  return <CarpoolPassengerStatusBadge status={status} />;
}
