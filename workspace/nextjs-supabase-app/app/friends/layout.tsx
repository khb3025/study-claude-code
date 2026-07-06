import { EventsBottomNav } from "@/components/events-bottom-nav";

// 친구 페이지는 이벤트 목록의 하위 화면이므로 상단 브랜드 내비게이션 없이
// 뒤로가기 아이콘(BackToEventsLink, 페이지 내부)만으로 이동한다.
export default function FriendsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="flex w-full flex-1 flex-col items-center gap-8">
        <div className="flex w-full max-w-5xl flex-1 flex-col gap-8 p-5 pb-24 pt-8 md:pb-8">
          {children}
        </div>
      </div>
      <EventsBottomNav />
    </main>
  );
}
