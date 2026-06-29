"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CodeBlock } from "@/components/shared/code-block";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";

const FORM_CODE = `// react-hook-form + Zod v4 연동 패턴
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import {
  Form, FormControl, FormDescription,
  FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// 1. Zod 스키마 정의
//    - required_error 제거됨 (Zod v4)
//    - .default() 대신 defaultValues 사용
const schema = z.object({
  name: z.string().min(2, "이름은 2자 이상 입력하세요.").max(50),
  email: z.string().email("올바른 이메일 주소를 입력하세요."),
  role: z.string().min(1, "역할을 선택하세요."),
  notifications: z.boolean(),
  terms: z.boolean().refine((v) => v === true, {
    message: "이용약관에 동의해야 합니다.",
  }),
});

type FormValues = z.infer<typeof schema>;

// 2. useForm 설정
const form = useForm<FormValues>({
  resolver: zodResolver(schema),
  defaultValues: {          // .default()를 스키마에 쓰지 말고 여기서 처리
    name: "",
    email: "",
    role: "",
    notifications: true,
    terms: false,
  },
});

// 3. 제출 핸들러
function onSubmit(values: FormValues) {
  toast.success("제출 완료!");
  console.log(values);
}

// 4. FormField 패턴
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>이름</FormLabel>
          <FormControl>
            <Input placeholder="홍길동" {...field} />
          </FormControl>
          <FormMessage /> {/* 유효성 검사 오류 자동 표시 */}
        </FormItem>
      )}
    />
    <Button type="submit">제출하기</Button>
  </form>
</Form>`;

// Zod v4 스키마 — .default() 제거, required_error 대신 .min() 사용
const formSchema = z.object({
  name: z.string().min(2, "이름은 2자 이상 입력하세요.").max(50),
  email: z.string().email("올바른 이메일 주소를 입력하세요."),
  role: z.string().min(1, "역할을 선택하세요."),
  bio: z.string().max(200, "소개는 200자 이하로 작성하세요.").optional(),
  notifications: z.boolean(),
  terms: z.boolean().refine((v) => v === true, {
    message: "이용약관에 동의해야 합니다.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function FormsPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      bio: "",
      notifications: true,
      terms: false,
    },
  });

  function onSubmit(values: FormValues) {
    toast.success("폼 제출 완료!", {
      description: `${values.name}님, 제출이 완료되었습니다.`,
    });
    console.log(values);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="폼 & 입력"
        description="react-hook-form + Zod v4 유효성 검사 패턴 예제"
      />

      <Separator />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="max-w-lg space-y-6"
        >
          {/* 이름 */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이름</FormLabel>
                <FormControl>
                  <Input placeholder="홍길동" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 이메일 */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이메일</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="hello@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 역할 선택 */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>역할</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="역할을 선택하세요" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="admin">관리자</SelectItem>
                    <SelectItem value="user">일반 사용자</SelectItem>
                    <SelectItem value="guest">게스트</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 자기소개 */}
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>자기소개 (선택)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="간단한 자기소개를 입력하세요."
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormDescription>최대 200자</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 알림 스위치 */}
          <FormField
            control={form.control}
            name="notifications"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <FormLabel className="text-base">이메일 알림</FormLabel>
                  <FormDescription>새 소식을 이메일로 받아보세요.</FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* 약관 체크박스 */}
          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className="flex items-start gap-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-0.5"
                  />
                </FormControl>
                <div>
                  <FormLabel>이용약관 동의</FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            제출하기
          </Button>
        </form>
      </Form>

      <Separator />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">폼 구현 코드</h2>
        <p className="text-sm text-muted-foreground">
          위 폼의 react-hook-form + Zod v4 연동 패턴입니다.
        </p>
        <CodeBlock code={FORM_CODE} />
      </section>
    </div>
  );
}
