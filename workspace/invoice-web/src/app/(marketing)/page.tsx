import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Zap,
  Palette,
  Shield,
  Code2,
  Globe,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ExamplesSection } from "./_components/examples-section";

// Features 섹션 데이터 타입
type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    icon: Zap,
    title: "빠른 성능",
    description: "Next.js 15 App Router 기반 최적화 렌더링으로 빠른 페이지 로딩",
  },
  {
    icon: Palette,
    title: "다크 모드",
    description: "next-themes로 구현된 OS 연동 자동 다크/라이트 테마 전환",
  },
  {
    icon: Shield,
    title: "타입 안전",
    description: "TypeScript strict 모드로 런타임 오류를 컴파일 타임에 방지",
  },
  {
    icon: Code2,
    title: "shadcn/ui",
    description: "radix-nova 스타일의 접근성 높은 UI 컴포넌트 사전 구성",
  },
  {
    icon: Globe,
    title: "반응형 디자인",
    description: "모바일부터 데스크톱까지 완벽한 반응형 레이아웃 기본 제공",
  },
  {
    icon: Layers,
    title: "Tailwind CSS v4",
    description: "최신 CSS 변수 기반 Tailwind v4로 유연하고 일관된 스타일링",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero 섹션 */}
      <section className="flex flex-col items-center justify-center px-4 py-24 text-center md:py-32">
        <Badge variant="secondary" className="mb-6">
          Next.js 15 + shadcn/ui + Tailwind v4
        </Badge>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
          빠르게 시작하는
          <br />
          <span className="text-muted-foreground">모던 웹 스타터 킷</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Next.js, TypeScript, Tailwind CSS v4, shadcn/ui가 사전 구성된
          <br className="hidden sm:block" />
          프로덕션 레디 스타터 킷입니다.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="#features">
              기능 살펴보기
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/examples">
              예제 살펴보기
            </Link>
          </Button>
        </div>
      </section>

      {/* Features 섹션 */}
      <section id="features" className="px-4 py-16 md:py-24">
        <div className="container mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              포함된 기능들
            </h2>
            <p className="mt-4 text-muted-foreground">
              개발 시작에 필요한 모든 것이 이미 준비되어 있습니다
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <feature.icon className="mb-2 size-8 text-primary" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 예제 섹션 */}
      <ExamplesSection />

      {/* CTA 섹션 */}
      <section id="cta" className="bg-muted/50 px-4 py-16 md:py-24">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            지금 바로 시작하세요
          </h2>
          <p className="mt-4 text-muted-foreground">
            설정 없이 클론 후 즉시 개발을 시작할 수 있습니다
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/examples">
              예제 살펴보기
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
