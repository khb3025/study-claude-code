import { ExternalLink } from "lucide-react";

import { getInvoicePublicPath } from "@/lib/utils/link-generator";
import { truncate } from "@/lib/utils";

export function LinkColumn({ notionPageId }: { notionPageId: string }) {
  const path = getInvoicePublicPath(notionPageId);

  return (
    <a
      href={path}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
    >
      {truncate(path, 24)}
      <ExternalLink aria-hidden="true" className="size-3.5 shrink-0" />
    </a>
  );
}
