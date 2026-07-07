"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { hashPassword } from "@/lib/event-password";
import { eventFormSchema, type EventFormValues } from "@/types/event";

// starts_at(Date)을 DB 저장용 ISO 문자열로, join_type에 따라 password_hash를 계산
async function buildEventPayload(values: EventFormValues) {
  const parsed = eventFormSchema.parse(values);

  return {
    title: parsed.title,
    description: parsed.description,
    location: parsed.location,
    starts_at: parsed.starts_at.toISOString(),
    capacity: parsed.capacity,
    join_type: parsed.join_type,
    password_hash:
      parsed.join_type === "password" && parsed.password
        ? hashPassword(parsed.password)
        : null,
    schedule: parsed.schedule || null,
    items_to_bring: parsed.items_to_bring || null,
    recurrence_type: parsed.recurrence_type,
    recurrence_weekday: parsed.recurrence_weekday ?? null,
    recurrence_week_of_month: parsed.recurrence_week_of_month ?? null,
    recurrence_day_of_month: parsed.recurrence_day_of_month ?? null,
    recurrence_time: parsed.recurrence_time || null,
    settlement_visible: parsed.settlement_visible,
    image_url: parsed.image_url ?? null,
    participation_fee_enabled: parsed.participation_fee_enabled,
    participation_fee_amount: parsed.participation_fee_enabled
      ? parsed.participation_fee_amount
      : null,
  };
}

export async function createEvent(values: EventFormValues) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const payload = await buildEventPayload(values);

  const { data, error } = await supabase
    .from("events")
    .insert({ ...payload, organizer_id: user.id, status: "recruiting" })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "이벤트 생성에 실패했습니다. 다시 시도해주세요." };
  }

  revalidatePath("/admin/events");
  revalidatePath("/admin/dashboard");
  redirect(`/events/${data.id}`);
}

export async function updateEvent(eventId: string, values: EventFormValues) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { data: existing } = await supabase
    .from("events")
    .select("organizer_id")
    .eq("id", eventId)
    .single();

  // RLS로도 차단되지만, 사용자에게 명확한 에러 메시지를 주기 위해 이중 확인한다
  if (!existing || existing.organizer_id !== user.id) {
    return { error: "이 이벤트를 수정할 권한이 없습니다." };
  }

  const payload = await buildEventPayload(values);

  const { error } = await supabase
    .from("events")
    .update(payload)
    .eq("id", eventId);

  if (error) {
    return { error: "이벤트 수정에 실패했습니다. 다시 시도해주세요." };
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/admin/events");
  revalidatePath("/admin/dashboard");
  redirect(`/events/${eventId}`);
}

export async function deleteEvent(
  eventId: string,
  options?: { skipRedirect?: boolean },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { data: existing } = await supabase
    .from("events")
    .select("organizer_id")
    .eq("id", eventId)
    .single();

  if (!existing) {
    return { error: "이 이벤트를 삭제할 권한이 없습니다." };
  }

  if (existing.organizer_id !== user.id) {
    const { data: adminRow } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!adminRow) {
      return { error: "이 이벤트를 삭제할 권한이 없습니다." };
    }
  }

  // 하드 삭제 대신 소프트 삭제를 사용한다: 참여자/정산 기록이 함께 사라지면
  // 참여자가 정산 완료 확인증 등 이력을 영구히 잃게 되므로, 목록에서만 숨기고
  // 데이터는 보존해 이력 페이지(/events/joined, /events/mine)에서 계속 조회할 수 있게 한다.
  const { error } = await supabase
    .from("events")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", eventId);

  if (error) {
    return { error: "이벤트 삭제에 실패했습니다. 다시 시도해주세요." };
  }

  revalidatePath("/events");
  revalidatePath("/admin/events");
  revalidatePath("/admin/dashboard");

  if (options?.skipRedirect) {
    return { error: null };
  }

  redirect("/events");
}
