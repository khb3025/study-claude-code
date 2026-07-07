"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  acceptFriendRequest,
  rejectFriendRequest,
} from "@/app/events/friends-actions";

// 받은 친구 요청의 수락/거절 버튼(실제 Server Action 연동)
export function FriendRequestActions({
  friendshipId,
}: {
  friendshipId: string;
}) {
  const [isSubmitting, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={isSubmitting}
          onClick={() =>
            startTransition(async () => {
              const result = await acceptFriendRequest(friendshipId);
              setErrorMessage(result.error);
            })
          }
        >
          수락
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isSubmitting}
          onClick={() =>
            startTransition(async () => {
              const result = await rejectFriendRequest(friendshipId);
              setErrorMessage(result.error);
            })
          }
        >
          거절
        </Button>
      </div>
      {errorMessage && (
        <p className="text-xs text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}
