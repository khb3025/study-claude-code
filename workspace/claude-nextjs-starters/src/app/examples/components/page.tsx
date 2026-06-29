"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  Mail,
  Download,
  Loader2,
  Info,
  XCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { CodeBlock } from "@/components/shared/code-block";

const BUTTON_CODE = `import { Button } from "@/components/ui/button";
import { Mail, Loader2 } from "lucide-react";

// Variant
<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="link">Link</Button>

// Size
<Button size="xs">XSmall</Button>
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>

// 아이콘 포함
<Button>
  <Mail className="size-4" />
  이메일 보내기
</Button>

// 로딩 상태 (disabled + animate-spin)
<Button disabled>
  <Loader2 className="size-4 animate-spin" />
  처리 중…
</Button>`;

const BADGE_CODE = `import { Badge } from "@/components/ui/badge";

<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destructive</Badge>

// 온라인 상태 표시
<Badge variant="default">
  <span className="mr-1 inline-block size-1.5 rounded-full bg-emerald-400" />
  온라인
</Badge>`;

const INPUT_CODE = `import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";

<Input placeholder="이름을 입력하세요" />
<Input type="email" placeholder="이메일" />
<Input type="password" placeholder="비밀번호" />
<Textarea placeholder="내용을 입력하세요" rows={3} />

<Switch checked={value} onCheckedChange={setValue} />
<Checkbox checked={value} onCheckedChange={setValue} />

<Select onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="선택하세요" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="a">옵션 A</SelectItem>
    <SelectItem value="b">옵션 B</SelectItem>
  </SelectContent>
</Select>`;

const AVATAR_PROGRESS_CODE = `import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { getInitials } from "@/lib/utils";

// Avatar — 이미지 없으면 이니셜 폴백
<Avatar>
  <AvatarImage src={user.avatarUrl} alt={user.name} />
  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
</Avatar>

// Progress
<Progress value={72} />`;

const FEEDBACK_CODE = `import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

// Alert (정적 알림)
<Alert>
  <Info className="size-4" />
  <AlertTitle>안내</AlertTitle>
  <AlertDescription>메시지 내용</AlertDescription>
</Alert>

// Dialog (모달)
<Dialog>
  <DialogTrigger asChild>
    <Button>모달 열기</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>제목</DialogTitle>
    </DialogHeader>
    <p>내용</p>
  </DialogContent>
</Dialog>

// Toast (Sonner)
toast.success("성공!", { description: "작업이 완료되었습니다." });
toast.error("오류", { description: "처리 중 문제가 생겼습니다." });

// Tooltip
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline">툴팁</Button>
    </TooltipTrigger>
    <TooltipContent>설명 텍스트</TooltipContent>
  </Tooltip>
</TooltipProvider>

// DropdownMenu
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">메뉴</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>항목 1</DropdownMenuItem>
    <DropdownMenuItem>항목 2</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`;

