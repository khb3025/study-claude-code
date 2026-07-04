"use client";

import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useClipboard } from "@/lib/hooks/use-clipboard";
import { getInvoicePublicUrl } from "@/lib/utils/link-generator";

export function CopyButton({ notionPageId }: { notionPageId: string }) {
  const { isCopied, copy } = useClipboard();

  async function handleCopy() {
    const success = await copy(getInvoicePublicUrl(notionPageId));
    if (success) {
      toast.success("링크가 클립보드에 복사되었습니다.");
    } else {
      toast.error("링크 복사에 실패했습니다.");
    }
  }

  return (
    <Button type="button" variant="ghost" size="icon-sm" onClick={handleCopy} aria-label="링크 복사">
      {isCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </Button>
  );
}
