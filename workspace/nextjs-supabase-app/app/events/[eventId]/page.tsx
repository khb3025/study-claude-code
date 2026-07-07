import { Suspense } from "react";
import { notFound } from "next/navigation";
import EventDetailLoading from "./loading";
import Image from "next/image";
import Link from "next/link";
import {
  Backpack,
  CalendarDays,
  ImageIcon,
  ListChecks,
  Lock,
  Mail,
  MapPin,
  Pencil,
  Users,
} from "lucide-react";
import { BackToEventsLink } from "@/components/back-to-events-link";
import { Button } from "@/components/ui/button";
import { DeleteEventButton } from "@/components/delete-event-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EventStatusBadge } from "@/components/event-status-badge";
import { ParticipantStatusBadge } from "@/components/event-status-badge";
import { ParticipantRowActions } from "@/components/participant-row-actions";
import { ParticipantCancelButton } from "@/components/participant-cancel-button";
import { CarpoolVolunteerDialog } from "@/components/carpool-volunteer-dialog";
import { CarpoolInvitePassengerDialog } from "@/components/carpool-invite-passenger-dialog";
import { CarpoolPassengerActions } from "@/components/carpool-passenger-actions";
import { CarpoolRequestButton } from "@/components/carpool-request-button";
import { CreateSettlementDialog } from "@/components/create-settlement-dialog";
import { EmptyState } from "@/components/empty-state";
import { OrganizerCarpoolVisibleToggle } from "@/components/organizer-carpool-visible-toggle";
import { SettlementShareToggle } from "@/components/settlement-share-toggle";
import { InviteByEmailDialog } from "@/components/invite-by-email-dialog";
import { JoinEventButton } from "@/components/join-event-button";
import { createClient } from "@/lib/supabase/server";
import type {
  Carpool,
  CarpoolPassenger,
  Event,
  Participant,
  Settlement,
  SettlementShare,
} from "@/types/event";

// 참여자/카풀/정산 탭은 민감 정보이므로 주최자 또는 참여 확정(confirmed)된 사용자만 볼 수 있다
function RestrictedTabNotice() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
      <Lock className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        참여가 확정된 참여자만 볼 수 있는 정보입니다.
      </p>
    </div>
  );
}

