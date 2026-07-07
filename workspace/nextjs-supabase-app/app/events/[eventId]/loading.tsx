import { Skeleton } from "@/components/ui/skeleton";

// 이벤트 상세 페이지 로딩 스켈레톤: 헤더+탭+공지 카드 형태를 흉내낸다
export default function EventDetailLoading() {
  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-16 rounded-md" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[240px_1fr]">
        <Skeleton className="aspect-square w-full rounded-lg md:aspect-auto md:h-60" />
        <div className="flex flex-col gap-4 rounded-lg border p-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-5 w-2/3" />
          ))}
        </div>
      </div>
    </div>
  );
}
