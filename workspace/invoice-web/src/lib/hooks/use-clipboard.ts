"use client";

import { useState } from "react";

// Clipboard API 사용 결과를 boolean으로 반환 (호출부에서 toast 등 피드백 처리)
export function useClipboard() {
  const [isCopied, setIsCopied] = useState(false);

  async function copy(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      return true;
    } catch (error) {
      console.error("클립보드 복사 실패:", error);
      setIsCopied(false);
      return false;
    }
  }

  return { isCopied, copy };
}
