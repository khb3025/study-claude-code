"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { requestCarpool } from "@/app/events/carpool-actions";

// 확정 참여자가 운전자에게 직접 카풀 탑승을 신청하는 버튼
export function CarpoolRequestButton({
  carpoolId,
  eventId,
}: {
  carpoolId: string;
  eventId: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await requestCarpool(carpoolId, eventId);
        })
      }
    >
      <Send className="h-4 w-4" />
      카풀 신청하기
    </Button>
  );
}
