"use client";

// useLocalStorage<T>(key, initialValue, options?)
// 반환: [value, setValue, removeValue]
// SSR 안전 — 서버에서는 initialValue 반환, 클라이언트에서 실제 스토리지 동기화
export { useLocalStorage } from "usehooks-ts";
