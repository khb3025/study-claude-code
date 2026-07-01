import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { CodeBlock } from "@/components/shared/code-block";

const METADATA_CODE = `// app/layout.tsx — 전역 메타데이터
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "MyStarter",
    template: "%s | MyStarter", // 하위 페이지: "페이지명 | MyStarter"
  },
  description: "Next.js 15 + TypeScript + Tailwind CSS v4 + shadcn/ui 스타터 킷",
  openGraph: {
    title: "MyStarter",
    description: "빠르게 시작하는 모던 웹 스타터 킷",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyStarter",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// app/posts/[id]/page.tsx — 동적 메타데이터
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);

  return {
    title: post.title,
    description: post.body.slice(0, 160),
  };
}`;

const IMAGE_CODE = `// Next.js <Image> — 자동 최적화 (WebP 변환, lazy loading, 크기 조정)
import Image from "next/image";

// 정적 이미지 (크기 자동 감지)
import profilePic from "@/public/profile.png";
<Image src={profilePic} alt="프로필" />

// 원격 이미지 (next.config.ts에 도메인 등록 필요)
<Image
  src="https://example.com/photo.jpg"
  alt="사진"
  width={800}
  height={600}
  priority          // LCP 이미지에 적용 — preload 처리
  className="object-cover"
/>

// 부모 요소에 fill (fill + relative 부모 필수)
<div className="relative aspect-video">
  <Image
    src="/hero.jpg"
    alt="히어로"
    fill
    className="object-cover"
    sizes="(max-width: 768px) 100vw, 50vw" // 브라우저 크기별 이미지 크기 힌트
  />
</div>

// next.config.ts — 원격 이미지 도메인 허용
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "example.com" },
    ],
  },
};`;

const DYNAMIC_IMPORT_CODE = `// 동적 임포트 — 초기 번들 크기 절감
import dynamic from "next/dynamic";

// 클라이언트 전용 컴포넌트 (SSR 비활성화)
const HeavyChart = dynamic(
  () => import("@/components/heavy-chart"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full" />,
  }
);

// 조건부 렌더링 — 필요할 때만 로드
const AdminPanel = dynamic(() => import("@/components/admin-panel"));

export default function Dashboard() {
  const { isAdmin } = useUser();

  return (
    <div>
      <HeavyChart /> {/* 항상 렌더링 — lazy load */}
      {isAdmin && <AdminPanel />} {/* 관리자만 로드 */}
    </div>
  );
}`;

const FONT_CODE = `// Next.js Font — 자동 최적화 (no FOUT, 서브셋, 폰트 변수)
// app/layout.tsx

import { Inter, Noto_Sans_KR } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={\`\${inter.variable} \${notoSansKr.variable}\`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}

// globals.css — 폰트 변수 연결
// @theme inline {
//   --font-sans: var(--font-inter), var(--font-noto), sans-serif;
// }`;

const BUNDLE_ANALYSIS_CODE = `# 번들 분석 — @next/bundle-analyzer
npm install @next/bundle-analyzer

// next.config.ts
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer({
  // Next.js 설정
});

# 분석 실행
ANALYZE=true npm run build`;

const ISR_CODE = `// ISR (Incremental Static Regeneration) — 정적 생성 + 주기적 재검증

// 방법 1: fetch revalidate 옵션
const data = await fetch(url, {
  next: { revalidate: 60 }, // 60초마다 재검증
});

// 방법 2: 세그먼트 설정
export const revalidate = 3600; // 1시간 (페이지 전체 적용)
export const dynamic = "force-static"; // 항상 정적 생성

// 방법 3: On-Demand ISR (특정 이벤트에 캐시 무효화)
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { path, tag } = await req.json();
  if (path) revalidatePath(path);   // 특정 경로 무효화
  if (tag) revalidateTag(tag);      // fetch 태그 무효화
  return Response.json({ revalidated: true });
}`;

export default function OptimizationPage() {
  return (
    <div className="space-y-12">
      <PageHeader
        title="설정 및 최적화"
        description="메타데이터 SEO, 이미지 최적화, 동적 임포트, 폰트, ISR, 번들 분석"
      />

      <Separator />

      {/* Metadata / SEO */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">메타데이터 & SEO</h2>
        <p className="text-sm text-muted-foreground">
          Next.js 15 Metadata API로 Open Graph, Twitter Card, robots 등을 선언적으로 설정합니다.
          동적 메타데이터는 <code className="rounded bg-muted px-1 text-xs">generateMetadata</code>를 사용합니다.
        </p>
        <CodeBlock code={METADATA_CODE} />
      </section>

      <Separator />

      {/* Image */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">이미지 최적화</h2>
        <p className="text-sm text-muted-foreground">
          Next.js <code className="rounded bg-muted px-1 text-xs">{"<Image />"}</code> 컴포넌트는
          자동으로 WebP 변환, 지연 로딩, 크기 조정, 블러 플레이스홀더를 처리합니다.
        </p>
        <CodeBlock code={IMAGE_CODE} />
      </section>

      <Separator />

      {/* Dynamic Import */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">동적 임포트 (Code Splitting)</h2>
        <p className="text-sm text-muted-foreground">
          <code className="rounded bg-muted px-1 text-xs">next/dynamic</code>으로 무거운 컴포넌트를
          지연 로드하여 초기 번들 크기를 줄입니다.
        </p>
        <CodeBlock code={DYNAMIC_IMPORT_CODE} />
      </section>

      <Separator />

      {/* Font */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">폰트 최적화</h2>
        <p className="text-sm text-muted-foreground">
          <code className="rounded bg-muted px-1 text-xs">next/font/google</code>으로 Google Fonts를
          자동 최적화합니다. 폰트를 자체 호스팅하여 외부 요청 없이 FOUT(Flash of Unstyled Text)를 방지합니다.
        </p>
        <CodeBlock code={FONT_CODE} />
      </section>

      <Separator />

      {/* ISR */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">ISR — 증분 정적 재생성</h2>
        <p className="text-sm text-muted-foreground">
          정적 생성의 성능과 서버 사이드 렌더링의 최신성을 결합합니다.
          On-Demand ISR로 특정 이벤트에 캐시를 무효화할 수 있습니다.
        </p>
        <CodeBlock code={ISR_CODE} />
      </section>

      <Separator />

      {/* Bundle Analysis */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">번들 분석</h2>
        <p className="text-sm text-muted-foreground">
          <code className="rounded bg-muted px-1 text-xs">@next/bundle-analyzer</code>로 번들 크기를
          시각적으로 분석하고 최적화 대상을 파악합니다.
        </p>
        <CodeBlock code={BUNDLE_ANALYSIS_CODE} language="bash" />
      </section>
    </div>
  );
}
