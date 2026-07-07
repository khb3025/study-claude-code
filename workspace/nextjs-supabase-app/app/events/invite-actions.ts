"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// 이메일로 가입 사용자를 찾아 이벤트에 초대(주최자 전용, RLS의
// invitations_insert_organizer_or_admin 정책이 실제 이벤트 주최자인지 재검증함)
export async function inviteByEmail(eventId: string, email: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return { error: "이메일을 입력해주세요." };
  }

  const { data: invitee } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (!invitee) {
    return { error: "가입된 사용자만 초대할 수 있습니다." };
  }

  if (invitee.id === user.id) {
    return { error: "본인은 초대할 수 없습니다." };
  }

  const { data: existingInvitation } = await supabase
    .from("invitations")
    .select("id")
    .eq("event_id", eventId)
    .eq("invitee_id", invitee.id)
    .eq("status", "pending")
    .maybeSingle();

  if (existingInvitation) {
    return { error: "이미 초대를 보낸 사용자입니다." };
  }

  const { error } = await supabase.from("invitations").insert({
    event_id: eventId,
    inviter_id: user.id,
    invitee_email: normalizedEmail,
    invitee_id: invitee.id,
    status: "pending",
  });

  if (error) {
    return { error: "초대 생성에 실패했습니다. 다시 시도해주세요." };
  }

  revalidatePath(`/events/${eventId}`);
  return { error: null };
}

// 초대 수락: 승인 절차 없이 RPC 내부에서 곧바로 confirmed/waitlisted로 배정
export async function acceptInvitation(invitationId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("accept_invitation", {
    p_invitation_id: invitationId,
  });
  if (error) {
    return { error: error.message };
  }
  revalidatePath("/events/invitations");
  revalidatePath("/events");
  return { error: null };
}

// 초대 거절: 상태만 변경(RLS의 invitations_update_invitee_or_admin 정책으로 보호됨)
export async function declineInvitation(invitationId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("invitations")
    .update({ status: "declined" })
    .eq("id", invitationId);
  if (error) {
    return { error: error.message };
  }
  revalidatePath("/events/invitations");
  return { error: null };
}

export interface OrganizerSearchResult {
  id: string;
  nickname: string | null;
  full_name: string | null;
  name_visible: boolean;
  email: string | null;
  isBlocked: boolean;
}

// 이벤트를 주최한 이력이 있는 사용자만 대상으로 닉네임/이메일 검색(초대 없이도 직접 차단할 수 있도록)
export async function searchOrganizers(
  query: string,
): Promise<{ results: OrganizerSearchResult[]; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { results: [], error: "로그인이 필요합니다." };
  }

  const trimmed = query.trim();
  if (!trimmed) {
    return { results: [], error: null };
  }

  const { data: eventRows } = await supabase
    .from("events")
    .select("organizer_id");
  const organizerIds = Array.from(
    new Set((eventRows ?? []).map((row) => row.organizer_id as string)),
  ).filter((id) => id !== user.id);

  if (organizerIds.length === 0) {
    return { results: [], error: null };
  }

  const [{ data: profileRows, error }, { data: blacklistRows }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, nickname, full_name, name_visible, email")
        .in("id", organizerIds)
        .or(`nickname.ilike.%${trimmed}%,email.ilike.%${trimmed}%`)
        .limit(10),
      supabase
        .from("blacklists")
        .select("blocked_organizer_id")
        .eq("blocker_id", user.id),
    ]);

  if (error) {
    return { results: [], error: "검색에 실패했습니다. 다시 시도해주세요." };
  }

  const blockedIds = new Set(
    (blacklistRows ?? []).map((row) => row.blocked_organizer_id as string),
  );

  return {
    results: (profileRows ?? []).map((profile) => ({
      ...profile,
      isBlocked: blockedIds.has(profile.id as string),
    })),
    error: null,
  };
}

// 주최자 차단: 이후 해당 주최자의 초대/이벤트를 노출에서 제외하기 위한 블랙리스트 등록
export async function blockOrganizer(organizerId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { error } = await supabase.from("blacklists").insert({
    blocker_id: user.id,
    blocked_organizer_id: organizerId,
  });

  if (error) {
    // unique 제약 위반(이미 차단한 경우)은 사용자에게 굳이 에러로 보여주지 않는다
    if (error.code === "23505") {
      return { error: null };
    }
    return { error: "차단 처리에 실패했습니다. 다시 시도해주세요." };
  }

  revalidatePath("/events/invitations");
  revalidatePath("/events");
  return { error: null };
}
