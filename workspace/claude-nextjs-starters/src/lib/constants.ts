import {
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  Palette,
  FileText,
  LayoutTemplate,
  Code2,
  Database,
  type LucideIcon,
} from "lucide-react";

// 사이트 전반 메타데이터 설정
export const SITE_CONFIG = {
  name: "MyStarter",
  description: "Next.js 15 + TypeScript + Tailwind CSS v4 + shadcn/ui 기반 프로덕션 레디 스타터 킷",
  url: "https://example.com",
  author: {
    name: "개발자",
  },
} as const;

// 네비게이션 링크 타입
export type NavItem = {
  label: string;
  href: string;
  external?: boolean;
};

// 헤더 네비게이션 링크 목록
export const NAV_ITEMS: NavItem[] = [
  { label: "홈", href: "/" },
  { label: "기능", href: "#features" },
  { label: "예제", href: "/examples" },
];

// 푸터 섹션 타입
export type FooterSection = {
  title: string;
  links: NavItem[];
};

// 푸터 링크 섹션 목록
export const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: "제품",
    links: [
      { label: "기능 소개", href: "#features" },
      { label: "예제", href: "/examples" },
      { label: "대시보드", href: "/dashboard" },
    ],
  },
  {
    title: "예제",
    links: [
      { label: "컴포넌트", href: "/examples/components" },
      { label: "폼", href: "/examples/forms" },
      { label: "레이아웃", href: "/examples/layouts" },
      { label: "훅", href: "/examples/hooks" },
    ],
  },
  {
    title: "더 보기",
    links: [
      { label: "데이터 페칭", href: "/examples/data-fetching" },
      { label: "설정 및 최적화", href: "/examples/optimization" },
    ],
  },
];

// 대시보드 사이드바 메뉴 타입
export type SidebarItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

// 대시보드 사이드바 메뉴 목록
export const SIDEBAR_ITEMS: SidebarItem[] = [
  { label: "대시보드", href: "/dashboard", icon: LayoutDashboard },
  { label: "사용자", href: "/dashboard/users", icon: Users },
  { label: "통계", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "설정", href: "/dashboard/settings", icon: Settings },
];

// 예제 페이지 카테고리 타입
export type ExampleSection = {
  label: string;
  href: string;
  description: string;
  icon: LucideIcon;
  tags: string[];
};

// 예제 카테고리 목록
export const EXAMPLE_SECTIONS: ExampleSection[] = [
  {
    label: "컴포넌트 쇼케이스",
    href: "/examples/components",
    description: "모든 UI 컴포넌트의 실제 동작을 확인하고 코드 예제를 살펴보세요.",
    icon: Palette,
    tags: ["UI/UX", "인터랙티브"],
  },
  {
    label: "폼 예제",
    href: "/examples/forms",
    description: "react-hook-form과 zod를 활용한 다양한 폼 구현 예제입니다.",
    icon: FileText,
    tags: ["검증", "상태관리"],
  },
  {
    label: "레이아웃 예제",
    href: "/examples/layouts",
    description: "다양한 레이아웃 패턴과 반응형 디자인 구현 방법을 확인하세요.",
    icon: LayoutTemplate,
    tags: ["반응형", "레이아웃"],
  },
  {
    label: "usehooks-ts 예제",
    href: "/examples/hooks",
    description: "usehooks-ts 라이브러리의 다양한 훅 사용법과 실용적인 예제들입니다.",
    icon: Code2,
    tags: ["훅", "유틸리티"],
  },
  {
    label: "데이터 페칭",
    href: "/examples/data-fetching",
    description: "API 호출, 로딩 상태, 에러 처리 등 데이터 관리 예제입니다.",
    icon: Database,
    tags: ["API", "비동기"],
  },
  {
    label: "설정 및 최적화",
    href: "/examples/optimization",
    description: "성능 최적화, SEO 설정, PWA 구현 등 프로덕션 환경을 위한 설정입니다.",
    icon: Settings,
    tags: ["최적화", "SEO"],
  },
];
