-- get_advisors(performance)의 auth_rls_initplan 경고 해소:
-- auth.uid()/auth.role()/private.is_admin()을 (select ...)로 감싸 행마다 재평가되지 않고
-- 쿼리당 한 번만 평가되도록 최적화한다.
-- 겸사겸사 participants의 update 정책 2개(self_cancel/organizer_or_admin)를 하나로 합쳐
-- multiple_permissive_policies 경고도 해소한다.

alter policy "admin_users_select_self_or_admin" on public.admin_users
  using (user_id = (select auth.uid()) or private.is_admin());

alter policy "events_select_authenticated" on public.events
  using ((select auth.role()) = 'authenticated');
alter policy "events_insert_own" on public.events
  with check (organizer_id = (select auth.uid()));
alter policy "events_update_own_or_admin" on public.events
  using (organizer_id = (select auth.uid()) or private.is_admin())
  with check (organizer_id = (select auth.uid()) or private.is_admin());
alter policy "events_delete_own_or_admin" on public.events
  using (organizer_id = (select auth.uid()) or private.is_admin());

alter policy "participants_select_self_or_organizer_or_admin" on public.participants
  using (
    user_id = (select auth.uid())
    or private.is_admin()
    or exists (
      select 1 from public.events e
      where e.id = participants.event_id and e.organizer_id = (select auth.uid())
    )
  );
alter policy "participants_insert_self" on public.participants
  with check (user_id = (select auth.uid()));

drop policy "participants_self_cancel" on public.participants;
alter policy "participants_update_organizer_or_admin" on public.participants
  using (
    user_id = (select auth.uid())
    or private.is_admin()
    or exists (
      select 1 from public.events e
      where e.id = participants.event_id and e.organizer_id = (select auth.uid())
    )
  )
  with check (
    private.is_admin()
    or exists (
      select 1 from public.events e
      where e.id = participants.event_id and e.organizer_id = (select auth.uid())
    )
    or (user_id = (select auth.uid()) and status = 'cancelled')
  );

alter policy "carpools_select_event_participant_or_admin" on public.carpools
  using (
    private.is_admin()
    or exists (
      select 1 from public.participants p
      where p.event_id = carpools.event_id and p.user_id = (select auth.uid())
    )
    or exists (
      select 1 from public.events e
      where e.id = carpools.event_id and e.organizer_id = (select auth.uid())
    )
  );
alter policy "carpools_insert_driver" on public.carpools
  with check (driver_id = (select auth.uid()));
alter policy "carpools_update_driver_or_admin" on public.carpools
  using (driver_id = (select auth.uid()) or private.is_admin())
  with check (driver_id = (select auth.uid()) or private.is_admin());
alter policy "carpools_delete_driver_or_admin" on public.carpools
  using (driver_id = (select auth.uid()) or private.is_admin());

alter policy "carpool_passengers_select_related_or_admin" on public.carpool_passengers
  using (
    private.is_admin()
    or passenger_id = (select auth.uid())
    or exists (
      select 1 from public.carpools c
      where c.id = carpool_passengers.carpool_id and c.driver_id = (select auth.uid())
    )
    or exists (
      select 1 from public.carpools c
      join public.participants p on p.event_id = c.event_id
      where c.id = carpool_passengers.carpool_id and p.user_id = (select auth.uid())
    )
  );
alter policy "carpool_passengers_insert_driver_or_passenger" on public.carpool_passengers
  with check (
    passenger_id = (select auth.uid())
    or exists (
      select 1 from public.carpools c
      where c.id = carpool_passengers.carpool_id and c.driver_id = (select auth.uid())
    )
  );
alter policy "carpool_passengers_update_driver_or_passenger" on public.carpool_passengers
  using (
    passenger_id = (select auth.uid())
    or private.is_admin()
    or exists (
      select 1 from public.carpools c
      where c.id = carpool_passengers.carpool_id and c.driver_id = (select auth.uid())
    )
  )
  with check (
    passenger_id = (select auth.uid())
    or private.is_admin()
    or exists (
      select 1 from public.carpools c
      where c.id = carpool_passengers.carpool_id and c.driver_id = (select auth.uid())
    )
  );
alter policy "carpool_passengers_delete_driver_or_passenger" on public.carpool_passengers
  using (
    passenger_id = (select auth.uid())
    or private.is_admin()
    or exists (
      select 1 from public.carpools c
      where c.id = carpool_passengers.carpool_id and c.driver_id = (select auth.uid())
    )
  );

