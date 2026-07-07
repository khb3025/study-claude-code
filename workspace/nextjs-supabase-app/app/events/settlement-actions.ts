"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// 정산 생성(주최자 전용). 1/N 계산 및 나머지 가산은 RPC 내부에서 원자적으로 처리
export async function createSettlement(
  eventId: string,
  title: string,
  totalAmount: number,
  includeOrganizer: boolean,
) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("create_settlement", {
    p_event_id: eventId,
    p_title: title,
    p_total_amount: totalAmount,
    p_include_organizer: includeOrganizer,
  });
  if (error) {
    return { error: error.message };
  }
  revalidatePath(`/events/${eventId}`);
  return { error: null };
}

// 정산 항목의 입금 완료 여부 토글(주최자 전용, RLS의 settlement_shares 업데이트 정책으로 보호됨)
// 완료로 전환하면 완료 시각(paid_at)을 기록해, 당사자가 언제든 정산 완료 확인증을 볼 수 있게 한다
export async function toggleSettlementPaid(
  shareId: string,
  isPaid: boolean,
  eventId: string,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("settlement_shares")
    .update({
      is_paid: isPaid,
      paid_at: isPaid ? new Date().toISOString() : null,
    })
    .eq("id", shareId);
  if (error) {
    return { error: error.message };
  }
  revalidatePath(`/events/${eventId}`);
  return { error: null };
}