async function EventDetail({ eventId }: { eventId: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: eventRow } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (!eventRow) {
    notFound();
  }
  const event = eventRow as Event;

  const { count: confirmedParticipantCount } = await supabase
    .from("participants")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("status", "confirmed");

  const currentUserId = user?.id ?? null;

  const { data: participantRows } = await supabase
    .from("participants")
    .select("*")
    .eq("event_id", eventId)
    .order("joined_at", { ascending: true });
  const participants = (participantRows ?? []) as Participant[];

  const { data: carpoolRows } = await supabase
    .from("carpools")
    .select("*")
    .eq("event_id", eventId);
  const carpools = (carpoolRows ?? []) as Carpool[];

  const carpoolIds = carpools.map((carpool) => carpool.id);
  const { data: carpoolPassengerRows } =
    carpoolIds.length > 0
      ? await supabase
          .from("carpool_passengers")
          .select("*")
          .in("carpool_id", carpoolIds)
      : { data: [] };
  const carpoolPassengers = (carpoolPassengerRows ?? []) as CarpoolPassenger[];

  const { data: settlementRows } = await supabase
    .from("settlements")
    .select("*")
    .eq("event_id", eventId);
  const settlements = (settlementRows ?? []) as Settlement[];

  const settlementIds = settlements.map((settlement) => settlement.id);
  const { data: settlementShareRows } =
    settlementIds.length > 0
      ? await supabase
          .from("settlement_shares")
          .select("*")
          .in("settlement_id", settlementIds)
      : { data: [] };
  const settlementShares = (settlementShareRows ?? []) as SettlementShare[];

  // 참여자/카풀 관련자 이름 표시를 위해 profiles를 조회해 user_id → 표시 정보 맵으로 구성
  const relatedUserIds = Array.from(
    new Set([
      event.organizer_id,
      ...participants.map((participant) => participant.user_id),
      ...carpools.map((carpool) => carpool.driver_id),
      ...carpoolPassengers.map((passenger) => passenger.passenger_id),
    ]),
  );
  const { data: profileRows } =
    relatedUserIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, nickname, full_name, name_visible")
          .in("id", relatedUserIds)
      : { data: [] };
  const userDisplayMap = new Map(
    (profileRows ?? []).map((profile) => {
      const displayName =
        profile.nickname ?? (profile.name_visible ? profile.full_name : null);
      const name = displayName ?? "이름 미설정";
      return [profile.id as string, { name, initial: name.charAt(0) }];
    }),
  );
  const getUserDisplay = (userId: string) =>
    userDisplayMap.get(userId) ?? { name: userId, initial: "?" };

  const isOrganizer = event.organizer_id === currentUserId;
  const isConfirmedParticipant = participants.some(
    (participant) =>
      participant.user_id === currentUserId &&
      participant.status === "confirmed",
  );
  const canViewSensitiveTabs = isOrganizer || isConfirmedParticipant;
  // 강퇴된 본인은 참여자 탭 전체를 볼 권한은 없지만, 자신의 강퇴 사유는 확인할 수 있어야 한다
  const myKickedRecord = participants.find(
    (participant) =>
      participant.user_id === currentUserId && participant.status === "kicked",
  );
  // 참가 버튼 노출 여부 판단용: 신청 중이거나 이미 참여 중인 상태(cancelled/kicked는 재신청 가능하므로 제외)
  const myActiveParticipantRecord = participants.find(
    (participant) =>
      participant.user_id === currentUserId &&
      ["confirmed", "waitlisted", "pending_approval"].includes(
        participant.status,
      ),
  );
  const canJoinEvent =
    !isOrganizer &&
    currentUserId !== null &&
    !event.deleted_at &&
    !myActiveParticipantRecord;
  // 참여 취소 컷오프(이벤트 시작 24시간 이내)는 confirmed 상태에만 적용되며,
  // cancel_participation RPC와 동일한 정책을 UI에서도 미리 계산해 즉시 안내한다.
  const cancelCutoffAt = new Date(
    new Date(event.starts_at).getTime() - 24 * 60 * 60 * 1000,
  );
  const isCancelCutoff = new Date() >= cancelCutoffAt;
  // 정산 내역은 주최자가 공개로 설정한 경우에만 참여자에게 노출, 비공개면 주최자만 열람 가능
  const canViewSettlement =
    isOrganizer || (canViewSensitiveTabs && event.settlement_visible);
  // 참여자 탭 접근 권한(강퇴/취소 등으로 상실)과 무관하게, 본인에게 배정된 정산 분담
  // 내역은 완료 확인증 형태로 언제든 볼 수 있어야 한다
  const mySettlementShares = settlementShares.filter(
    (share) => share.user_id === currentUserId,
  );

  // 이벤트 문의 정보(주최자 이름/이메일)는 주최자 본인 또는 확정 참여자만 조회 가능한
  // RPC(get_event_organizer_contact)를 통해서만 가져온다 — profiles.email 전체 공개 금지
  const organizerContact = canViewSensitiveTabs
    ? (
        await supabase.rpc("get_event_organizer_contact", {
          p_event_id: eventId,
        })
      ).data?.[0]
    : null;

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <div className="flex items-center gap-3">
        <BackToEventsLink />
        <div className="flex flex-1 items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <div className="flex items-center gap-2">
            <EventStatusBadge status={event.status} />
            {isOrganizer && !event.deleted_at && (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/events/${event.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                    수정하기
                  </Link>
                </Button>
                <DeleteEventButton eventId={event.id} />
              </>
            )}
            {canJoinEvent &&
              (event.status === "recruiting" ? (
                <JoinEventButton
                  eventId={event.id}
                  joinType={event.join_type}
                />
              ) : (
                <span className="text-sm text-muted-foreground">
                  모집이 마감된 이벤트입니다
                </span>
              ))}
            {!isOrganizer &&
              myActiveParticipantRecord?.status === "waitlisted" && (
                <span className="text-sm text-muted-foreground">대기 중</span>
              )}
            {!isOrganizer &&
              myActiveParticipantRecord?.status === "pending_approval" && (
                <span className="text-sm text-muted-foreground">
                  승인 대기 중
                </span>
              )}
          </div>
        </div>
      </div>

      {event.deleted_at && (
        <div className="flex items-center gap-2 rounded-lg border border-dashed bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          <Lock className="h-4 w-4 shrink-0" />
          주최자가 삭제한 이벤트입니다. 이전 참여/정산 이력을 조회만 할 수
          있습니다.
        </div>
      )}

      <Tabs defaultValue="notice">
        <TabsList>
          <TabsTrigger value="notice">공지</TabsTrigger>
          <TabsTrigger value="participants">참여자</TabsTrigger>
          <TabsTrigger value="carpool">카풀</TabsTrigger>
          <TabsTrigger value="settlement">정산</TabsTrigger>
        </TabsList>

        <TabsContent
          value="notice"
          className="grid grid-cols-1 gap-4 md:grid-cols-[240px_1fr]"
        >
          {event.image_url ? (
            <div className="relative aspect-square w-full overflow-hidden rounded-lg border md:aspect-auto md:h-60">
              <Image
                src={event.image_url}
                alt={event.title}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-lg border bg-muted text-sm text-muted-foreground md:aspect-auto md:h-60">
              <ImageIcon className="h-8 w-8" />
              이벤트 사진
            </div>
          )}
          <div className="flex flex-col gap-4 rounded-lg border p-4">
            {event.admin_notice && (
              <div className="rounded-md border border-amber-500/50 bg-amber-500/10 p-3 text-sm">
                <p className="font-medium text-amber-600 dark:text-amber-400">
                  관리자 공지
                </p>
                <p className="whitespace-pre-wrap text-amber-700 dark:text-amber-300">
                  {event.admin_notice}
                </p>
              </div>
            )}
            <p>{event.description}</p>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="font-medium">이벤트 장소</p>
                <p className="text-muted-foreground">{event.location}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="font-medium">이벤트 일시</p>
                <p className="text-muted-foreground">
                  {new Date(event.starts_at).toLocaleString("ko-KR")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Users className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="font-medium">현재 참석자 (주최자 제외)</p>
                <p className="text-muted-foreground">
                  {confirmedParticipantCount ?? 0} / {event.capacity}명
                </p>
              </div>
            </div>
            {event.schedule && (
              <div className="flex items-start gap-2 text-sm">
                <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-medium">이벤트 일정</p>
                  <p className="text-muted-foreground">{event.schedule}</p>
                </div>
              </div>
            )}
            {event.items_to_bring && (
              <div className="flex items-start gap-2 text-sm">
                <Backpack className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-medium">준비물</p>
                  <p className="text-muted-foreground">
                    {event.items_to_bring}
                  </p>
                </div>
              </div>
            )}
            {organizerContact && (
              <div className="flex items-start gap-2 text-sm">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-medium">이벤트 문의</p>
                  <p className="text-muted-foreground">
                    {organizerContact.name}
                    {organizerContact.email
                      ? ` · ${organizerContact.email}`
                      : ""}
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="participants" className="flex flex-col gap-4">
          {!canViewSensitiveTabs ? (
            myKickedRecord ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
                <Lock className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">
                  이 이벤트에서 강퇴되었습니다.
                </p>
                {myKickedRecord.kick_reason_visible &&
                  myKickedRecord.kick_reason && (
                    <p className="text-sm text-muted-foreground">
                      사유: {myKickedRecord.kick_reason}
                    </p>
                  )}
              </div>
            ) : (
              <RestrictedTabNotice />
            )
          ) : (
            <>
              {isOrganizer && !event.deleted_at && (
                <div className="flex justify-end">
                  <InviteByEmailDialog eventId={event.id} />
                </div>
              )}
              {participants.length === 0 ? (
                <EmptyState icon={<Users />} title="아직 참여자가 없습니다." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>참여자</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>신청 시각</TableHead>
                      <TableHead className="text-right">액션</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participants.map((participant) => (
                      <TableRow key={participant.id}>
                        <TableCell>
                          {getUserDisplay(participant.user_id).name}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <ParticipantStatusBadge
                              status={participant.status}
                            />
                            {participant.status === "kicked" &&
                              participant.kick_reason_visible &&
                              participant.kick_reason && (
                                <span className="text-xs text-muted-foreground">
                                  사유: {participant.kick_reason}
                                </span>
                              )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(participant.joined_at).toLocaleString(
                            "ko-KR",
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isOrganizer && !event.deleted_at && (
                            <ParticipantRowActions
                              participantId={participant.id}
                              eventId={event.id}
                              status={participant.status}
                            />
                          )}
                          {!isOrganizer &&
                            !event.deleted_at &&
                            participant.user_id === currentUserId &&
                            (participant.status === "confirmed" ||
                              participant.status === "waitlisted" ||
                              participant.status === "pending_approval") && (
                              <div className="flex justify-end">
                                <ParticipantCancelButton
                                  participantId={participant.id}
                                  eventId={event.id}
                                  isCutoff={
                                    participant.status === "confirmed" &&
                                    isCancelCutoff
                                  }
                                />
                              </div>
                            )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="carpool" className="flex flex-col gap-6">
          {!canViewSensitiveTabs ? (
            <RestrictedTabNotice />
          ) : (
            <>
              {isOrganizer && !event.deleted_at && (
                <OrganizerCarpoolVisibleToggle
                  eventId={event.id}
                  initialVisible={event.organizer_carpool_visible}
                />
              )}
              {!event.deleted_at && (
                <div className="flex justify-end">
                  <CarpoolVolunteerDialog
                    eventId={event.id}
                    eventDate={event.starts_at}
                    existingPassengerRecord={(() => {
                      // 이벤트 내 다른 운전자에게 이미 초대중/신청/확정 상태로 걸려 있는지 확인(거절 건은 제외)
                      const record = carpoolPassengers.find(
                        (passenger) =>
                          passenger.passenger_id === currentUserId &&
                          passenger.status !== "rejected",
                      );
                      if (!record) return null;
                      const driver = carpools.find(
                        (carpool) => carpool.id === record.carpool_id,
                      );
                      const driverName = driver
                        ? getUserDisplay(driver.driver_id).name
                        : "알 수 없음";
                      return {
                        driverName,
                        status: record.status as
                          "invited" | "requested" | "confirmed",
                      };
                    })()}
                  />
                </div>
              )}

              {carpools.length === 0 ? (
                <EmptyState title="등록된 카풀이 없습니다." />
              ) : (
                carpools.map((carpool) => {
                  const driver = getUserDisplay(carpool.driver_id);
                  const passengers = carpoolPassengers.filter(
                    (passenger) => passenger.carpool_id === carpool.id,
                  );
                  const isDriver = carpool.driver_id === currentUserId;
                  // 초대/신청 진행 중이거나 확정된 탑승자만 제외 — 거절된 사람은 재초대할 수 있도록 목록에 남겨둔다
                  const activePassengerIds = new Set(
                    passengers
                      .filter((passenger) => passenger.status !== "rejected")
                      .map((passenger) => passenger.passenger_id),
                  );
                  const eligibleUsers = participants
                    .filter(
                      (participant) =>
                        participant.status === "confirmed" &&
                        participant.user_id !== carpool.driver_id &&
                        !activePassengerIds.has(participant.user_id),
                    )
                    .map((participant) => {
                      const user = getUserDisplay(participant.user_id);
                      return {
                        id: participant.user_id,
                        name: user.name,
                        initial: user.initial,
                      };
                    });
                  // 주최자가 노출을 켠 경우, 참여자 명단에 없어도(참가자로 참여하지 않아도)
                  // 탑승자 초대 후보 목록에 주최자를 추가로 노출한다.
                  if (
                    event.organizer_carpool_visible &&
                    event.organizer_id !== carpool.driver_id &&
                    !activePassengerIds.has(event.organizer_id) &&
                    !eligibleUsers.some(
                      (user) => user.id === event.organizer_id,
                    )
                  ) {
                    const organizerUser = getUserDisplay(event.organizer_id);
                    eligibleUsers.push({
                      id: event.organizer_id,
                      name: `${organizerUser.name} (주최자)`,
                      initial: organizerUser.initial,
                    });
                  }

                  const myPassengerRecord = passengers.find(
                    (passenger) => passenger.passenger_id === currentUserId,
                  );
                  // 운전자에게 거절당한 신청(내가 신청 주체)만 재신청을 막고, 그 외에는 다시 신청 가능
                  const isBlockedFromRequesting =
                    myPassengerRecord?.status === "rejected" &&
                    myPassengerRecord.initiated_by === "passenger";
                  const canRequestCarpool =
                    !isDriver &&
                    (!myPassengerRecord ||
                      (myPassengerRecord.status === "rejected" &&
                        myPassengerRecord.initiated_by === "driver"));

                  return (
                    <Card key={carpool.id}>
                      <CardHeader className="flex flex-row items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{driver.initial}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold">
                              {driver.name} (운전자)
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {carpool.departure_point} ·{" "}
                              {carpool.departure_time
                                ? new Date(
                                    carpool.departure_time,
                                  ).toLocaleString("ko-KR")
                                : "출발 시각 미정"}{" "}
                              · 좌석 {carpool.seats_total}석
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isDriver && !event.deleted_at && (
                            <CarpoolInvitePassengerDialog
                              carpoolId={carpool.id}
                              eventId={event.id}
                              eligibleUsers={eligibleUsers}
                            />
                          )}
                          {canRequestCarpool && !event.deleted_at && (
                            <CarpoolRequestButton
                              carpoolId={carpool.id}
                              eventId={event.id}
                            />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-2">
                        {isBlockedFromRequesting && (
                          <p className="text-xs text-muted-foreground">
                            이 운전자에게 신청이 거절되어 재신청할 수 없습니다.
                          </p>
                        )}
                        {passengers.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            아직 탑승자가 없습니다.
                          </p>
                        ) : (
                          passengers.map((passenger) => {
                            const passengerUser = getUserDisplay(
                              passenger.passenger_id,
                            );
                            const viewerRole = isDriver
                              ? "driver"
                              : passenger.passenger_id === currentUserId
                                ? "passenger"
                                : "other";
                            return (
                              <div
                                key={passenger.id}
                                className="flex items-center justify-between gap-2"
                              >
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-[10px]">
                                      {passengerUser.initial}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">
                                    {passengerUser.name}
                                  </span>
                                </div>
                                {!event.deleted_at && (
                                  <CarpoolPassengerActions
                                    carpoolPassengerId={passenger.id}
                                    eventId={event.id}
                                    status={passenger.status}
                                    viewerRole={viewerRole}
                                  />
                                )}
                              </div>
                            );
                          })
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="settlement" className="flex flex-col gap-6">
          {!canViewSettlement && mySettlementShares.length > 0 ? (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-muted-foreground">
                참여자 탭 접근 권한과 무관하게, 본인에게 배정된 정산 완료
                확인증은 언제든 확인할 수 있습니다.
              </p>
              {mySettlementShares.map((share) => {
                const settlement = settlements.find(
                  (item) => item.id === share.settlement_id,
                );
                return (
                  <Card key={share.id}>
                    <CardContent className="flex flex-col gap-2 p-4">
                      <p className="text-xs text-muted-foreground">
                        {event.title}
                      </p>
                      <p className="font-semibold">
                        {settlement?.title ?? "정산"} —{" "}
                        {share.amount.toLocaleString()}원
                      </p>
                      <p className="text-sm">
                        상태:{" "}
                        <span className="font-medium">
                          {share.is_paid ? "완료" : "미완료"}
                        </span>
                      </p>
                      {share.is_paid && share.paid_at && (
                        <p className="text-xs text-muted-foreground">
                          완료 처리 시각:{" "}
                          {new Date(share.paid_at).toLocaleString("ko-KR")}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : !canViewSensitiveTabs ? (
            <RestrictedTabNotice />
          ) : !canViewSettlement ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
              <Lock className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                주최자가 정산 내역을 비공개로 설정했습니다.
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                정산 내역은 주최자가 회비 납부 확인 여부를 기록하는 용도이며,
                실제 결제나 송금을 대행하지 않습니다.
              </p>
              {isOrganizer && !event.deleted_at && (
                <div className="flex justify-end">
                  <CreateSettlementDialog eventId={event.id} />
                </div>
              )}
              {settlements.length === 0 ? (
                <EmptyState title="등록된 정산이 없습니다." />
              ) : (
                settlements.map((settlement) => (
                  <div key={settlement.id} className="flex flex-col gap-2">
                    <p className="font-semibold">
                      {settlement.title} — 총{" "}
                      {settlement.total_amount.toLocaleString()}원
                    </p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>참여자</TableHead>
                          <TableHead>분담액</TableHead>
                          <TableHead>완료 여부</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {settlementShares
                          .filter(
                            (share) => share.settlement_id === settlement.id,
                          )
                          .map((share) => (
                            <TableRow key={share.id}>
                              <TableCell>
                                {getUserDisplay(share.user_id).name}
                              </TableCell>
                              <TableCell>
                                {share.amount.toLocaleString()}원
                              </TableCell>
                              <TableCell>
                                <SettlementShareToggle
                                  shareId={share.id}
                                  eventId={event.id}
                                  isPaid={share.is_paid}
                                  editable={isOrganizer && !event.deleted_at}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                ))
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  return (
    <Suspense fallback={<EventDetailLoading />}>
      <EventDetailResolved params={params} />
    </Suspense>
  );
}

async function EventDetailResolved({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  return <EventDetail eventId={eventId} />;
}
