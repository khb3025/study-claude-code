"use client";

import { useEffect, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { CodeBlock } from "@/components/shared/code-block";

type Post = {
  id: number;
  title: string;
  body: string;
};

const CLIENT_FETCH_CODE = `// Client Component — useEffect + fetch 패턴
"use client";

import { useEffect, useState } from "react";

type Post = { id: number; title: string; body: string };

export function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchPosts() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          "https://jsonplaceholder.typicode.com/posts?_limit=5"
        );
        if (!res.ok) throw new Error("데이터를 불러오지 못했습니다.");
        const data: Post[] = await res.json();
        if (!cancelled) setPosts(data);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "알 수 없는 오류");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPosts();
    return () => { cancelled = true; }; // 언마운트 시 race condition 방지
  }, []);

  if (loading) return <Skeleton className="h-40 w-full" />;
  if (error) return <Alert variant="destructive"><p>{error}</p></Alert>;

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}`;

const SERVER_FETCH_CODE = `// Server Component — async/await 직접 사용 (Next.js App Router)
// app/posts/page.tsx

type Post = { id: number; title: string; body: string };

async function getPosts(): Promise<Post[]> {
  const res = await fetch(
    "https://jsonplaceholder.typicode.com/posts?_limit=5",
    { next: { revalidate: 3600 } } // 1시간마다 재검증 (ISR)
  );
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts(); // Server Component — await 직접 사용

  return (
    <ul className="space-y-2">
      {posts.map((post) => (
        <li key={post.id} className="rounded border p-3">
          <p className="font-medium">{post.title}</p>
        </li>
      ))}
    </ul>
  );
}`;

const LOADING_STATE_CODE = `// loading.tsx — 자동 Suspense 폴백 (Next.js App Router)
// app/posts/loading.tsx

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
  );
}`;

const ERROR_BOUNDARY_CODE = `// error.tsx — 자동 에러 바운더리 (Next.js App Router)
// app/posts/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <p className="text-destructive">{error.message}</p>
      <Button onClick={reset}>다시 시도</Button>
    </div>
  );
}`;

export default function DataFetchingPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchPosts() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          "https://jsonplaceholder.typicode.com/posts?_limit=5"
        );
        if (!res.ok) throw new Error("데이터를 불러오지 못했습니다.");
        const data: Post[] = await res.json();
        if (!cancelled) setPosts(data);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "알 수 없는 오류");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPosts();
    return () => {
      cancelled = true;
    };
  }, [fetchKey]);

  return (
    <div className="space-y-12">
      <PageHeader
        title="데이터 페칭"
        description="Client Component fetch 패턴, Server Component async/await, 로딩·에러 처리"
      />

      <Separator />

      {/* Client-side fetch 데모 */}
      <section className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Client Component 데이터 페칭</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              useEffect + useState로 JSONPlaceholder API에서 게시물을 가져옵니다.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFetchKey((k) => k + 1)}
          >
            <RefreshCw className="size-3.5" />
            새로고침
          </Button>
        </div>

        <div className="rounded-lg border border-border p-4 min-h-[12rem]">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <ul className="space-y-4">
              {posts.map((post) => (
                <li key={post.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      #{post.id}
                    </Badge>
                    <p className="text-sm font-medium">{post.title}</p>
                  </div>
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {post.body}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <CodeBlock code={CLIENT_FETCH_CODE} />
      </section>

      <Separator />

      {/* Server Component fetch */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Server Component 데이터 페칭</h2>
        <p className="text-sm text-muted-foreground">
          Next.js App Router에서는 async Server Component로 직접 데이터를 가져올 수 있습니다.
          fetch에 <code className="rounded bg-muted px-1 text-xs">next.revalidate</code>를 전달해
          ISR(Incremental Static Regeneration)을 구성할 수 있습니다.
        </p>
        <CodeBlock code={SERVER_FETCH_CODE} />
      </section>

      <Separator />

      {/* loading.tsx */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">loading.tsx — 자동 Suspense 폴백</h2>
        <p className="text-sm text-muted-foreground">
          Next.js는 <code className="rounded bg-muted px-1 text-xs">loading.tsx</code>를 자동으로
          Suspense 바운더리로 감싸줍니다. 데이터 페칭 중 표시됩니다.
        </p>
        <CodeBlock code={LOADING_STATE_CODE} />
      </section>

      <Separator />

      {/* error.tsx */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">error.tsx — 자동 에러 바운더리</h2>
        <p className="text-sm text-muted-foreground">
          <code className="rounded bg-muted px-1 text-xs">error.tsx</code>는 Server Component에서
          발생한 에러를 자동으로 포착합니다. <code className="rounded bg-muted px-1 text-xs">reset()</code>
          함수로 재시도할 수 있습니다.
        </p>
        <CodeBlock code={ERROR_BOUNDARY_CODE} />
      </section>
    </div>
  );
}