export default function ComponentsPage() {
  const [switchOn, setSwitchOn] = useState(true);
  const [checked, setChecked] = useState(false);
  const [selectValue, setSelectValue] = useState("");

  return (
    <TooltipProvider>
      <div className="space-y-12">
        <PageHeader
          title="컴포넌트 쇼케이스"
          description="shadcn/ui 컴포넌트의 실제 동작과 코드 예제를 확인하세요."
        />

        <Separator />

        {/* Button */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Button</h2>
          <div className="rounded-lg border border-border p-4 space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Variant</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Size</p>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="xs">XSmall</Button>
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">아이콘 + 상태</p>
              <div className="flex flex-wrap gap-2">
                <Button><Mail className="size-4" />이메일 보내기</Button>
                <Button variant="outline"><Download className="size-4" />다운로드</Button>
                <Button variant="secondary">다음<ArrowRight className="size-4" /></Button>
                <Button disabled><Loader2 className="size-4 animate-spin" />처리 중…</Button>
              </div>
            </div>
          </div>
          <CodeBlock code={BUTTON_CODE} />
        </section>

        <Separator />

        {/* Badge */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Badge</h2>
          <div className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">신규</Badge>
              <Badge variant="default">
                <span className="mr-1 inline-block size-1.5 rounded-full bg-emerald-400" />
                온라인
              </Badge>
              <Badge variant="destructive">오류</Badge>
              <Badge variant="outline">v2.0.0</Badge>
            </div>
          </div>
          <CodeBlock code={BADGE_CODE} />
        </section>

        <Separator />

        {/* Input Controls */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">입력 요소</h2>
          <div className="rounded-lg border border-border p-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input placeholder="이름을 입력하세요" />
              <Input type="email" placeholder="이메일" />
              <Input type="password" placeholder="비밀번호" />
              <Select value={selectValue} onValueChange={setSelectValue}>
                <SelectTrigger>
                  <SelectValue placeholder="역할을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">관리자</SelectItem>
                  <SelectItem value="user">일반 사용자</SelectItem>
                  <SelectItem value="guest">게스트</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea placeholder="내용을 입력하세요" rows={3} />
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={switchOn} onCheckedChange={setSwitchOn} />
                <span className="text-sm">이메일 알림 {switchOn ? "켜짐" : "꺼짐"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={checked} onCheckedChange={(v) => setChecked(v as boolean)} />
                <span className="text-sm">이용약관 동의</span>
              </div>
            </div>
          </div>
          <CodeBlock code={INPUT_CODE} />
        </section>

        <Separator />

        {/* Avatar + Progress */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Avatar & Progress</h2>
          <div className="rounded-lg border border-border p-4 space-y-4">
            <div className="flex flex-wrap gap-4">
              {["김철수", "이영희", "박민준", "최지은"].map((name) => (
                <div key={name} className="flex items-center gap-2">
                  <Avatar>
                    <AvatarFallback>
                      {name.slice(0, 1)}
                      {name.slice(1, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{name}</span>
                </div>
              ))}
            </div>
            <div className="max-w-sm space-y-3">
              {[["스토리지", 72], ["목표 달성률", 45], ["온보딩", 90]].map(
                ([label, value]) => (
                  <div key={label} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{label}</span>
                      <span className="text-muted-foreground">{value}%</span>
                    </div>
                    <Progress value={value as number} />
                  </div>
                )
              )}
            </div>
          </div>
          <CodeBlock code={AVATAR_PROGRESS_CODE} />
        </section>

        <Separator />

        {/* Skeleton */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Skeleton (로딩 상태)</h2>
          <div className="rounded-lg border border-border p-4 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full max-w-sm" />
              <Skeleton className="h-4 w-4/5 max-w-xs" />
              <Skeleton className="h-4 w-3/5" />
            </div>
          </div>
          <CodeBlock
            code={`import { Skeleton } from "@/components/ui/skeleton";

// 카드 로딩 상태 예시
<div className="flex items-center gap-3">
  <Skeleton className="size-10 rounded-full" />
  <div className="space-y-2">
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-3 w-24" />
  </div>
</div>
<Skeleton className="h-40 w-full rounded-lg" />`}
          />
        </section>

        <Separator />

        {/* Feedback & Overlay */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">피드백 & 오버레이</h2>
          <div className="rounded-lg border border-border p-4 space-y-4">
            {/* Alert */}
            <div className="space-y-2">
              <Alert>
                <Info className="size-4" />
                <AlertTitle>안내</AlertTitle>
                <AlertDescription>일반 정보를 전달하는 알림입니다.</AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <XCircle className="size-4" />
                <AlertTitle>오류</AlertTitle>
                <AlertDescription>처리 중 오류가 발생했습니다.</AlertDescription>
              </Alert>
            </div>
            {/* Toast buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success("성공!", { description: "작업이 완료되었습니다." })}
              >
                <CheckCircle2 className="size-4" />
                성공 토스트
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.error("오류", { description: "처리 중 문제가 생겼습니다." })}
              >
                <XCircle className="size-4" />
                오류 토스트
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.warning("주의", { description: "저장하지 않은 변경사항이 있습니다." })}
              >
                <AlertTriangle className="size-4" />
                경고 토스트
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info("안내", { description: "새로운 업데이트가 있습니다." })}
              >
                <Info className="size-4" />
                안내 토스트
              </Button>
            </div>
            {/* Dialog + Tooltip + Dropdown */}
            <div className="flex flex-wrap items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">모달 열기</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>프로필 수정</DialogTitle>
                    <DialogDescription>
                      사용자 정보를 수정한 후 저장 버튼을 클릭하세요.
                    </DialogDescription>
                  </DialogHeader>
                  <p className="text-sm text-muted-foreground">폼 컴포넌트를 여기에 배치합니다.</p>
                  <DialogFooter>
                    <Button variant="outline">취소</Button>
                    <Button onClick={() => toast.success("저장되었습니다.")}>저장</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">툴팁</Button>
                </TooltipTrigger>
                <TooltipContent>추가 정보를 여기에 표시합니다.</TooltipContent>
              </Tooltip>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">드롭다운</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>계정</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => toast.info("프로필")}>프로필</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.info("설정")}>설정</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => toast.error("로그아웃")}
                  >
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <CodeBlock code={FEEDBACK_CODE} />
        </section>
      </div>
    </TooltipProvider>
  );
}
