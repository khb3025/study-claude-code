"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { useDebounceValue } from "@/lib/hooks/use-debounce";

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [value, setValue] = useState(searchParams.get("search") ?? "");
  const [debouncedValue] = useDebounceValue(value, 300);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const currentSearch = params.get("search") ?? "";
    if (debouncedValue === currentSearch) return;

    if (debouncedValue) {
      params.set("search", debouncedValue);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
    // searchParams/router/pathname은 매 렌더 새 인스턴스라 의존성에 넣으면 무한 루프가 발생하므로 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  return (
    <div className="relative w-full max-w-sm">
      <Search
        aria-hidden="true"
        className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        placeholder="견적서 번호 또는 클라이언트명 검색"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="pl-8"
      />
    </div>
  );
}
