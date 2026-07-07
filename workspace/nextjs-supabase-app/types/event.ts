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
  description: string | null;
  location: string | null;
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
  created_at: string;
  // 이벤트 사진 공개 URL(Supabase Storage event-images 버킷에 업로드된 파일, 선택)
  image_url: string | null;
  // 참가비 옵션 활성화 여부(활성화 시 참여 확정될 때 "참가비 정산" 항목에 자동으로 분담액이 추가됨)
  participation_fee_enabled: boolean;
  // 1인당 참가비 금액(원 단위, participation_fee_enabled가 true일 때만 사용)
  participation_fee_amount: number | null;
  // 주최자를 카풀 탑승자 초대 후보 목록에 노출할지 여부(주최자가 직접 토글)
  organizer_carpool_visible: boolean;
  // 주최자가 삭제 처리한 시각(소프트 삭제 — null이면 활성 이벤트).
  // 삭제되어도 참여자/정산 기록은 보존되어 이력 페이지에서 계속 조회 가능하다.
  deleted_at: string | null;
  // 관리자가 등록한 공지(관리자 페이지 전용, null이면 공지 없음)
  admin_notice: string | null;
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

// auth.users는 PostgREST로 직접 조회할 수 없어, 주최자/참여자 등
// "타인"의 이름·아바타 표시용으로 public 스키마에 복제해두는 프로필 정보.
export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  // 사용자가 직접 설정하는 표시용 이름(가입 직후에는 미설정 상태로 null)
  nickname: string | null;
  // true면 닉네임과 함께 실명(full_name)도 공개, false면 닉네임만 공개
  name_visible: boolean;
  created_at: string;
  updated_at: string;
}

// 폼 입력 전용 Zod 스키마: 닉네임 설정/수정, 실명 공개 여부 토글
export const profileFormSchema = z.object({
  nickname: z.string().trim().min(1, "닉네임을 입력해주세요").max(30),
  name_visible: z.boolean(),
  avatar_url: z.string().url().optional().nullable(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export interface Carpool {
  id: string;
  event_id: string;
  driver_id: string;
  seats_total: number;
  departure_point: string | null;
  departure_time: string | null;
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
  // 완료 처리된 시각(당사자가 정산 완료 확인증에서 확인할 수 있도록 기록)
  paid_at: string | null;
}

// 폼 입력 전용 Zod 스키마(서버 생성 필드 id/organizer_id/status 등은 제외)
export const eventFormSchema = z
  .object({
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
    image_url: z.string().url().optional().nullable(),
    participation_fee_enabled: z.boolean(),
    participation_fee_amount: z
      .number()
      .int()
      .nonnegative()
      .optional()
      .nullable(),
  })
  .superRefine((values, ctx) => {
    // 참가비 옵션을 활성화했다면 반드시 1원 이상의 금액을 입력해야 한다
    if (
      values.participation_fee_enabled &&
      (!values.participation_fee_amount || values.participation_fee_amount <= 0)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "참가비 금액을 1원 이상 입력해주세요",
        path: ["participation_fee_amount"],
      });
    }
  });

export type EventFormValues = z.infer<typeof eventFormSchema>;
