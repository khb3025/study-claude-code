create table public.carpools (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  driver_id uuid not null references auth.users (id) on delete cascade,
  seats_total integer not null,
  departure_point text,
  departure_time timestamptz
);

alter table public.carpools enable row level security;

create policy "carpools_select_event_participant_or_admin"
  on public.carpools for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.participants p
      where p.event_id = carpools.event_id and p.user_id = auth.uid()
    )
    or exists (
      select 1 from public.events e
      where e.id = carpools.event_id and e.organizer_id = auth.uid()
    )
  );

create policy "carpools_insert_driver"
  on public.carpools for insert
  with check (driver_id = auth.uid());

create policy "carpools_update_driver_or_admin"
  on public.carpools for update
  using (driver_id = auth.uid() or public.is_admin())
  with check (driver_id = auth.uid() or public.is_admin());

create policy "carpools_delete_driver_or_admin"
  on public.carpools for delete
  using (driver_id = auth.uid() or public.is_admin());

create table public.carpool_passengers (
  id uuid primary key default gen_random_uuid(),
  carpool_id uuid not null references public.carpools (id) on delete cascade,
  passenger_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'invited'
    check (status in ('invited', 'requested', 'confirmed', 'rejected')),
  initiated_by text not null
    check (initiated_by in ('driver', 'passenger'))
);

alter table public.carpool_passengers enable row level security;

create policy "carpool_passengers_select_related_or_admin"
  on public.carpool_passengers for select
  using (
    public.is_admin()
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

-- driver가 초대하거나 passenger 본인이 신청하는 두 경우 모두 허용.
create policy "carpool_passengers_insert_driver_or_passenger"
  on public.carpool_passengers for insert
  with check (
    passenger_id = auth.uid()
    or exists (
      select 1 from public.carpools c
      where c.id = carpool_passengers.carpool_id and c.driver_id = auth.uid()
    )
  );

create policy "carpool_passengers_update_driver_or_passenger"
  on public.carpool_passengers for update
  using (
    passenger_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.carpools c
      where c.id = carpool_passengers.carpool_id and c.driver_id = auth.uid()
    )
  )
  with check (
    passenger_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.carpools c
      where c.id = carpool_passengers.carpool_id and c.driver_id = auth.uid()
    )
  );

create policy "carpool_passengers_delete_driver_or_passenger"
  on public.carpool_passengers for delete
  using (
    passenger_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.carpools c
      where c.id = carpool_passengers.carpool_id and c.driver_id = auth.uid()
    )
  );
