"use client";

import { useState } from "react";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { useIsMobile } from "@/lib/hooks/use-media-query";
import { useDebounceValue } from "@/lib/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { CodeBlock } from "@/components/shared/code-block";

const LOCAL_STORAGE_CODE = `// useLocalStorage — usehooks-ts
import { useLocalStorage } from "@/lib/hooks/use-local-storage";

function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage<"light" | "dark">(
    "theme",
    "light"
  );

  return (
    <Button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      현재 테마: {theme}
    </Button>
  );
}

// 페이지를 새로고침해도 값이 유지됩니다.`;

const MEDIA_QUERY_CODE = `// useIsMobile / useIsTablet / useIsDesktop — usehooks-ts
import {
  useIsMobile,
  useIsTablet,
  useIsDesktop,
} from "@/lib/hooks/use-media-query";

function ResponsiveInfo() {
  const isMobile = useIsMobile();    // < 768px
  const isTablet = useIsTablet();   // 768px ~ 1023px
  const isDesktop = useIsDesktop(); // ≥ 1024px

  return (
    <p>
      현재 화면: {isMobile ? "모바일" : isTablet ? "태블릿" : "데스크톱"}
    </p>
  );
}`;

const DEBOUNCE_CODE = `// useDebounceValue — usehooks-ts
import { useDebounceValue } from "@/lib/hooks/use-debounce";

function SearchInput() {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounceValue(query, 400); // 400ms 지연

  // debouncedQuery는 입력이 멈춘 뒤 400ms 후에 업데이트됩니다.
  useEffect(() => {
    if (debouncedQuery) {
      // API 호출 또는 검색 실행
      fetchResults(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <Input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="검색어를 입력하세요"
    />
  );
}`;

const COUNTER_STORAGE_CODE = `// 카운터 상태를 localStorage에 유지
const [count, setCount] = useLocalStorage("counter", 0);

<Button onClick={() => setCount((c) => c + 1)}>+1</Button>
<Button onClick={() => setCount(0)}>초기화</Button>
<p>카운트: {count}</p>`;

export default function HooksPage() {
  // useLocalStorage 데모
  const [storedName, setStoredName] = useLocalStorage("demo-name", "");
  const [count, setCount] = useLocalStorage("demo-count", 0);

  // useMediaQuery 데모
  const isMobile = useIsMobile();

  // useDebounce 데모
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounceValue(search, 400);

  return (
    <div className="space-y-12">
      <PageHeader
        title="usehooks-ts 예제"
        description="useLocalStorage, useMediaQuery, useDebounceValue 등 실용적인 훅 모음"
      />

      <Separator />

      {/* useLocalStorage */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">useLocalStorage</h2>
        <p className="text-sm text-muted-foreground">
          useState와 동일하게 사용하지만 값이 localStorage에 저장되어 새로고침 후에도 유지됩니다.
        </p>
        <div className="rounded-lg border border-border p-4 space-y-4">
          {/* 이름 저장 */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              이름 저장 (새로고침 후에도 유지)
            </p>
            <div className="flex gap-2">
              <Input
                value={storedName}
                onChange={(e) => setStoredName(e.target.value)}
                placeholder="이름을 입력하세요"
                className="max-w-xs"
              />
              <Button variant="outline" onClick={() => setStoredName("")}>
                초기화
              </Button>
            </div>
            {storedName && (
              <p className="text-sm">
                저장된 이름: <strong>{storedName}</strong>
              </p>
            )}
          </div>
          {/* 카운터 */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              카운터 (새로고침 후에도 유지)
            </p>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setCount((c) => c - 1)}>
                -1
              </Button>
              <span className="w-8 text-center font-mono text-lg font-bold">{count}</span>
              <Button variant="outline" size="sm" onClick={() => setCount((c) => c + 1)}>
                +1
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setCount(0)}>
                초기화
              </Button>
            </div>
          </div>
        </div>
        <CodeBlock code={LOCAL_STORAGE_CODE} />
        <CodeBlock code={COUNTER_STORAGE_CODE} language="tsx" />
      </section>

      <Separator />

      {/* useMediaQuery */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">useMediaQuery / useIsMobile</h2>
        <p className="text-sm text-muted-foreground">
          화면 크기에 따라 조건부 렌더링을 구현할 때 사용합니다. 브라우저 창 크기를 조절해 보세요.
        </p>
        <div className="rounded-lg border border-border p-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm">현재 화면:</span>
            <Badge variant={isMobile ? "destructive" : "default"}>
              {isMobile ? "모바일 (< 768px)" : "데스크톱 (≥ 768px)"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {isMobile
              ? "모바일 뷰입니다. 햄버거 메뉴, 바텀 시트 등을 사용하세요."
              : "데스크톱 뷰입니다. 사이드바, 멀티컬럼 레이아웃을 사용하세요."}
          </p>
        </div>
        <CodeBlock code={MEDIA_QUERY_CODE} />
      </section>

      <Separator />

      {/* useDebounce */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">useDebounceValue</h2>
        <p className="text-sm text-muted-foreground">
          입력이 멈춘 뒤 일정 시간이 지나야 값이 업데이트됩니다. 검색 API 호출 빈도를 줄일 때 유용합니다.
        </p>
        <div className="rounded-lg border border-border p-4 space-y-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="검색어를 입력하세요 (400ms 디바운스)"
            className="max-w-sm"
          />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                즉시 반영 (query)
              </p>
              <code className="block rounded bg-muted px-2 py-1 text-xs">
                {search || "(빈 값)"}
              </code>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                디바운스 후 (debouncedQuery)
              </p>
              <code className="block rounded bg-muted px-2 py-1 text-xs">
                {debouncedSearch || "(빈 값)"}
              </code>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            * debouncedQuery는 입력이 멈춘 후 400ms가 지나야 업데이트됩니다.
          </p>
        </div>
        <CodeBlock code={DEBOUNCE_CODE} />
      </section>
    </div>
  );
}
