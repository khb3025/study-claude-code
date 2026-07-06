"use client";

import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

// 확정 참여자가 운전자에게 직접 카풀 탑승을 신청하는 버튼
export function CarpoolRequestButton() {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => {
        // TODO: 카풀 탑승 신청 로직 구현 필요
      }}
    >
      <Send className="h-4 w-4" />
      카풀 신청하기
    </Button>
  );
}
