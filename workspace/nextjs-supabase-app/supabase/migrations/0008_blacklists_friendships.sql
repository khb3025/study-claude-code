create table public.blacklists (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references auth.users (id) on delete cascade,
  blocked_organizer_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_organizer_id)
);

alter table public.blacklists enable row level security;

create policy "blacklists_select_self_or_admin"
  on public.blacklists for select
  using (blocker_id = auth.uid() or public.is_admin());

create policy "blacklists_insert_self"
  on public.blacklists for insert
  with check (blocker_id = auth.uid());

create policy "blacklists_delete_self_or_admin"
  on public.blacklists for delete
  using (blocker_id = auth.uid() or public.is_admin());

create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  friend_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  unique (user_id, friend_id)
);

alter table public.friendships enable row level security;

create policy "friendships_select_related_or_admin"
  on public.friendships for select
  using (user_id = auth.uid() or friend_id = auth.uid() or public.is_admin());

create policy "friendships_insert_self"
  on public.friendships for insert
  with check (user_id = auth.uid());

-- 친구 요청 수락은 상대방(friend_id)만 가능.
create policy "friendships_update_friend_or_admin"
  on public.friendships for update
  using (friend_id = auth.uid() or public.is_admin())
  with check (friend_id = auth.uid() or public.is_admin());

create policy "friendships_delete_related_or_admin"
  on public.friendships for delete
  using (user_id = auth.uid() or friend_id = auth.uid() or public.is_admin());
