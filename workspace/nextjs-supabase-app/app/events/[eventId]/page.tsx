import { notFound } from "next/navigation";
import {
  Backpack,
  CalendarDays,
  ImageIcon,
  ListChecks,
  Lock,
  MapPin,
  Users,
} from "lucide-react";
import { BackToEventsLink } from "@/components/back-to-events-link";
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
import { CarpoolVolunteerDialog } from "@/components/carpool-volunteer-dialog";
import { CarpoolInvitePassengerDialog } from "@/components/carpool-invite-passenger-dialog";
import { CarpoolPassengerActions } from "@/components/carpool-passenger-actions";
import { CarpoolRequestButton } from "@/components/carpool-request-button";
import {
  CURRENT_USER_ID,
  DUMMY_CARPOOLS,
  DUMMY_CARPOOL_PASSENGERS,
  DUMMY_EVENTS,
  DUMMY_PARTICIPANTS,
  DUMMY_SETTLEMENTS,
  DUMMY_SETTLEMENT_SHARES,
  DUMMY_USERS,
} from "@/app/events/dummy-data";

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

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = DUMMY_EVENTS.find((item) => item.id === eventId);

  if (!event) {
    notFound();
  }

  const participants = DUMMY_PARTICIPANTS.filter(
    (item) => item.event_id === eventId,
  );
  const carpools = DUMMY_CARPOOLS.filter((item) => item.event_id === eventId);
  const carpoolPassengers = DUMMY_CARPOOL_PASSENGERS.filter((passenger) =>
    carpools.some((carpool) => carpool.id === passenger.carpool_id),
  );
  const settlements = DUMMY_SETTLEMENTS.filter(
    (item) => item.event_id === eventId,
  );
  const settlementShares = DUMMY_SETTLEMENT_SHARES.filter((share) =>
    settlements.some((settlement) => settlement.id === share.settlement_id),
  );

  const confirmedParticipantCount = participants.filter(
    (participant) => participant.status === "confirmed",
  ).length;

  const isOrganizer = event.organizer_id === CURRENT_USER_ID;
  const isConfirmedParticipant = participants.some(
    (participant) =>
      participant.user_id === CURRENT_USER_ID &&
      participant.status === "confirmed",
  );
  const canViewSensitiveTabs = isOrganizer || isConfirmedParticipant;
  // 정산 내역은 주최자가 공개로 설정한 경우에만 참여자에게 노출, 비공개면 주최자만 열람 가능
  const canViewSettlement =
    isOrganizer || (canViewSensitiveTabs && event.settlement_visible);

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <div className="flex items-center gap-3">
        <BackToEventsLink />
        <div className="flex flex-1 items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <EventStatusBadge status={event.status} />
        </div>
      </div>

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
          {/* 이벤트 사진 위치 — 업로드 전까지는 이벤트 프로필(임의) 표시 */}
          <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-lg border bg-muted text-sm text-muted-foreground md:aspect-auto md:h-60">
            <ImageIcon className="h-8 w-8" />
            이벤트 사진
          </div>
          <div className="flex flex-col gap-4 rounded-lg border p-4">
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
                <p className="font-medium">현재 참석자</p>
                <p className="text-muted-foreground">
                  {confirmedParticipantCount} / {event.capacity}명
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
          </div>
        </TabsContent>

        <TabsContent value="participants">
          {!canViewSensitiveTabs ? (
            <RestrictedTabNotice />
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
                    <TableCell>{participant.user_id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <ParticipantStatusBadge status={participant.status} />
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
                      {new Date(participant.joined_at).toLocaleString("ko-KR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <ParticipantRowActions status={participant.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="carpool" className="flex flex-col gap-6">
          {!canViewSensitiveTabs ? (
            <RestrictedTabNotice />
          ) : (
            <>
              <div className="flex justify-end">
                <CarpoolVolunteerDialog
                  existingPassengerRecord={(() => {
                    // 이벤트 내 다른 운전자에게 이미 초대중/신청/확정 상태로 걸려 있는지 확인(거절 건은 제외)
                    const record = carpoolPassengers.find(
                      (passenger) =>
                        passenger.passenger_id === CURRENT_USER_ID &&
                        passenger.status !== "rejected",
                    );
                    if (!record) return null;
                    const driver = carpools.find(
                      (carpool) => carpool.id === record.carpool_id,
                    );
                    const driverUser = driver
                      ? DUMMY_USERS[driver.driver_id]
                      : undefined;
                    return {
                      driverName:
                        driverUser?.name ?? driver?.driver_id ?? "알 수 없음",
                      status: record.status as
                        "invited" | "requested" | "confirmed",
                    };
                  })()}
                />
              </div>

              {carpools.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  등록된 카풀이 없습니다.
                </p>
              ) : (
                carpools.map((carpool) => {
                  const driver = DUMMY_USERS[carpool.driver_id];
                  const passengers = carpoolPassengers.filter(
                    (passenger) => passenger.carpool_id === carpool.id,
                  );
                  const isDriver = carpool.driver_id === CURRENT_USER_ID;
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
                      const user = DUMMY_USERS[participant.user_id];
                      return {
                        id: participant.user_id,
                        name: user?.name ?? participant.user_id,
                        initial: user?.initial ?? "?",
                      };
                    });

                  const myPassengerRecord = passengers.find(
                    (passenger) => passenger.passenger_id === CURRENT_USER_ID,
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
                            <AvatarFallback>
                              {driver?.initial ?? "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold">
                              {driver?.name ?? carpool.driver_id} (운전자)
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {carpool.departure_point} ·{" "}
                              {new Date(carpool.departure_time).toLocaleString(
                                "ko-KR",
                              )}{" "}
                              · 좌석 {carpool.seats_total}석
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isDriver && (
                            <CarpoolInvitePassengerDialog
                              eligibleUsers={eligibleUsers}
                            />
                          )}
                          {canRequestCarpool && <CarpoolRequestButton />}
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
                            const passengerUser =
                              DUMMY_USERS[passenger.passenger_id];
                            const viewerRole = isDriver
                              ? "driver"
                              : passenger.passenger_id === CURRENT_USER_ID
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
                                      {passengerUser?.initial ?? "?"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">
                                    {passengerUser?.name ??
                                      passenger.passenger_id}
                                  </span>
                                </div>
                                <CarpoolPassengerActions
                                  status={passenger.status}
                                  viewerRole={viewerRole}
                                />
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
          {!canViewSensitiveTabs ? (
            <RestrictedTabNotice />
          ) : !canViewSettlement ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
              <Lock className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                주최자가 정산 내역을 비공개로 설정했습니다.
              </p>
            </div>
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
                      .filter((share) => share.settlement_id === settlement.id)
                      .map((share) => (
                        <TableRow key={share.id}>
                          <TableCell>{share.user_id}</TableCell>
                          <TableCell>
                            {share.amount.toLocaleString()}원
                          </TableCell>
                          <TableCell>
                            {share.is_paid ? "완료" : "미완료"}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
