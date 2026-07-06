"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EligibleUser {
  id: string;
  name: string;
  initial: string;
}

// 운전자가 확정 참여자 중에서 같이 탈 탑승자를 골라 초대하는 다이얼로그
export function CarpoolInvitePassengerDialog({
  eligibleUsers,
}: {
  eligibleUsers: EligibleUser[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="h-4 w-4" />
          탑승자 초대
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>탑승자 초대</DialogTitle>
          <DialogDescription>
            함께 탑승할 참여자를 선택해 초대하세요.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {eligibleUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              초대할 수 있는 참여자가 없습니다.
            </p>
          ) : (
            eligibleUsers.map((user) => (
              <label
                key={user.id}
                className="flex items-center gap-3 rounded-md border p-2"
              >
                <Checkbox onCheckedChange={() => {}} />
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-[10px]">
                    {user.initial}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{user.name}</span>
              </label>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button
            onClick={() => {
              // TODO: 선택한 참여자에게 카풀 탑승 초대 전송 로직 구현 필요
              setOpen(false);
            }}
          >
            초대 보내기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