alter policy "settlements_select_visible_or_privileged" on public.settlements
  using (
    private.is_admin()
    or created_by = (select auth.uid())
    or exists (
      select 1 from public.events e
      where e.id = settlements.event_id
        and (e.settlement_visible = true or e.organizer_id = (select auth.uid()))
    )
  );
alter policy "settlements_insert_organizer_or_admin" on public.settlements
  with check (
    private.is_admin()
    or exists (
      select 1 from public.events e
      where e.id = settlements.event_id and e.organizer_id = (select auth.uid())
    )
  );
alter policy "settlements_update_organizer_or_admin" on public.settlements
  using (
    private.is_admin()
    or exists (
      select 1 from public.events e
      where e.id = settlements.event_id and e.organizer_id = (select auth.uid())
    )
  )
  with check (
    private.is_admin()
    or exists (
      select 1 from public.events e
      where e.id = settlements.event_id and e.organizer_id = (select auth.uid())
    )
  );
alter policy "settlements_delete_organizer_or_admin" on public.settlements
  using (
    private.is_admin()
    or exists (
      select 1 from public.events e
      where e.id = settlements.event_id and e.organizer_id = (select auth.uid())
    )
  );

alter policy "settlement_shares_select_self_or_visible_or_privileged" on public.settlement_shares
  using (
    private.is_admin()
    or user_id = (select auth.uid())
    or exists (
      select 1 from public.settlements s
      join public.events e on e.id = s.event_id
      where s.id = settlement_shares.settlement_id
        and (e.settlement_visible = true or e.organizer_id = (select auth.uid()) or s.created_by = (select auth.uid()))
    )
  );
alter policy "settlement_shares_insert_organizer_or_admin" on public.settlement_shares
  with check (
    private.is_admin()
    or exists (
      select 1 from public.settlements s
      join public.events e on e.id = s.event_id
      where s.id = settlement_shares.settlement_id and e.organizer_id = (select auth.uid())
    )
  );
alter policy "settlement_shares_update_organizer_or_self_paid_or_admin" on public.settlement_shares
  using (
    private.is_admin()
    or user_id = (select auth.uid())
    or exists (
      select 1 from public.settlements s
      join public.events e on e.id = s.event_id
      where s.id = settlement_shares.settlement_id and e.organizer_id = (select auth.uid())
    )
  )
  with check (
    private.is_admin()
    or user_id = (select auth.uid())
    or exists (
      select 1 from public.settlements s
      join public.events e on e.id = s.event_id
      where s.id = settlement_shares.settlement_id and e.organizer_id = (select auth.uid())
    )
  );
alter policy "settlement_shares_delete_organizer_or_admin" on public.settlement_shares
  using (
    private.is_admin()
    or exists (
      select 1 from public.settlements s
      join public.events e on e.id = s.event_id
      where s.id = settlement_shares.settlement_id and e.organizer_id = (select auth.uid())
    )
  );

alter policy "invitations_select_related_or_admin" on public.invitations
  using (
    private.is_admin()
    or inviter_id = (select auth.uid())
    or invitee_id = (select auth.uid())
  );
alter policy "invitations_insert_organizer_or_admin" on public.invitations
  with check (
    inviter_id = (select auth.uid())
    or private.is_admin()
  );
alter policy "invitations_update_invitee_or_admin" on public.invitations
  using (invitee_id = (select auth.uid()) or private.is_admin())
  with check (invitee_id = (select auth.uid()) or private.is_admin());
alter policy "invitations_delete_inviter_or_admin" on public.invitations
  using (inviter_id = (select auth.uid()) or private.is_admin());

alter policy "blacklists_select_self_or_admin" on public.blacklists
  using (blocker_id = (select auth.uid()) or private.is_admin());
alter policy "blacklists_insert_self" on public.blacklists
  with check (blocker_id = (select auth.uid()));
alter policy "blacklists_delete_self_or_admin" on public.blacklists
  using (blocker_id = (select auth.uid()) or private.is_admin());

alter policy "friendships_select_related_or_admin" on public.friendships
  using (user_id = (select auth.uid()) or friend_id = (select auth.uid()) or private.is_admin());
alter policy "friendships_insert_self" on public.friendships
  with check (user_id = (select auth.uid()));
alter policy "friendships_update_friend_or_admin" on public.friendships
  using (friend_id = (select auth.uid()) or private.is_admin())
  with check (friend_id = (select auth.uid()) or private.is_admin());
alter policy "friendships_delete_related_or_admin" on public.friendships
  using (user_id = (select auth.uid()) or friend_id = (select auth.uid()) or private.is_admin());
