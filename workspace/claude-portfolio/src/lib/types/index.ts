// API 응답 표준 형태
export type ApiResponse<T> = {
  data: T;
  message: string;
  success: boolean;
};

// 페이지네이션 메타데이터
export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

// Select / Radio 옵션 항목
export type Option = {
  label: string;
  value: string;
  disabled?: boolean;
};

// 정렬 방향
export type SortDirection = "asc" | "desc";

// 정렬 상태
export type SortState<T extends string = string> = {
  column: T;
  direction: SortDirection;
};

// 기본 사용자 프로필 (인증 구현 전 플레이스홀더)
export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: "admin" | "user" | "guest";
};

// 공통 페이지 Props
export type PageProps = {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string | string[]>>;
};
