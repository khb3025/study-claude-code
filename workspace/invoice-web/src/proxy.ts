import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/auth/session";

const ADMIN_LOGIN_PATH = "/admin/login";

// /admin/* 보호: 세션 쿠키가 없거나 유효하지 않으면 로그인 페이지로 리다이렉트
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === ADMIN_LOGIN_PATH) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
