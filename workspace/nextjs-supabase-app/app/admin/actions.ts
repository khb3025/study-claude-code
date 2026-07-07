"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin(
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." } as const;
  }

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRow) {
    return { error: "관리자 권한이 없습니다." } as const;
  }

  return { user };
}

// 관리자 공지를 이벤트에 등록/수정한다. 빈 문자열이면 공지를 제거한다.
export async function setAdminNotice(eventId: string, content: string) {
  const supabase = await createClient();
  const guard = await requireAdmin(supabase);

  if ("error" in guard) {
    return { error: guard.error };
  }

  const { error } = await supabase
    .from("events")
    .update({ admin_notice: content.trim() || null })
    .eq("id", eventId);

  if (error) {
    return { error: "공지 등록에 실패했습니다. 다시 시도해주세요." };
  }

  revalidatePath("/admin/events");
  revalidatePath(`/events/${eventId}`);

  return { error: null };
}
