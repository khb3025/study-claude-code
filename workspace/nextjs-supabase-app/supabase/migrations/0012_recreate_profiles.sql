-- auth.users는 PostgREST(anon/authenticated 키)로 직접 조회할 수 없어
-- 주최자/참여자/친구 등 "타인"의 이름·아바타를 화면에 표시할 방법이 없었다.
-- public 스키마에 표시용 정보만 담은 profiles 테이블을 다시 만들고,
-- auth.users insert 시 트리거로 자동 동기화한다.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- 표시용 정보이므로 로그인 사용자 전체가 조회 가능(비공개 정보 없음).
create policy "profiles_select_authenticated"
  on public.profiles for select
  using ((select auth.role()) = 'authenticated');

create policy "profiles_update_own"
  on public.profiles for update
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- insert는 아래 트리거(security definer)로만 수행되므로 별도 정책 불필요.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 트리거 생성 이전 가입자(기존 2명) 백필.
insert into public.profiles (id, email, full_name, avatar_url)
select id, email, raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'avatar_url'
from auth.users
on conflict (id) do nothing;
