-- get_advisors(security)가 is_admin()을 PostgREST RPC로 외부 호출 가능하다고 지적함.
-- private 스키마로 옮겨 API 노출을 막되, RLS 정책 내부 호출은 그대로 동작하게 한다.
create schema if not exists private;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

-- 기존 정책들을 private.is_admin()을 참조하도록 재생성.
alter policy "admin_users_select_self_or_admin" on public.admin_users
  using (user_id = auth.uid() or private.is_admin());

alter policy "events_update_own_or_admin" on public.events
  using (organizer_id = auth.uid() or private.is_admin())
  with check (organizer_id = auth.uid() or private.is_admin());
alter policy "events_delete_own_or_admin" on public.events
  using (organizer_id = auth.uid() or private.is_admin());

alter policy "participants_select_self_or_organizer_or_admin" on public.participants
  using (
    user_id = auth.uid()
    or private.is_admin()
    or exists (
      select 1 from public.events e
      where e.id = participants.event_id and e.organizer_id = auth.uid()
    )
  );
alter policy "participants_update_organizer_or_admin" on public.participants
  using (
    private.is_admin()
    or exists (
      select 1 from public.events e
      where e.id = participants.event_id and e.organizer_id = auth.uid()
    )
  )
  with check (
    private.is_admin()
    or exists (
      select 1 from public.events e
      where e.id = participants.event_id and e.organizer_id = auth.uid()
    )
  );

create or replace view public.participants_view
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
    ) or private.is_admin()
    then kick_reason
    else null
  end as kick_reason,
  kick_reason_visible
from public.participants;

alter policy "carpools_select_event_participant_or_admin" on public.carpools
  using (
    private.is_admin()
    or exists (
      select 1 from public.participants p
      where p.event_id = carpools.event_id and p.user_id = auth.uid()
    )
    or exists (
      select 1 from public.events e
      where e.id = carpools.event_id and e.organizer_id = auth.uid()
    )
  );
alter policy "carpools_update_driver_or_admin" on public.carpools
  using (driver_id = auth.uid() or private.is_admin())
  with check (driver_id = auth.uid() or private.is_admin());
alter policy "carpools_delete_driver_or_admin" on public.carpools
  using (driver_id = auth.uid() or private.is_admin());

alter policy "carpool_passengers_select_related_or_admin" on public.carpool_passengers
  using (
    private.is_admin()
    or passenger_id = auth.uid()
    or exists (
      select 1 from public.carpools c
      where c.id = carpool_passengers.carpool_id and c.driver_id = auth.uid()
    )
    or exists (
      select 1 from public.carpools c
      join public.participants p on p.event_id = c.event_id
      where c.id = carpool_passengers.carpool_id and p.user_id = auth.uid()
    )
  );
alter policy "carpool_passengers_update_driver_or_passenger" on public.carpool_passengers
  using (
    passenger_id = auth.uid()
    or private.is_admin()
    or exists (
      select 1 from public.carpools c
      where c.id = carpool_passengers.carpool_id and c.driver_id = auth.uid()
    )
  )
  with check (
    passenger_id = auth.uid()
    or private.is_admin()
    or exists (
      select 1 from public.carpools c
      where c.id = carpool_passengers.carpool_id and c.driver_id = auth.uid()
    )
  );
alter policy "carpool_passengers_delete_driver_or_passenger" on public.carpool_passengers
  using (
    passenger_id = auth.uid()
    or private.is_admin()
    or exists (
      select 1 from public.carpools c
      where c.id = carpool_passengers.carpool_id and c.driver_id = auth.uid()
    )
  );

alter policy "settlements_select_visible_or_privileged" on public.settlements
  using (
    private.is_admin()
    or created_by = auth.uid()
    or exists (
      select 1 from public.events e
      where e.id = settlements.event_id
        and (e.settlement_visible = true or e.organizer_id = auth.uid())
    )
  );
