create table public.events (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  location text,
  starts_at timestamptz not null,
  capacity integer not null,
  status text not null default 'recruiting'
    check (status in ('recruiting', 'closed', 'finished')),
  join_type text not null default 'first_come'
    check (join_type in ('first_come', 'password', 'approval')),
  password_hash text,
  schedule text,
  items_to_bring text,
  recurrence_type text not null default 'none'
    check (recurrence_type in ('none', 'daily', 'weekly', 'monthly_nth_weekday', 'monthly_date')),
  settlement_visible boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

create policy "events_select_authenticated"
  on public.events for select
  using (auth.role() = 'authenticated');

create policy "events_insert_own"
  on public.events for insert
  with check (organizer_id = auth.uid());

create policy "events_update_own_or_admin"
  on public.events for update
  using (organizer_id = auth.uid() or public.is_admin())
  with check (organizer_id = auth.uid() or public.is_admin());

create policy "events_delete_own_or_admin"
  on public.events for delete
  using (organizer_id = auth.uid() or public.is_admin());
