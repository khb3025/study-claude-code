"use client";

import { useMediaQuery } from "usehooks-ts";

// Tailwind 기본 브레이크포인트 기반 시맨틱 훅
export const useIsMobile = () => useMediaQuery("(max-width: 767px)");
export const useIsTablet = () => useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)");
export const useIsLargeDesktop = () => useMediaQuery("(min-width: 1280px)");

// 범용 쿼리가 필요할 때 직접 사용
export { useMediaQuery };
