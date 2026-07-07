import { Skeleton } from "@/components/ui/skeleton";

// 이벤트 수정 폼 로딩 스켈레톤
export default function EditEventLoading() {
  return (
    <div className="flex max-w-xl flex-col gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}
