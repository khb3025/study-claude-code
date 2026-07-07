create table public.participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'confirmed'
    check (status in ('confirmed', 'waitlisted', 'pending_approval', 'cancelled', 'kicked')),
  joined_at timestamptz not null default now(),
  kicked_at timestamptz,
  kick_reason text,
  kick_reason_visible boolean not null default true
);

alter table public.participants enable row level security;

create policy "participants_select_self_or_organizer_or_admin"
  on public.participants for select
  using (
    user_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.events e
      where e.id = participants.event_id and e.organizer_id = auth.uid()
    )
  );

create policy "participants_insert_self"
  on public.participants for insert
  with check (user_id = auth.uid());

-- 주최자/관리자: 승인·강퇴 등 모든 필드 변경 가능.
create policy "participants_update_organizer_or_admin"
  on public.participants for update
  using (
    public.is_admin()
    or exists (
      select 1 from public.events e
      where e.id = participants.event_id and e.organizer_id = auth.uid()
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.events e
      where e.id = participants.event_id and e.organizer_id = auth.uid()
    )
  );

-- 본인: 자진 취소(cancelled)만 허용.
create policy "participants_self_cancel"
  on public.participants for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and status = 'cancelled');

-- kick_reason_visible=false인 경우 당사자에게도 사유를 숨기기 위한 뷰.
-- RLS는 행 단위만 제어 가능해 컬럼 마스킹은 뷰로 처리한다.
-- security_invoker: 호출자의 RLS(위 정책)가 그대로 적용된다.
create view public.participants_view
  with (security_invoker = true) as
select
  id,
  event_id,
  user_id,
  status,
  joined_at,
  kicked_at,
  case
    when kick_reason_visible or exists (
      select 1 from public.events e
      where e.id = participants.event_id and e.organizer_id = auth.uid()
    ) or public.is_admin()
    then kick_reason
    else null
  end as kick_reason,
  kick_reason_visible
from public.participants;
