"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { JoinType } from "@/types/event";
import { joinEvent } from "@/app/events/participant-actions";

interface JoinEventButtonProps {
  eventId: string;
  joinType: JoinType;
}

// 참여자가 이벤트에 참가 신청하는 버튼.
// - 선착순/승인 방식은 클릭 즉시 신청(승인 방식은 신청 후 승인 대기 상태가 된다).
// - 비밀번호 방식은 비밀번호 입력 모달을 띄우고, 서버 액션에서 검증 후 신청한다.
export function JoinEventButton({ eventId, joinType }: JoinEventButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false);

  const handleJoin = (withPassword?: string) => {
    setError(null);
    startTransition(async () => {
      const result = await joinEvent(eventId, withPassword);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      setPassword("");
    });
  };

  if (joinType === "password") {
    return (
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setError(null);
            setPassword("");
          }
        }}
      >
        <DialogTrigger asChild>
          <Button size="sm">참가하기</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>참가 비밀번호 입력</DialogTitle>
            <DialogDescription>
              주최자에게 안내받은 참가 비밀번호를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="event-join-password">비밀번호</Label>
            <Input
              id="event-join-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isPending}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              disabled={isPending || !password}
              onClick={() => handleJoin(password)}
            >
              {isPending ? "확인 중..." : "참가하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button size="sm" disabled={isPending} onClick={() => handleJoin()}>
        {isPending ? "참가 신청 중..." : "참가하기"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
