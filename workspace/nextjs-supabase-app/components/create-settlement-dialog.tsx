"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { createSettlement } from "@/app/events/settlement-actions";

// 주최자가 정산 항목(제목/총액)을 생성하면 확정 참여자 수(+ 주최자 포함 여부)로 1/N 분담액이 자동 계산된다
export function CreateSettlementDialog({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [includeOrganizer, setIncludeOrganizer] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          정산 만들기
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>정산 만들기</DialogTitle>
          <DialogDescription>
            확정 참여자 수(주최자 포함 여부 선택 가능)로 자동 1/N 계산되어
            분배됩니다.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="settlement-title">항목명</Label>
            <Input
              id="settlement-title"
              placeholder="예: 강습비"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="settlement-amount">총 금액</Label>
            <Input
              id="settlement-amount"
              type="number"
              min={1}
              placeholder="예: 60000"
              value={totalAmount}
              onChange={(event) => setTotalAmount(event.target.value)}
            />
          </div>
          <div className="flex items-center justify-between gap-2 rounded-lg border p-3">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="settlement-include-organizer">주최자 포함</Label>
              <p className="text-xs text-muted-foreground">
                켜면 주최자도 1/N 분담 대상에 포함됩니다.
              </p>
            </div>
            <Switch
              id="settlement-include-organizer"
              checked={includeOrganizer}
              onCheckedChange={setIncludeOrganizer}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            정산은 주최자가 회비 납부 확인 여부를 기록하는 용도이며, 실제 결제나
            송금을 대행하지 않습니다.
          </p>
          {errorMessage && (
            <p className="text-sm text-destructive">{errorMessage}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button
            disabled={isPending || !title || !totalAmount}
            onClick={async () => {
              setIsPending(true);
              setErrorMessage(null);
              const result = await createSettlement(
                eventId,
                title,
                Number(totalAmount),
                includeOrganizer,
              );
              setIsPending(false);
              if (result.error) {
                setErrorMessage(result.error);
                return;
              }
              setTitle("");
              setTotalAmount("");
              setIncludeOrganizer(false);
              setOpen(false);
            }}
          >
            생성하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
