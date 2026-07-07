create table public.settlements (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  title text not null,
  total_amount integer not null,
  created_by uuid not null references auth.users (id) on delete cascade
);

alter table public.settlements enable row level security;

-- settlement_visible=false여도 주최자/관리자/작성자는 항상 조회 가능.
-- 비공개 시 그 외 참여자에게는 행 자체를 숨긴다(컬럼 마스킹이 아닌 행 단위 요구사항).
create policy "settlements_select_visible_or_privileged"
  on public.settlements for select
  using (
    public.is_admin()
    or created_by = auth.uid()
    or exists (
      select 1 from public.events e
      where e.id = settlements.event_id
        and (e.settlement_visible = true or e.organizer_id = auth.uid())
    )
  );

create policy "settlements_insert_organizer_or_admin"
  on public.settlements for insert
  with check (
    public.is_admin()
    or exists (
      select 1 from public.events e
      where e.id = settlements.event_id and e.organizer_id = auth.uid()
    )
  );

create policy "settlements_update_organizer_or_admin"
  on public.settlements for update
  using (
    public.is_admin()
    or exists (
      select 1 from public.events e
      where e.id = settlements.event_id and e.organizer_id = auth.uid()
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.events e
      where e.id = settlements.event_id and e.organizer_id = auth.uid()
    )
  );

create policy "settlements_delete_organizer_or_admin"
  on public.settlements for delete
  using (
    public.is_admin()
    or exists (
      select 1 from public.events e
      where e.id = settlements.event_id and e.organizer_id = auth.uid()
    )
  );

create table public.settlement_shares (
  id uuid primary key default gen_random_uuid(),
  settlement_id uuid not null references public.settlements (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  amount integer not null,
  is_paid boolean not null default false
);

alter table public.settlement_shares enable row level security;

-- 본인의 분담 내역은 정산이 비공개여도 항상 조회 가능.
create policy "settlement_shares_select_self_or_visible_or_privileged"
  on public.settlement_shares for select
  using (
    public.is_admin()
    or user_id = auth.uid()
    or exists (
      select 1 from public.settlements s
      join public.events e on e.id = s.event_id
      where s.id = settlement_shares.settlement_id
        and (e.settlement_visible = true or e.organizer_id = auth.uid() or s.created_by = auth.uid())
    )
  );

create policy "settlement_shares_insert_organizer_or_admin"
  on public.settlement_shares for insert
  with check (
    public.is_admin()
    or exists (
      select 1 from public.settlements s
      join public.events e on e.id = s.event_id
      where s.id = settlement_shares.settlement_id and e.organizer_id = auth.uid()
    )
  );

create policy "settlement_shares_update_organizer_or_self_paid_or_admin"
  on public.settlement_shares for update
  using (
    public.is_admin()
    or user_id = auth.uid()
    or exists (
      select 1 from public.settlements s
      join public.events e on e.id = s.event_id
      where s.id = settlement_shares.settlement_id and e.organizer_id = auth.uid()
    )
  )
  with check (
    public.is_admin()
    or user_id = auth.uid()
    or exists (
      select 1 from public.settlements s
      join public.events e on e.id = s.event_id
      where s.id = settlement_shares.settlement_id and e.organizer_id = auth.uid()
    )
  );

create policy "settlement_shares_delete_organizer_or_admin"
  on public.settlement_shares for delete
  using (
    public.is_admin()
    or exists (
      select 1 from public.settlements s
      join public.events e on e.id = s.event_id
      where s.id = settlement_shares.settlement_id and e.organizer_id = auth.uid()
    )
  );
