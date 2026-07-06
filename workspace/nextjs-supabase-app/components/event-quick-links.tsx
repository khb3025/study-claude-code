import Link from "next/link";
import { CalendarCheck, Mail, Users, UserRound } from "lucide-react";

// 이벤트 목록 상단에 배치되는 퀵링크 아이콘 바(주최/참여/초대/친구 바로가기)
const QUICK_LINKS = [
  { href: "/events/mine", label: "나의 주최", icon: UserRound },
  { href: "/events/joined", label: "참여 이벤트", icon: CalendarCheck },
  { href: "/events/invitations", label: "초대 목록", icon: Mail },
  { href: "/friends", label: "친구", icon: Users },
] as const;

export function EventQuickLinks() {
  return (
    <nav className="grid grid-cols-4 gap-2">
      {QUICK_LINKS.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1.5 rounded-lg border bg-card p-3 text-center transition-colors hover:bg-accent/50"
          >
            <Icon className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
