"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface FriendSearchResult {
  id: string;
  nickname: string | null;
  full_name: string | null;
  name_visible: boolean;
  email: string | null;
  // 검색 시점 기준 나와의 관계 상태(친구 추가 버튼 노출 여부 판단용)
  relationship: "none" | "pending" | "accepted";
}

// 이메일 또는 닉네임으로 사용자를 검색한다(본인 제외, 로그인 사용자 전체 조회 가능한 RLS 정책 활용)
export async function searchUsers(
  query: string,
): Promise<{ results: FriendSearchResult[]; error: string | null }> {
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

  const { data, error } = await supabase
    .from("profiles")
    .select("id, nickname, full_name, name_visible, email")
    .or(`nickname.ilike.%${trimmed}%,email.ilike.%${trimmed}%`)
    .neq("id", user.id)
    .limit(10);

  if (error) {
    return { results: [], error: "검색에 실패했습니다. 다시 시도해주세요." };
  }

  const userIds = (data ?? []).map((row) => row.id);
  const { data: relationRows } =
    userIds.length > 0
      ? await supabase
          .from("friendships")
          .select("user_id, friend_id, status")
          .or(
            `and(user_id.eq.${user.id},friend_id.in.(${userIds.join(",")})),and(friend_id.eq.${user.id},user_id.in.(${userIds.join(",")}))`,
          )
      : { data: [] };

  const relationshipMap = new Map<string, "pending" | "accepted">(
    (relationRows ?? []).map((row) => {
      const otherId = row.user_id === user.id ? row.friend_id : row.user_id;
      return [
        otherId as string,
        row.status === "accepted" ? "accepted" : "pending",
      ];
    }),
  );

  const results = (data ?? []).map((row) => ({
    ...row,
    relationship: relationshipMap.get(row.id) ?? "none",
  })) as FriendSearchResult[];

  return { results, error: null };
}

// 친구 요청 생성: 상대방이 이미 나에게 대기중인 요청을 보냈다면 새로 만들지 않고 그 요청을 수락 처리한다
// (양방향 중복 요청을 방지하고, 서로 동시에 요청한 경우 즉시 친구가 되도록 하기 위함)
export async function sendFriendRequest(friendId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  if (friendId === user.id) {
    return { error: "본인에게는 친구 요청을 보낼 수 없습니다." };
  }

  // 이미 어떤 상태로든 관계가 있는지(양방향) 확인
  const { data: existingRows } = await supabase
    .from("friendships")
    .select("id, user_id, friend_id, status")
    .or(
      `and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`,
    );

  const mine = existingRows?.find(
    (row) => row.user_id === user.id && row.friend_id === friendId,
  );
  const reverse = existingRows?.find(
    (row) => row.user_id === friendId && row.friend_id === user.id,
  );

  if (mine) {
    return {
      error:
        mine.status === "accepted"
          ? "이미 친구인 사용자입니다."
          : "이미 친구 요청을 보냈습니다.",
    };
  }

  if (reverse) {
    if (reverse.status === "accepted") {
      return { error: "이미 친구인 사용자입니다." };
    }
    // 상대방이 먼저 보낸 대기중인 요청이 있으므로 곧바로 수락 처리
    const { error } = await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", reverse.id);
    if (error) {
      return { error: "친구 요청 처리에 실패했습니다. 다시 시도해주세요." };
    }
    revalidatePath("/friends");
    return { error: null };
  }

  const { error } = await supabase.from("friendships").insert({
    user_id: user.id,
    friend_id: friendId,
    status: "pending",
  });

  if (error) {
    return { error: "친구 요청 전송에 실패했습니다. 다시 시도해주세요." };
  }

  revalidatePath("/friends");
  return { error: null };
}

// 친구 요청 수락(요청받은 사람만 가능, RLS의 friendships_update_friend_or_admin 정책으로 보호됨)
export async function acceptFriendRequest(friendshipId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("friendships")
    .update({ status: "accepted" })
    .eq("id", friendshipId);

  if (error) {
    return { error: "친구 요청 수락에 실패했습니다. 다시 시도해주세요." };
  }

  revalidatePath("/friends");
  return { error: null };
}

// 친구 요청 거절(행을 삭제해 재요청이 가능하도록 함)
export async function rejectFriendRequest(friendshipId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId);

  if (error) {
    return { error: "친구 요청 거절에 실패했습니다. 다시 시도해주세요." };
  }

  revalidatePath("/friends");
  return { error: null };
}
