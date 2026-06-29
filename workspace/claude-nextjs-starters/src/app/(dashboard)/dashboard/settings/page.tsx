"use client";

import { useState } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PageHeader } from "@/components/shared/page-header";

const profileSchema = z.object({
  siteName: z.string().min(2, "사이트 이름은 2자 이상 입력하세요."),
  siteUrl: z.string().url("올바른 URL을 입력하세요."),
  adminEmail: z.string().email("올바른 이메일을 입력하세요."),
});

type ProfileValues = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      siteName: "MyStarter",
      siteUrl: "https://example.com",
      adminEmail: "admin@example.com",
    },
  });

  function onSaveProfile(values: ProfileValues) {
    toast.success("설정이 저장되었습니다.", {
      description: `사이트 이름: ${values.siteName}`,
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="설정"
        description="사이트 전반의 설정을 관리하세요."
      />

      {/* 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
          <CardDescription>사이트 이름, URL, 관리자 이메일을 설정합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSaveProfile)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="siteName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>사이트 이름</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="siteUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>사이트 URL</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="adminEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>관리자 이메일</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormDescription>
                      시스템 알림이 이 이메일로 발송됩니다.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">저장</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* 알림 설정 */}
      <Card>
        <CardHeader>
          <CardTitle>알림 설정</CardTitle>
          <CardDescription>시스템 알림 수신 방식을 설정합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">이메일 알림</p>
              <p className="text-xs text-muted-foreground">
                주문, 사용자 가입 등 주요 이벤트를 이메일로 받습니다.
              </p>
            </div>
            <Switch
              checked={emailAlerts}
              onCheckedChange={(v) => {
                setEmailAlerts(v);
                toast.success(v ? "이메일 알림을 켰습니다." : "이메일 알림을 껐습니다.");
              }}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">방문자 분석</p>
              <p className="text-xs text-muted-foreground">
                페이지 뷰 및 트래픽 데이터를 수집합니다.
              </p>
            </div>
            <Switch
              checked={analyticsEnabled}
              onCheckedChange={(v) => {
                setAnalyticsEnabled(v);
                toast.success(v ? "분석이 활성화되었습니다." : "분석이 비활성화되었습니다.");
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* 위험 구역 */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">위험 구역</CardTitle>
          <CardDescription>
            아래 설정은 서비스에 즉각적인 영향을 미칩니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">유지보수 모드</p>
              <p className="text-xs text-muted-foreground">
                활성화하면 방문자에게 점검 중 안내 페이지가 표시됩니다.
              </p>
            </div>
            <Switch
              checked={maintenanceMode}
              onCheckedChange={(v) => {
                setMaintenanceMode(v);
                toast[v ? "warning" : "success"](
                  v ? "유지보수 모드가 켜졌습니다." : "유지보수 모드가 꺼졌습니다."
                );
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
