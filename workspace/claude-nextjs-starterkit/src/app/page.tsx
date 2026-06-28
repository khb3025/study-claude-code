import { ArrowRight, Layers, Zap, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SITE_NAME, SITE_DESCRIPTION } from "@/constants/site"

const TECH_BADGES = [
    { label: "Next.js 15", variant: "default" as const },
    { label: "TypeScript", variant: "secondary" as const },
    { label: "TailwindCSS v4", variant: "outline" as const },
    { label: "shadcn/ui", variant: "default" as const },
] as const

const FEATURE_CARDS = [
    {
        icon: Zap,
        title: "빠른 개발 환경",
        description:
            "Next.js 15 App Router와 Turbopack으로 빠른 HMR과 최적화된 프로덕션 빌드를 경험하세요.",
    },
    {
        icon: Layers,
        title: "최신 스타일링",
        description:
            "TailwindCSS v4는 설정 파일 없이 CSS 기반 구성을 사용합니다. shadcn/ui 컴포넌트로 빠르게 UI를 구성하세요.",
    },
    {
        icon: Shield,
        title: "완전한 타입 안전성",
        description:
            "TypeScript strict mode와 Next.js 15의 타입 안전 라우팅으로 견고한 코드를 작성하세요.",
    },
] as const

/** 홈 랜딩 페이지 — Hero 섹션과 Feature 카드 */
export default function HomePage() {
    return (
        <div className="container mx-auto px-4">
            <section className="flex flex-col items-center gap-6 py-24 text-center">
                <div className="flex flex-wrap justify-center gap-2">
                    {TECH_BADGES.map((badge) => (
                        <Badge key={badge.label} variant={badge.variant}>
                            {badge.label}
                        </Badge>
                    ))}
                </div>

                <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                    {SITE_NAME}
                </h1>

                <p className="max-w-2xl text-lg text-muted-foreground">
                    {SITE_DESCRIPTION}
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                    <Button size="lg">
                        시작하기
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="lg">
                        GitHub 보기
                    </Button>
                </div>
            </section>

            <section className="grid gap-6 pb-24 sm:grid-cols-3">
                {FEATURE_CARDS.map((feature) => {
                    const Icon = feature.icon
                    return (
                        <Card key={feature.title}>
                            <CardHeader>
                                <Icon className="h-8 w-8 text-primary" />
                                <CardTitle className="mt-2">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>{feature.description}</CardDescription>
                            </CardContent>
                        </Card>
                    )
                })}
            </section>
        </div>
    )
}
