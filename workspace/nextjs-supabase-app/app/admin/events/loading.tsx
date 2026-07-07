import { Skeleton } from "@/components/ui/skeleton";

// 관리자 이벤트 관리 로딩 스켈레톤
export default function AdminEventsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-28" />
      <Skeleton className="h-10 w-full max-w-sm" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}
