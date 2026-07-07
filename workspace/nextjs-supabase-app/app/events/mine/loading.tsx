import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// 나의 주최 이벤트 목록 로딩 스켈레톤
export default function MyEventsLoading() {
  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <Skeleton className="h-8 w-48" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="flex gap-3 p-3">
              <Skeleton className="h-20 w-20 shrink-0 rounded-lg" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
