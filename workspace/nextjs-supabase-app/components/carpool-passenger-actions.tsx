"use client";

import { Button } from "@/components/ui/button";
import { CarpoolPassengerStatusBadge } from "@/components/event-status-badge";
import type { CarpoolPassengerStatus } from "@/types/event";

// 카풀 탑승 요청/초대 상태에 따라 응답 주체(탑승자 본인 또는 운전자)에게만 수락/거절 버튼을 보여준다
export function CarpoolPassengerActions({
  status,
  viewerRole,
}: {
  status: CarpoolPassengerStatus;
  viewerRole: "driver" | "passenger" | "other";
}) {
  if (status === "invited" && viewerRole === "passenger") {
    return (
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => {}}>
          {/* TODO: 카풀 초대 수락 로직 구현 필요 */}
          수락
        </Button>
        <Button size="sm" variant="outline" onClick={() => {}}>
          {/* TODO: 카풀 초대 거절 로직 구현 필요 */}
          거절
        </Button>
      </div>
    );
  }

  if (status === "requested" && viewerRole === "driver") {
    return (
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => {}}>
          {/* TODO: 카풀 신청 수락 로직 구현 필요 */}
          수락
        </Button>
        <Button size="sm" variant="outline" onClick={() => {}}>
          {/* TODO: 카풀 신청 거절 로직 구현 필요 */}
          거절
        </Button>
      </div>
    );
  }

  return <CarpoolPassengerStatusBadge status={status} />;
}
