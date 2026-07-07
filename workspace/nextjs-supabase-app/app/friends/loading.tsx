import { Skeleton } from "@/components/ui/skeleton";

// 친구 목록 로딩 스켈레톤
export default function FriendsLoading() {
  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
  );
}
