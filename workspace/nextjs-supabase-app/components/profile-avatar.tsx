import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// 유튜브 채널 아이콘처럼 아바타 미설정 시 이름 기반으로 고정된 색상+이니셜을 생성한다
const FALLBACK_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-sky-500",
  "bg-blue-500",
  "bg-violet-500",
  "bg-fuchsia-500",
  "bg-rose-500",
];

function getFallbackColor(seed: string) {
  const hash = Array.from(seed).reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0,
  );
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
}

interface ProfileAvatarProps {
  avatarUrl?: string | null;
  // 이니셜/색상 산출에 쓰이는 이름(닉네임 우선, 없으면 이메일 등)
  name: string;
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function ProfileAvatar({
  avatarUrl,
  name,
  size = "default",
  className,
}: ProfileAvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <Avatar size={size} className={className}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
      <AvatarFallback
        className={cn("font-semibold text-white", getFallbackColor(name))}
      >
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}
