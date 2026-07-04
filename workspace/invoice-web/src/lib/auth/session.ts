import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "admin_session";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7일

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET 환경변수가 설정되지 않았습니다.");
  }
  return secret;
}

function sign(value: string): string {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

// payload(만료 시각) + HMAC 서명을 붙인 stateless 세션 토큰 생성
function createSessionToken(): string {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = Buffer.from(JSON.stringify({ expiresAt })).toString("base64url");
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

function verifySessionToken(token: string): boolean {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expectedSignature = sign(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return false;
  }

  try {
    const { expiresAt } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof expiresAt === "number" && expiresAt > Date.now();
  } catch {
    return false;
  }
}

// 환경변수 기반 관리자 패스워드 검증 (평문 비교 시 타이밍 공격 방지)
export function verifyAdminPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;

  const inputBuffer = Buffer.from(password);
  const expectedBuffer = Buffer.from(adminPassword);
  return (
    inputBuffer.length === expectedBuffer.length && timingSafeEqual(inputBuffer, expectedBuffer)
  );
}

export async function createAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // 관리자 세션은 동일 사이트 폼 제출로만 발급/사용되므로 CSRF 위험을 줄이도록 strict로 강화
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function deleteAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function hasValidAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return token !== undefined && verifySessionToken(token);
}

// Proxy(Node.js 런타임)에서는 next/headers의 cookies()가 아닌 요청 쿠키를 직접 검증
export function verifyAdminSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  return verifySessionToken(token);
}
