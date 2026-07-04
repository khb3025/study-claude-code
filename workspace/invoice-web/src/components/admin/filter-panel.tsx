"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INVOICE_STATUS_MAP } from "@/lib/constants";
import type { InvoiceStatus } from "@/lib/types";

const ALL_STATUS_VALUE = "all";

export function FilterPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="status-filter">상태</Label>
        <Select
          value={searchParams.get("status") ?? ALL_STATUS_VALUE}
          onValueChange={(value) => updateParam("status", value === ALL_STATUS_VALUE ? "" : value)}
        >
          <SelectTrigger id="status-filter" className="w-36">
            <SelectValue placeholder="전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STATUS_VALUE}>전체</SelectItem>
            {(Object.keys(INVOICE_STATUS_MAP.toLabel) as InvoiceStatus[]).map((status) => (
              <SelectItem key={status} value={status}>
                {INVOICE_STATUS_MAP.toLabel[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="date-from">발행일(시작)</Label>
        <Input
          id="date-from"
          type="date"
          defaultValue={searchParams.get("dateFrom") ?? ""}
          onChange={(event) => updateParam("dateFrom", event.target.value)}
          className="w-40"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="date-to">발행일(종료)</Label>
        <Input
          id="date-to"
          type="date"
          defaultValue={searchParams.get("dateTo") ?? ""}
          onChange={(event) => updateParam("dateTo", event.target.value)}
          className="w-40"
        />
      </div>
    </div>
  );
}
