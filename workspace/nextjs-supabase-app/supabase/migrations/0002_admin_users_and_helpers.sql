-- 관리자 권한 테이블 및 is_admin() 헬퍼 함수.
-- 다른 테이블의 RLS 정책이 참조하므로 스키마 초반에 생성한다.
create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  granted_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- security definer: 호출자의 RLS를 우회해 admin_users를 읽어야
-- 다른 테이블 정책에서 is_admin()을 호출할 때 재귀적 정책 문제가 생기지 않는다.
create or replace function public.is_admin()
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

create policy "admin_users_select_self_or_admin"
  on public.admin_users for select
  using (user_id = auth.uid() or public.is_admin());

-- insert/update/delete 정책 없음: 관리자 부여/회수는 서비스 롤(service_role)로만 수행.
