import { Calendar, Clock } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PdfDownloadButtonLoader } from "@/components/invoice/pdf-download-button-loader";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { INVOICE_STATUS_MAP, SITE_CONFIG } from "@/lib/constants";
import { getInvoiceByPageId } from "@/lib/notion";
import type { PageProps } from "@/lib/types";
import { getInvoicePublicPath } from "@/lib/utils/link-generator";
import { formatCurrency, formatDateOrFallback } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { notionPageId } = await params;
  const invoice = await getInvoiceByPageId(notionPageId);

  if (!invoice) {
    return { title: "견적서를 찾을 수 없습니다" };
  }

  const title = `${invoice.invoiceNumber} 견적서`;
  const description = `${invoice.clientName} 고객님께 발행된 견적서 (총 금액 ${formatCurrency(invoice.totalAmount)})`;
  const url = `${SITE_CONFIG.url}${getInvoicePublicPath(notionPageId)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_CONFIG.name,
      locale: "ko_KR",
      type: "website",
    },
  };
}

export default async function InvoicePage({ params }: PageProps) {
  const { notionPageId } = await params;
  const invoice = await getInvoiceByPageId(notionPageId);

  if (!invoice) notFound();

  return (
    <main className="flex flex-1 flex-col">
      <Section>
        <div className="flex flex-col gap-6">
          <PageHeader title="견적서 조회" actions={<PdfDownloadButtonLoader invoice={invoice} />} />

          <Card>
            <CardContent className="flex flex-col gap-6">
              <div className="flex items-start justify-between">
                <span data-slot="invoice-number" className="text-2xl font-bold tracking-tight">
                  {invoice.invoiceNumber}
                </span>
                <span data-slot="status">
                  <Badge variant="secondary">{INVOICE_STATUS_MAP.toLabel[invoice.status]}</Badge>
                </span>
              </div>

              <div className="flex flex-wrap gap-8">
                <div data-slot="issue-date" className="flex items-center gap-2">
                  <Calendar aria-hidden="true" className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">발행일</p>
                    <p className="text-sm font-semibold">
                      {formatDateOrFallback(invoice.issueDate)}
                    </p>
                  </div>
                </div>
                <div data-slot="valid-until" className="flex items-center gap-2">
                  <Clock aria-hidden="true" className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">유효기간</p>
                    <p className="text-sm font-semibold">
                      {formatDateOrFallback(invoice.validUntil)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>클라이언트 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{invoice.clientName}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>항목별 내역</CardTitle>
            </CardHeader>
            <CardContent>
              {invoice.items.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>항목명</TableHead>
                      <TableHead className="text-right">수량</TableHead>
                      <TableHead className="text-right">단가</TableHead>
                      <TableHead className="text-right">금액</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="whitespace-normal">{item.description}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">등록된 항목이 없습니다.</p>
              )}
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <span className="text-sm text-muted-foreground">총 금액</span>
              <span className="text-base font-semibold">{formatCurrency(invoice.totalAmount)}</span>
            </CardFooter>
          </Card>
        </div>
      </Section>
    </main>
  );
}
