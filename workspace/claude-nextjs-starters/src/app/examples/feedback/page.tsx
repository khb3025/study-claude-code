"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Info, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PageHeader } from "@/components/shared/page-header";

function ExampleGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}

export default function FeedbackPage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className="space-y-10">
        <PageHeader
          title="피드백 & 오버레이"
          description="Dialog, AlertDialog, Toast, Alert, Skeleton, Tooltip, Popover, DropdownMenu 예제"
        />

        <Separator />

        {/* Alert (정적 알림) */}
        <ExampleGroup title="Alert">
          <div className="max-w-xl space-y-3">
            <Alert>
              <Info className="size-4" />
              <AlertTitle>안내</AlertTitle>
              <AlertDescription>
                일반 정보를 전달하는 알림입니다.
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <XCircle className="size-4" />
              <AlertTitle>오류</AlertTitle>
              <AlertDescription>
                처리 중 오류가 발생했습니다. 다시 시도해 주세요.
              </AlertDescription>
            </Alert>
          </div>
        </ExampleGroup>

        <Separator />

        {/* Skeleton */}
        <ExampleGroup title="Skeleton (로딩 상태)">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        </ExampleGroup>

        <Separator />

        {/* Toast */}
        <ExampleGroup title="Toast (Sonner)">
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => toast.success("성공!", { description: "작업이 완료되었습니다." })}
            >
              <CheckCircle2 className="size-4" />
              성공 토스트
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.error("오류 발생", { description: "처리 중 문제가 생겼습니다." })}
            >
              <XCircle className="size-4" />
              오류 토스트
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.warning("주의", { description: "저장하지 않은 변경사항이 있습니다." })}
            >
              <AlertTriangle className="size-4" />
              경고 토스트
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.info("안내", { description: "새로운 업데이트가 있습니다." })}
            >
              <Info className="size-4" />
              안내 토스트
            </Button>
          </div>
        </ExampleGroup>

        <Separator />

        {/* Dialog */}
        <ExampleGroup title="Dialog (모달)">
          <div className="flex flex-wrap gap-3">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">모달 열기</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>프로필 수정</DialogTitle>
                  <DialogDescription>
                    사용자 정보를 수정한 후 저장 버튼을 클릭하세요.
                  </DialogDescription>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  폼 컴포넌트를 여기에 배치합니다.
                </p>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    취소
                  </Button>
                  <Button onClick={() => { setDialogOpen(false); toast.success("저장되었습니다."); }}>
                    저장
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* AlertDialog */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">삭제</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
                  <AlertDialogDescription>
                    이 작업은 되돌릴 수 없습니다. 데이터가 영구적으로 삭제됩니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => toast.error("삭제되었습니다.")}
                  >
                    삭제
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </ExampleGroup>

        <Separator />

        {/* Tooltip, Popover, Dropdown */}
        <ExampleGroup title="Tooltip / Popover / Dropdown">
          <div className="flex flex-wrap items-center gap-4">
            {/* Tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  툴팁
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>추가 정보를 여기에 표시합니다.</p>
              </TooltipContent>
            </Tooltip>

            {/* Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  팝오버
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <p className="text-sm font-medium">팝오버 제목</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  툴팁보다 더 많은 콘텐츠를 담을 수 있는 팝오버입니다.
                </p>
              </PopoverContent>
            </Popover>

            {/* Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  드롭다운
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>계정</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toast.info("프로필로 이동")}>
                  프로필
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info("설정으로 이동")}>
                  설정
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => toast.error("로그아웃되었습니다.")}
                >
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </ExampleGroup>
      </div>
    </TooltipProvider>
  );
}
