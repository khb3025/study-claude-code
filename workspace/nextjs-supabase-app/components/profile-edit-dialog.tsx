"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProfileEditForm } from "@/components/profile-edit-form";

interface ProfileEditDialogProps {
  nickname: string | null;
  nameVisible: boolean;
  avatarUrl: string | null;
  seedName: string;
}

export function ProfileEditDialog({
  nickname,
  nameVisible,
  avatarUrl,
  seedName,
}: ProfileEditDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1"
      >
        <Pencil className="h-3.5 w-3.5" />
        수정
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>프로필 수정</DialogTitle>
        </DialogHeader>
        <ProfileEditForm
          initialNickname={nickname}
          initialNameVisible={nameVisible}
          initialAvatarUrl={avatarUrl}
          seedName={seedName}
          mode="edit"
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
