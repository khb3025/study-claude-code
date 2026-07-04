"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import {
  Document,
  Font,
  Page,
  PDFDownloadLink,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import { Button, buttonVariants } from "@/components/ui/button";
import { INVOICE_STATUS_MAP } from "@/lib/constants";
import type { Invoice } from "@/lib/types";
import { formatCurrency, formatDateOrFallback } from "@/lib/utils";

// 기본 Helvetica 폰트는 한글을 지원하지 않아 Noto Sans KR을 별도 등록
// Google Fonts CDN(fonts.gstatic.com)은 CORS로 차단되어 public/fonts에 자체 호스팅
Font.register({
  family: "Noto Sans KR",
  fonts: [
    { src: "/fonts/NotoSansKR-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/NotoSansKR-Bold.ttf", fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Noto Sans KR",
    fontSize: 10,
    padding: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: {
    color: "#666666",
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
    paddingBottom: 6,
    fontWeight: 700,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingVertical: 6,
  },
  colDescription: { width: "40%" },
  colQuantity: { width: "20%", textAlign: "right" },
  colUnitPrice: { width: "20%", textAlign: "right" },
  colAmount: { width: "20%", textAlign: "right" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 12,
  },
});

function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{invoice.invoiceNumber}</Text>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>클라이언트</Text>
            <Text>{invoice.clientName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>상태</Text>
            <Text>{INVOICE_STATUS_MAP.toLabel[invoice.status]}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>발행일</Text>
            <Text>{formatDateOrFallback(invoice.issueDate)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>유효기간</Text>
            <Text>{formatDateOrFallback(invoice.validUntil)}</Text>
          </View>
        </View>

        <View>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.colDescription}>항목명</Text>
            <Text style={styles.colQuantity}>수량</Text>
            <Text style={styles.colUnitPrice}>단가</Text>
            <Text style={styles.colAmount}>금액</Text>
          </View>
          {invoice.items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.colDescription}>{item.description}</Text>
              <Text style={styles.colQuantity}>{item.quantity}</Text>
              <Text style={styles.colUnitPrice}>{formatCurrency(item.unitPrice)}</Text>
              <Text style={styles.colAmount}>{formatCurrency(item.amount)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.label}>총 금액</Text>
          <Text>{formatCurrency(invoice.totalAmount)}</Text>
        </View>
      </Page>
    </Document>
  );
}

type PdfDownloadButtonProps = {
  invoice: Invoice;
};

// PDFDownloadLink는 Blob 생성 등 브라우저 API에 의존하므로 mounted 이전에는 비활성 버튼만 노출
export function PdfDownloadButton({ invoice }: PdfDownloadButtonProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" disabled>
        <Download aria-hidden="true" />
        PDF 다운로드
      </Button>
    );
  }

  return (
    <PDFDownloadLink
      document={<InvoiceDocument invoice={invoice} />}
      fileName={`${invoice.invoiceNumber}.pdf`}
      className={buttonVariants({ variant: "outline" })}
    >
      {({ loading, error }) => (
        <>
          <Download aria-hidden="true" />
          {error ? "PDF 생성 실패" : loading ? "PDF 생성 중..." : "PDF 다운로드"}
        </>
      )}
    </PDFDownloadLink>
  );
}
