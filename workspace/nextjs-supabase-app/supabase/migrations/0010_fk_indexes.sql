-- get_advisors(performance)가 지적한 미인덱스 FK 컬럼 보강.
-- unique(blocker_id, blocked_organizer_id) / unique(user_id, friend_id)의
-- 선행 컬럼(blocker_id, user_id)은 이미 커버되므로 후행 컬럼만 추가한다.
create index if not exists idx_events_organizer_id on public.events (organizer_id);

create index if not exists idx_participants_event_id on public.participants (event_id);
create index if not exists idx_participants_user_id on public.participants (user_id);

create index if not exists idx_carpools_event_id on public.carpools (event_id);
create index if not exists idx_carpools_driver_id on public.carpools (driver_id);

create index if not exists idx_carpool_passengers_carpool_id on public.carpool_passengers (carpool_id);
create index if not exists idx_carpool_passengers_passenger_id on public.carpool_passengers (passenger_id);

create index if not exists idx_settlements_event_id on public.settlements (event_id);
create index if not exists idx_settlements_created_by on public.settlements (created_by);

create index if not exists idx_settlement_shares_settlement_id on public.settlement_shares (settlement_id);
create index if not exists idx_settlement_shares_user_id on public.settlement_shares (user_id);

create index if not exists idx_invitations_event_id on public.invitations (event_id);
create index if not exists idx_invitations_inviter_id on public.invitations (inviter_id);
create index if not exists idx_invitations_invitee_id on public.invitations (invitee_id);

create index if not exists idx_blacklists_blocked_organizer_id on public.blacklists (blocked_organizer_id);

create index if not exists idx_friendships_friend_id on public.friendships (friend_id);
