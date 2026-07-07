create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  inviter_id uuid not null references auth.users (id) on delete cascade,
  invitee_email text not null,
  invitee_id uuid references auth.users (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now()
);

alter table public.invitations enable row level security;

create policy "invitations_select_related_or_admin"
  on public.invitations for select
  using (
    public.is_admin()
    or inviter_id = auth.uid()
    or invitee_id = auth.uid()
  );

create policy "invitations_insert_organizer_or_admin"
  on public.invitations for insert
  with check (
    inviter_id = auth.uid()
    or public.is_admin()
  );

-- 초대받은 본인만 수락/거절(status 변경) 가능.
create policy "invitations_update_invitee_or_admin"
  on public.invitations for update
  using (invitee_id = auth.uid() or public.is_admin())
  with check (invitee_id = auth.uid() or public.is_admin());

create policy "invitations_delete_inviter_or_admin"
  on public.invitations for delete
  using (inviter_id = auth.uid() or public.is_admin());
