import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

// 목록/조회 화면 공통 빈 상태 UI: 아이콘 + 제목 + 설명 + 선택적 액션 버튼
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-10 text-center",
        className,
      )}
    >
      {icon && (
        <div className="text-muted-foreground [&_svg]:h-8 [&_svg]:w-8">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      {description && (
        <p className="max-w-sm text-xs text-muted-foreground/80">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
