"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  JOIN_TYPE,
  RECURRENCE_TYPE,
  WEEKDAY_OPTIONS,
  WEEK_OF_MONTH_OPTIONS,
  eventFormSchema,
  type EventFormValues,
} from "@/types/event";

export function EventForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      capacity: 1,
      join_type: JOIN_TYPE.FIRST_COME.value,
      password: "",
      schedule: "",
      items_to_bring: "",
      recurrence_type: RECURRENCE_TYPE.NONE.value,
      settlement_visible: true,
    },
  });

  // 참가 방식이 "비밀번호"일 때만 비밀번호 입력 필드를 노출한다
  const joinType = form.watch("join_type");
  // 반복 유형에 따라 필요한 하위 옵션(요일/주차/일자/시간)만 노출한다
  const recurrenceType = form.watch("recurrence_type");

  const onSubmit = async (values: EventFormValues) => {
    setIsSubmitting(true);
    try {
      // Task 004(서버 액션 연동) 이전까지는 더미 제출 처리
      console.log("이벤트 생성 폼 제출값:", values);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">이벤트 생성</CardTitle>
        <CardDescription>새 모임 이벤트의 정보를 입력해주세요</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>제목</FormLabel>
                  <FormControl>
                    <Input placeholder="예: 화요일 저녁 수영 강습" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>설명 / 공지사항</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="집합 장소, 준비물 등을 안내해주세요"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>장소</FormLabel>
                  <FormControl>
                    <Input placeholder="예: 올림픽수영장" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="schedule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이벤트 일정</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="예: 18:30 집합 → 19:00 시작 → 21:00 종료"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="items_to_bring"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>준비물</FormLabel>
                  <FormControl>
                    <Input placeholder="예: 수모, 수경, 개인 물병" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="starts_at"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>일시</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(field.value, "PPP", { locale: ko })
                            : "날짜를 선택하세요"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>정원</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="join_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>참가 방식</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="참가 방식을 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(JOIN_TYPE).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {joinType === JOIN_TYPE.PASSWORD.value && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>참가 비밀번호</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="참가자가 입력할 비밀번호"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="recurrence_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>반복 설정</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="반복 여부를 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(RECURRENCE_TYPE).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {recurrenceType !== RECURRENCE_TYPE.NONE.value && (
              <div className="flex flex-col gap-4 rounded-lg border p-4">
                {/* 매주 / 매달 N번째 요일: 요일 선택 필요 */}
                {(recurrenceType === RECURRENCE_TYPE.WEEKLY.value ||
                  recurrenceType ===
                    RECURRENCE_TYPE.MONTHLY_NTH_WEEKDAY.value) && (
                  <FormField
                    control={form.control}
                    name="recurrence_weekday"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>요일</FormLabel>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="예: 화요일" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {WEEKDAY_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value.toString()}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {/* 매달 N번째 요일: 몇 번째 주인지 선택 필요(예: 첫째주 수요일) */}
                {recurrenceType ===
                  RECURRENCE_TYPE.MONTHLY_NTH_WEEKDAY.value && (
                  <FormField
                    control={form.control}
                    name="recurrence_week_of_month"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>몇 번째 주</FormLabel>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="예: 첫째주" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {WEEK_OF_MONTH_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value.toString()}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {/* 매달 특정 일자: 날짜(1~31일) 선택 필요(예: 매달 1일) */}
                {recurrenceType === RECURRENCE_TYPE.MONTHLY_DATE.value && (
                  <FormField
                    control={form.control}
                    name="recurrence_day_of_month"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>매달 며칠</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={31}
                            placeholder="예: 1"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="recurrence_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>반복 시간</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            <FormField
              control={form.control}
              name="settlement_visible"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>정산 내역 공개 범위</FormLabel>
                  <Select
                    value={field.value ? "public" : "private"}
                    onValueChange={(value) =>
                      field.onChange(value === "public")
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="정산 내역 공개 여부를 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="public">
                        공개 — 참여자 전체에게 정산 내역을 보여줍니다
                      </SelectItem>
                      <SelectItem value="private">
                        비공개 — 주최자만 정산 내역을 볼 수 있습니다
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "저장 중..." : "저장"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
