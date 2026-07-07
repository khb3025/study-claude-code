-- 스타터킷 기본 profiles 테이블 및 관련 트리거/함수 제거.
-- PRD 원칙("auth.users 직접 FK 참조, profiles 테이블 없음")에 따라
-- 이후 모든 신규 테이블은 auth.users.id를 직접 참조한다.
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.profiles cascade;
