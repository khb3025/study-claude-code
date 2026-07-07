"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifyEventPassword } from "@/lib/event-password";

// 이벤트 참여 신청(선착순/승인/비밀번호 공통 진입점).
// 비밀번호 참가 방식은 password_hash가 클라이언트에 노출되면 안 되므로,
// 이 서버 액션 안에서만 이벤트 행을 조회해 검증한 뒤 RPC를 호출한다.
export async function joinEvent(eventId: string, password?: string) {
  const supabase = await createClient();

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("join_type, password_hash")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    return { error: "이벤트를 찾을 수 없습니다." };
  }

  if (event.join_type === "password") {
    if (!password) {
      return { error: "비밀번호를 입력해주세요." };
    }
    if (
      !event.password_hash ||
      !verifyEventPassword(password, event.password_hash)
    ) {
      return { error: "비밀번호가 일치하지 않습니다." };
    }
  }

  const { error } = await supabase.rpc("join_event", { p_event_id: eventId });
  if (error) {
    return { error: error.message };
  }
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/admin/events");
  return { error: null };
}

// 참여 취소(confirmed였다면 대기열 1순위 자동 승격은 RPC 내부에서 처리)
export async function cancelParticipation(
  participantId: string,
  eventId: string,
) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_participation", {
    p_participant_id: participantId,
  });
  if (error) {
    return { error: error.message };
  }
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/admin/events");
  return { error: null };
}

// 승인 대기 참여자 승인(정원 재확인 후 confirmed/waitlisted 자동 분기는 RPC 내부에서 처리)
export async function approveParticipant(
  participantId: string,
  eventId: string,
) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("approve_participant", {
    p_participant_id: participantId,
  });
  if (error) {
    return { error: error.message };
  }
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/admin/events");
  return { error: null };
}

// 승인 대기 참여자 거절(주최자 전용, RLS의 participants_update_organizer_or_admin 정책으로 보호됨)
export async function rejectParticipant(
  participantId: string,
  eventId: string,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("participants")
    .update({ status: "cancelled" })
    .eq("id", participantId);
  if (error) {
    return { error: error.message };
  }
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/admin/events");
  return { error: null };
}

// 참여자 강퇴(주최자 전용). 사유는 kick_reason_visible이 true일 때만 참여자/타 참여자에게 노출
export async function kickParticipant(
  participantId: string,
  eventId: string,
  reason: string,
  reasonVisible: boolean,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("participants")
    .update({
      status: "kicked",
      kicked_at: new Date().toISOString(),
      kick_reason: reason || null,
      kick_reason_visible: reasonVisible,
    })
    .eq("id", participantId);
  if (error) {
    return { error: error.message };
  }
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/admin/events");
  return { error: null };
}
