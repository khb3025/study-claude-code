import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getInvoicePublicUrl } from "@/lib/utils/link-generator";

export function ShareButton({
  notionPageId,
  invoiceNumber,
}: {
  notionPageId: string;
  invoiceNumber: string;
}) {
  const url = getInvoicePublicUrl(notionPageId);
  const subject = encodeURIComponent(`견적서 ${invoiceNumber} 안내`);
  const body = encodeURIComponent(`안녕하세요.\n아래 링크에서 견적서를 확인해 주세요.\n\n${url}`);
  const mailtoHref = `mailto:?subject=${subject}&body=${body}`;

  return (
    <Button variant="ghost" size="icon-sm" asChild aria-label="이메일로 공유">
      <a href={mailtoHref}>
        <Mail className="size-3.5" />
      </a>
    </Button>
  );
}
