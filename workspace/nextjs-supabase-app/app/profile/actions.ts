"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileFormSchema, type ProfileFormValues } from "@/types/event";

export async function updateProfile(values: ProfileFormValues) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const parsed = profileFormSchema.parse(values);

  const { error } = await supabase
    .from("profiles")
    .update({
      nickname: parsed.nickname,
      name_visible: parsed.name_visible,
      avatar_url: parsed.avatar_url ?? null,
    })
    .eq("id", user.id);

  if (error) {
    return { error: "프로필 저장에 실패했습니다. 다시 시도해주세요." };
  }

  revalidatePath("/profile");
  return { success: true };
}
