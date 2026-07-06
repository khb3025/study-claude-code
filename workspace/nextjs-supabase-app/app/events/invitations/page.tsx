"use client";

import { Mail } from "lucide-react";
import { BackToEventsLink } from "@/components/back-to-events-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DUMMY_EVENTS,
  DUMMY_INVITATIONS,
  DUMMY_ORGANIZERS,
} from "@/app/events/dummy-data";
import { INVITATION_STATUS, type InvitationStatus } from "@/types/event";

const INVITATION_STATUS_LABEL: Record<InvitationStatus, string> = {
  [INVITATION_STATUS.PENDING.value]: INVITATION_STATUS.PENDING.label,
  [INVITATION_STATUS.ACCEPTED.value]: INVITATION_STATUS.ACCEPTED.label,
  [INVITATION_STATUS.DECLINED.value]: INVITATION_STATUS.DECLINED.label,
};

function InvitationStatusBadge({ status }: { status: InvitationStatus }) {
  const variant =
    status === "accepted"
      ? "default"
      : status === "declined"
        ? "destructive"
        : "secondary";
  return <Badge variant={variant}>{INVITATION_STATUS_LABEL[status]}</Badge>;
}

// 받은 이벤트 초대 목록: 수락/거절, 그리고 주최자 차단 액션을 제공한다
export default function InvitationsPage() {
  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <div className="flex items-center gap-3">
        <BackToEventsLink />
        <h1 className="text-2xl font-bold">초대 목록</h1>
      </div>
      {DUMMY_INVITATIONS.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <Mail className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">받은 초대가 없습니다.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {DUMMY_INVITATIONS.map((invitation) => {
            const event = DUMMY_EVENTS.find(
              (item) => item.id === invitation.event_id,
            );
            const organizer = DUMMY_ORGANIZERS[invitation.inviter_id];

            return (
              <Card key={invitation.id}>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {event?.title ?? "알 수 없는 이벤트"}
                      </span>
                      <InvitationStatusBadge status={invitation.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      주최자: {organizer?.name ?? invitation.inviter_id}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {invitation.status === "pending" && (
                      <>
                        <Button size="sm" onClick={() => {}}>
                          {/* TODO: 초대 수락 로직 구현 필요 */}
                          수락
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => {}}>
                          {/* TODO: 초대 거절 로직 구현 필요 */}
                          거절
                        </Button>
                      </>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          이 주최자 차단
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {organizer?.name ?? invitation.inviter_id}님을
                            차단하시겠습니까?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            차단하면 이 주최자가 보내는 향후 초대를 받지
                            않습니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction onClick={() => {}}>
                            {/* TODO: 주최자 차단 로직 구현 필요 */}
                            차단
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
