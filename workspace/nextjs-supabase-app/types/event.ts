import { z } from "zod";

// DB 경계 인터페이스 필드는 스네이크케이스(DB 컬럼명 그대로)를 사용한다.
// 이유: Task 004에서 생성되는 Supabase Database 제네릭 타입과 필드명을 1:1로
// 맞춰 매핑 계층 없이 재사용하기 위한 의도적 예외(전역 CLAUDE.md camelCase 방침의 예외).

export const EVENT_STATUS = {
  RECRUITING: { value: "recruiting", label: "모집중" },
  CLOSED: { value: "closed", label: "마감" },
  FINISHED: { value: "finished", label: "종료" },
} as const;

export const PARTICIPANT_STATUS = {
  CONFIRMED: { value: "confirmed", label: "확정" },
  WAITLISTED: { value: "waitlisted", label: "대기" },
  PENDING_APPROVAL: { value: "pending_approval", label: "승인 대기" },
  CANCELLED: { value: "cancelled", label: "취소" },
  KICKED: { value: "kicked", label: "강퇴" },
} as const;

export const JOIN_TYPE = {
  FIRST_COME: { value: "first_come", label: "선착순" },
  PASSWORD: { value: "password", label: "비밀번호" },
  APPROVAL: { value: "approval", label: "승인" },
} as const;

export const INVITATION_STATUS = {
  PENDING: { value: "pending", label: "대기중" },
  ACCEPTED: { value: "accepted", label: "수락됨" },
  DECLINED: { value: "declined", label: "거절됨" },
} as const;

export const FRIENDSHIP_STATUS = {
  PENDING: { value: "pending", label: "요청중" },
  ACCEPTED: { value: "accepted", label: "친구" },
} as const;

export const RECURRENCE_TYPE = {
  NONE: { value: "none", label: "반복 안함" },
  DAILY: { value: "daily", label: "매일" },
  WEEKLY: { value: "weekly", label: "매주" },
  MONTHLY_NTH_WEEKDAY: {
    value: "monthly_nth_weekday",
    label: "매달 N번째 요일",
  },
  MONTHLY_DATE: { value: "monthly_date", label: "매달 특정 일자" },
} as const;

export const WEEKDAY_OPTIONS = [
  { value: 0, label: "일요일" },
  { value: 1, label: "월요일" },
  { value: 2, label: "화요일" },
  { value: 3, label: "수요일" },
  { value: 4, label: "목요일" },
  { value: 5, label: "금요일" },
  { value: 6, label: "토요일" },
] as const;

export const WEEK_OF_MONTH_OPTIONS = [
  { value: 1, label: "첫째주" },
  { value: 2, label: "둘째주" },
  { value: 3, label: "셋째주" },
  { value: 4, label: "넷째주" },
  { value: -1, label: "마지막 주" },
] as const;

export const CARPOOL_PASSENGER_STATUS = {
  INVITED: { value: "invited", label: "초대중" },
  REQUESTED: { value: "requested", label: "신청" },
  CONFIRMED: { value: "confirmed", label: "확정" },
  REJECTED: { value: "rejected", label: "거절" },
} as const;

// 카풀 탑승 요청이 운전자의 초대로 시작됐는지, 탑승자의 자발적 신청으로 시작됐는지 구분
export const CARPOOL_INITIATED_BY = {
  DRIVER: "driver",
  PASSENGER: "passenger",
} as const;

export type CarpoolInitiatedBy =
  (typeof CARPOOL_INITIATED_BY)[keyof typeof CARPOOL_INITIATED_BY];

export type EventStatus =
  (typeof EVENT_STATUS)[keyof typeof EVENT_STATUS]["value"];
export type ParticipantStatus =
  (typeof PARTICIPANT_STATUS)[keyof typeof PARTICIPANT_STATUS]["value"];
export type CarpoolPassengerStatus =
  (typeof CARPOOL_PASSENGER_STATUS)[keyof typeof CARPOOL_PASSENGER_STATUS]["value"];
export type JoinType = (typeof JOIN_TYPE)[keyof typeof JOIN_TYPE]["value"];
export type InvitationStatus =
  (typeof INVITATION_STATUS)[keyof typeof INVITATION_STATUS]["value"];
export type FriendshipStatus =
  (typeof FRIENDSHIP_STATUS)[keyof typeof FRIENDSHIP_STATUS]["value"];
export type RecurrenceType =
  (typeof RECURRENCE_TYPE)[keyof typeof RECURRENCE_TYPE]["value"];

export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  description: string;
  location: string;
  starts_at: string;
  capacity: number;
  status: EventStatus;
  join_type: JoinType;
  password_hash: string | null;
  schedule: string | null;
  items_to_bring: string | null;
  recurrence_type: RecurrenceType;
  // 정산 내역을 참여자 전체에게 공개할지 여부(비공개 시 주최자만 열람 가능)
  settlement_visible: boolean;
}

export interface Participant {
  id: string;
  event_id: string;
  user_id: string;
  status: ParticipantStatus;
  joined_at: string;
  kicked_at: string | null;
  kick_reason: string | null;
  kick_reason_visible: boolean;
}

export interface Invitation {
  id: string;
  event_id: string;
  inviter_id: string;
  invitee_email: string;
  invitee_id: string | null;
  status: InvitationStatus;
  created_at: string;
}

export interface Blacklist {
  id: string;
  blocker_id: string;
  blocked_organizer_id: string;
  created_at: string;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: FriendshipStatus;
  created_at: string;
}

export interface AdminUser {
  user_id: string;
  granted_at: string;
}

export interface Carpool {
  id: string;
  event_id: string;
  driver_id: string;
  seats_total: number;
  departure_point: string;
  departure_time: string;
}

export interface CarpoolPassenger {
  id: string;
  carpool_id: string;
  passenger_id: string;
  status: CarpoolPassengerStatus;
  initiated_by: CarpoolInitiatedBy;
}

export interface Settlement {
  id: string;
  event_id: string;
  title: string;
  total_amount: number;
  created_by: string;
}

export interface SettlementShare {
  id: string;
  settlement_id: string;
  user_id: string;
  amount: number;
  is_paid: boolean;
}

// 폼 입력 전용 Zod 스키마(서버 생성 필드 id/organizer_id/status 등은 제외)
export const eventFormSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  description: z.string().min(1, "설명(공지사항)을 입력해주세요"),
  location: z.string().min(1, "장소를 입력해주세요"),
  starts_at: z.date({ error: "일시를 선택해주세요" }),
  capacity: z.number().int().min(1, "정원은 1명 이상이어야 합니다"),
  join_type: z.enum(["first_come", "password", "approval"]),
  password: z.string().optional(),
  schedule: z.string().optional(),
  items_to_bring: z.string().optional(),
  recurrence_type: z.enum([
    "none",
    "daily",
    "weekly",
    "monthly_nth_weekday",
    "monthly_date",
  ]),
  recurrence_weekday: z.number().int().min(0).max(6).optional(),
  recurrence_week_of_month: z.number().int().optional(),
  recurrence_day_of_month: z.number().int().min(1).max(31).optional(),
  recurrence_time: z.string().optional(),
  settlement_visible: z.boolean(),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;
