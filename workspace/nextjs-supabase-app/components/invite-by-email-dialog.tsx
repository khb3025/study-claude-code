"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
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
import { inviteByEmail } from "@/app/events/invite-actions";

// 주최자가 가입자 이메일로 이벤트 초대를 보낼 수 있는 다이얼로그
export function InviteByEmailDialog({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setEmail("");
          setErrorMessage(null);
          setSuccessMessage(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Mail className="h-4 w-4" />
          초대하기
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>이메일로 초대하기</DialogTitle>
          <DialogDescription>
            가입된 사용자의 이메일을 입력하면 초대를 보낼 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="invite-email">이메일</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="예: friend@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          {errorMessage && (
            <p className="text-sm text-destructive">{errorMessage}</p>
          )}
          {successMessage && (
            <p className="text-sm text-muted-foreground">{successMessage}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            닫기
          </Button>
          <Button
            disabled={isPending || !email}
            onClick={async () => {
              setIsPending(true);
              setErrorMessage(null);
              setSuccessMessage(null);
              const result = await inviteByEmail(eventId, email);
              setIsPending(false);
              if (result.error) {
                setErrorMessage(result.error);
                return;
              }
              setSuccessMessage("초대를 보냈습니다.");
              setEmail("");
            }}
          >
            초대 보내기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