alter policy "settlements_insert_organizer_or_admin" on public.settlements
  with check (
    private.is_admin()
    or exists (
      select 1 from public.events e
      where e.id = settlements.event_id and e.organizer_id = auth.uid()
    )
  );
alter policy "settlements_update_organizer_or_admin" on public.settlements
  using (
    private.is_admin()
    or exists (
      select 1 from public.events e
      where e.id = settlements.event_id and e.organizer_id = auth.uid()
    )
  )
  with check (
    private.is_admin()
    or exists (
      select 1 from public.events e
      where e.id = settlements.event_id and e.organizer_id = auth.uid()
    )
  );
alter policy "settlements_delete_organizer_or_admin" on public.settlements
  using (
    private.is_admin()
    or exists (
      select 1 from public.events e
      where e.id = settlements.event_id and e.organizer_id = auth.uid()
    )
  );

alter policy "settlement_shares_select_self_or_visible_or_privileged" on public.settlement_shares
  using (
    private.is_admin()
    or user_id = auth.uid()
    or exists (
      select 1 from public.settlements s
      join public.events e on e.id = s.event_id
      where s.id = settlement_shares.settlement_id
        and (e.settlement_visible = true or e.organizer_id = auth.uid() or s.created_by = auth.uid())
    )
  );
alter policy "settlement_shares_insert_organizer_or_admin" on public.settlement_shares
  with check (
    private.is_admin()
    or exists (
      select 1 from public.settlements s
      join public.events e on e.id = s.event_id
      where s.id = settlement_shares.settlement_id and e.organizer_id = auth.uid()
    )
  );
alter policy "settlement_shares_update_organizer_or_self_paid_or_admin" on public.settlement_shares
  using (
    private.is_admin()
    or user_id = auth.uid()
    or exists (
      select 1 from public.settlements s
      join public.events e on e.id = s.event_id
      where s.id = settlement_shares.settlement_id and e.organizer_id = auth.uid()
    )
  )
  with check (
    private.is_admin()
    or user_id = auth.uid()
    or exists (
      select 1 from public.settlements s
      join public.events e on e.id = s.event_id
      where s.id = settlement_shares.settlement_id and e.organizer_id = auth.uid()
    )
  );
alter policy "settlement_shares_delete_organizer_or_admin" on public.settlement_shares
  using (
    private.is_admin()
    or exists (
      select 1 from public.settlements s
      join public.events e on e.id = s.event_id
      where s.id = settlement_shares.settlement_id and e.organizer_id = auth.uid()
    )
  );

alter policy "invitations_select_related_or_admin" on public.invitations
  using (
    private.is_admin()
    or inviter_id = auth.uid()
    or invitee_id = auth.uid()
  );
alter policy "invitations_insert_organizer_or_admin" on public.invitations
  with check (
    inviter_id = auth.uid()
    or private.is_admin()
  );
alter policy "invitations_update_invitee_or_admin" on public.invitations
  using (invitee_id = auth.uid() or private.is_admin())
  with check (invitee_id = auth.uid() or private.is_admin());
alter policy "invitations_delete_inviter_or_admin" on public.invitations
  using (inviter_id = auth.uid() or private.is_admin());

alter policy "blacklists_select_self_or_admin" on public.blacklists
  using (blocker_id = auth.uid() or private.is_admin());
alter policy "blacklists_delete_self_or_admin" on public.blacklists
  using (blocker_id = auth.uid() or private.is_admin());

alter policy "friendships_select_related_or_admin" on public.friendships
  using (user_id = auth.uid() or friend_id = auth.uid() or private.is_admin());
alter policy "friendships_update_friend_or_admin" on public.friendships
  using (friend_id = auth.uid() or private.is_admin())
  with check (friend_id = auth.uid() or private.is_admin());
alter policy "friendships_delete_related_or_admin" on public.friendships
  using (user_id = auth.uid() or friend_id = auth.uid() or private.is_admin());

drop function if exists public.is_admin();
