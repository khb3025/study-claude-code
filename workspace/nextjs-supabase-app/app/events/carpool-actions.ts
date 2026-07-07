"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// 카풀 운전자 등록. force=false에서 다른 운전자에게 활성 상태로 걸려 있으면 conflict 정보를 반환(에러 아님)
export async function registerCarpool(
  eventId: string,
  values: {
    seatsTotal: number;
    departurePoint?: string;
    departureTime?: string;
  },
  force = false,
) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("register_carpool", {
    p_event_id: eventId,
    p_seats_total: values.seatsTotal,
    p_departure_point: values.departurePoint || null,
    p_departure_time: values.departureTime || null,
    p_force: force,
  });
  if (error) {
    return { error: error.message, conflict: false, status: null };
  }
  const result = data as { conflict: boolean; status?: string };
  if (result.conflict) {
    return { error: null, conflict: true, status: result.status ?? null };
  }
  revalidatePath(`/events/${eventId}`);
  return { error: null, conflict: false, status: null };
}

// 운전자가 확정 참여자를 탑승자로 초대(거절 이력이 있어도 재초대 가능)
export async function invitePassenger(
  carpoolId: string,
  participantUserId: string,
  eventId: string,
) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("invite_passenger", {
    p_carpool_id: carpoolId,
    p_participant_user_id: participantUserId,
  });
  if (error) {
    return { error: error.message };
  }
  revalidatePath(`/events/${eventId}`);
  return { error: null };
}

// 참여자가 운전자에게 자발적으로 탑승 신청(해당 운전자에게 거절당한 이력이 있으면 RPC 내부에서 차단)
export async function requestCarpool(carpoolId: string, eventId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("request_carpool", {
    p_carpool_id: carpoolId,
  });
  if (error) {
    return { error: error.message };
  }
  revalidatePath(`/events/${eventId}`);
  return { error: null };
}

// 주최자가 카풀 탑승자 후보 목록에 자신을 노출할지 여부 토글(RLS의 events 소유자 업데이트 정책으로 보호됨)
export async function toggleOrganizerCarpoolVisible(
  eventId: string,
  visible: boolean,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("events")
    .update({ organizer_carpool_visible: visible })
    .eq("id", eventId);
  if (error) {
    return { error: error.message };
  }
  revalidatePath(`/events/${eventId}`);
  return { error: null };
}

// 초대(탑승자 응답)/신청(운전자 응답)에 대한 수락·거절 처리
export async function respondCarpoolPassenger(
  carpoolPassengerId: string,
  accept: boolean,
  eventId: string,
) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("respond_carpool_passenger", {
    p_carpool_passenger_id: carpoolPassengerId,
    p_accept: accept,
  });
  if (error) {
    return { error: error.message };
  }
  revalidatePath(`/events/${eventId}`);
  return { error: null };
}
