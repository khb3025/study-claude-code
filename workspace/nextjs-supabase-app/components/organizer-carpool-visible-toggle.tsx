"use client";

import { useState, useTransition } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toggleOrganizerCarpoolVisible } from "@/app/events/carpool-actions";

// 주최자가 카풀 탑승자 후보 목록에 자신을 노출할지 여부를 토글하는 스위치(주최자 전용)
export function OrganizerCarpoolVisibleToggle({
  eventId,
  initialVisible,
}: {
  eventId: string;
  initialVisible: boolean;
}) {
  const [visible, setVisible] = useState(initialVisible);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border p-3">
      <div className="flex flex-col gap-0.5">
        <Label htmlFor="organizer-carpool-visible">참가자 노출</Label>
        <p className="text-xs text-muted-foreground">
          켜면 운전자가 탑승자 초대 목록에서 주최자를 선택할 수 있습니다.
        </p>
      </div>
      <Switch
        id="organizer-carpool-visible"
        checked={visible}
        disabled={isPending}
        onCheckedChange={(checked) => {
          setVisible(checked);
          startTransition(async () => {
            const result = await toggleOrganizerCarpoolVisible(
              eventId,
              checked,
            );
            if (result.error) {
              setVisible(!checked);
            }
          });
        }}
      />
    </div>
  );
}
