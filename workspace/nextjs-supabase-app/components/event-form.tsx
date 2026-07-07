"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, ImageIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { createEvent, updateEvent } from "@/app/events/actions";
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
import { Checkbox } from "@/components/ui/checkbox";
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

// 업로드 가능한 최대 파일 크기(5MB)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

interface EventFormProps {
  // 수정 모드일 때 폼에 미리 채워 넣을 기존 이벤트 값
  initialValues?: Partial<EventFormValues>;
  mode?: "create" | "edit";
  // 수정 모드일 때 어떤 이벤트를 대상으로 updateEvent를 호출할지 지정
  eventId?: string;
}

export function EventForm({
  initialValues,
  mode = "create",
  eventId,
}: EventFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      image_url: null,
      participation_fee_enabled: false,
      participation_fee_amount: null,
      ...initialValues,
    },
  });

  const imageUrl = form.watch("image_url");
  const participationFeeEnabled = form.watch("participation_fee_enabled");

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setImageError("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    setImageError(null);
    setIsUploadingImage(true);
    try {
      const supabase = createClient();
      // 한글/공백 등 원본 파일명의 특수문자가 Storage 객체 키 규칙과 충돌하지 않도록
      // 확장자만 추출해 UUID 기반 파일명으로 저장한다
      const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
      const path = `${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("event-images")
        .upload(path, file);

      if (uploadError) {
        console.error("이벤트 사진 업로드 실패:", uploadError);
        setImageError(`이미지 업로드에 실패했습니다: ${uploadError.message}`);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("event-images").getPublicUrl(path);

      form.setValue("image_url", publicUrl, { shouldValidate: true });
    } finally {
      setIsUploadingImage(false);
    }
  };

  // 참가 방식이 "비밀번호"일 때만 비밀번호 입력 필드를 노출한다
  const joinType = form.watch("join_type");
  // 반복 유형에 따라 필요한 하위 옵션(요일/주차/일자/시간)만 노출한다
  const recurrenceType = form.watch("recurrence_type");

  const onSubmit = async (values: EventFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result =
        mode === "edit" && eventId
          ? await updateEvent(eventId, values)
          : await createEvent(values);
      // 성공 시 Server Action 내부에서 redirect()가 호출되어 이 지점에 도달하지 않는다
      if (result?.error) {
        setSubmitError(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">
          {mode === "edit" ? "이벤트 수정" : "이벤트 생성"}
        </CardTitle>
        <CardDescription>
          {mode === "edit"
            ? "이벤트 정보를 수정해주세요"
            : "새 모임 이벤트의 정보를 입력해주세요"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <FormItem>
              <FormLabel>이벤트 사진 (선택)</FormLabel>
              <FormControl>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="aspect-square w-full max-w-[240px] cursor-pointer disabled:cursor-not-allowed"
                  >
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt="이벤트 사진 미리보기"
                        className="h-full w-full rounded-lg border object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg border bg-muted text-sm text-muted-foreground hover:bg-muted/70">
                        <ImageIcon className="h-8 w-8" />
                        이벤트 사진
                      </div>
                    )}
                  </button>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    disabled={isUploadingImage}
                    onChange={handleImageChange}
                  />
                  {isUploadingImage && (
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      업로드 중...
                    </p>
                  )}
                  {imageError && (
                    <p className="text-sm text-destructive">{imageError}</p>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
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
            <FormField
              control={form.control}
              name="participation_fee_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start gap-3 rounded-lg border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked === true);
                        if (checked !== true) {
                          form.setValue("participation_fee_amount", null, {
                            shouldValidate: true,
                          });
                        }
                      }}
                    />
                  </FormControl>
                  <div className="flex flex-col gap-1">
                    <FormLabel>참가비 금액 설정</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      체크하면 참여가 확정될 때마다 참가비 정산 항목에 자동으로
                      분담액이 추가됩니다.
                    </p>
                  </div>
                </FormItem>
              )}
            />
            {participationFeeEnabled && (
              <FormField
                control={form.control}
                name="participation_fee_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이벤트 참가비 (1인 기준)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="예: 10000"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {submitError && (
              <p className="text-sm text-destructive">{submitError}</p>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting
                ? "저장 중..."
                : mode === "edit"
                  ? "수정 완료"
                  : "저장"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
