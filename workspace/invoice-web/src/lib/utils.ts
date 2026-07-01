import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind 클래스 병합
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 날짜 포맷 (기본: ko-KR "2024년 1월 15일")
export function formatDate(
  date: Date | string | number,
  locale: Intl.LocalesArgument = "ko-KR",
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
): string {
  return new Intl.DateTimeFormat(locale, options).format(new Date(date));
}

// 숫자 포맷 (기본: ko-KR "1,234,567")
export function formatNumber(
  value: number,
  locale: Intl.LocalesArgument = "ko-KR",
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

// 통화 포맷 (기본: ₩1,234,567)
export function formatCurrency(
  value: number,
  currency = "KRW",
  locale: Intl.LocalesArgument = "ko-KR"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

// 문자열 말줄임 (초과 시 "…" 추가)
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + "…";
}

// Avatar용 이니셜 추출 ("홍길동" → "홍", "John Doe" → "JD")
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// 상대 시간 표시 ("방금 전", "3분 전", "2일 전")
export function formatRelativeTime(date: Date | string | number): string {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  return formatDate(date);
}

// 바이트 단위 포맷 ("1.2 MB", "345 KB")
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}
