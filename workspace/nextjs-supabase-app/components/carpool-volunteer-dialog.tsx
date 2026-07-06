"use client";

import { useState } from "react";
import { Car, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ExistingPassengerRecord {
  driverName: string;
  status: "invited" | "requested" | "confirmed";
}

// 이미 다른 운전자의 카풀 대상자(초대중/신청/확정)인 경우 상태별로 보여줄 확인 문구
const WARNING_MESSAGE: Record<
  ExistingPassengerRecord["status"],
  (driverName: string) => string
> = {
  invited: (driverName) =>
    `${driverName}님의 카풀에 탑승 초대를 받은 상태입니다. 그래도 운전자로 지원하시겠습니까?`,
  requested: (driverName) =>
    `${driverName}님에게 카풀 탑승을 신청한 상태입니다. 그래도 운전자로 지원하시겠습니까?`,
  confirmed: (driverName) =>
    `이미 ${driverName}님의 카풀에 탑승이 확정된 상태입니다. 그래도 운전자로 지원하시겠습니까?`,
};

// 참여자가 카풀 운전자로 지원할 때 좌석 수/출발지/출발 시간을 입력하는 다이얼로그
export function CarpoolVolunteerDialog({
  existingPassengerRecord = null,
}: {
  existingPassengerRecord?: ExistingPassengerRecord | null;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"warning" | "form">(
    existingPassengerRecord ? "warning" : "form",
  );

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setStep(existingPassengerRecord ? "warning" : "form");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Car className="h-4 w-4" />
          운전자로 지원하기
        </Button>
      </DialogTrigger>
      <DialogContent>
        {step === "warning" && existingPassengerRecord ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TriangleAlert className="h-5 w-5 text-destructive" />
                카풀 탑승 상태 확인
              </DialogTitle>
              <DialogDescription>
                {WARNING_MESSAGE[existingPassengerRecord.status](
                  existingPassengerRecord.driverName,
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                취소
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  // TODO: 무시하고 지원하기 선택 시 기존 카풀 탑승(초대중/신청/확정) 레코드 제거 로직 구현 필요
                  setStep("form");
                }}
              >
                무시하고 지원하기
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>카풀 운전자 지원</DialogTitle>
              <DialogDescription>
                함께 탈 탑승자에게 보여줄 카풀 정보를 입력해주세요.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="carpool-seats">탑승 가능 좌석 수</Label>
                <Input
                  id="carpool-seats"
                  type="number"
                  min={1}
                  placeholder="예: 3"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="carpool-departure-point">출발지</Label>
                <Input
                  id="carpool-departure-point"
                  placeholder="예: 강남역 2번 출구"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="carpool-departure-time">출발 시간</Label>
                <Input id="carpool-departure-time" type="time" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                취소
              </Button>
              <Button
                onClick={() => {
                  // TODO: 카풀 운전자 등록 로직 구현 필요
                  setOpen(false);
                }}
              >
                지원하기
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
