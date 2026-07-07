"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ProfileAvatar } from "@/components/profile-avatar";
import { createClient } from "@/lib/supabase/client";
import { updateProfile } from "@/app/profile/actions";

// 업로드 가능한 최대 파일 크기(5MB)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

interface ProfileEditFormProps {
  initialNickname: string | null;
  initialNameVisible: boolean;
  initialAvatarUrl: string | null;
  // 아바타 미설정 시 이니셜/색상 생성에 쓰이는 이름
  seedName: string;
  // setup: 최초 닉네임 설정 안내 화면(취소 없음, 저장 후 이벤트 목록으로 이동)
  // edit: 다이얼로그 등에서 기존 프로필 수정(저장 후 onSuccess 콜백만 호출)
  mode: "setup" | "edit";
  onSuccess?: () => void;
}

export function ProfileEditForm({
  initialNickname,
  initialNameVisible,
  initialAvatarUrl,
  seedName,
  mode,
  onSuccess,
}: ProfileEditFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nickname, setNickname] = useState(initialNickname ?? "");
  const [nameVisible, setNameVisible] = useState(initialNameVisible);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    setError(null);
    setIsUploadingImage(true);
    try {
      const supabase = createClient();
      const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
      const path = `${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file);

      if (uploadError) {
        console.error("프로필 사진 업로드 실패:", uploadError);
        setError(`이미지 업로드에 실패했습니다: ${uploadError.message}`);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);

      setAvatarUrl(publicUrl);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (formEvent: React.FormEvent) => {
    formEvent.preventDefault();
    if (!nickname.trim()) {
      setError("닉네임을 입력해주세요.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const result = await updateProfile({
        nickname: nickname.trim(),
        name_visible: nameVisible,
        avatar_url: avatarUrl,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      if (mode === "setup") {
        router.push("/events");
        router.refresh();
      } else {
        router.refresh();
        onSuccess?.();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadingImage}
          className="rounded-full disabled:cursor-not-allowed"
        >
          <ProfileAvatar
            avatarUrl={avatarUrl}
            name={nickname || seedName}
            size="lg"
            className="h-32 w-32 cursor-pointer text-4xl"
          />
        </button>
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          disabled={isUploadingImage}
          onChange={handleImageChange}
          className="hidden"
        />
        {isUploadingImage && (
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            업로드 중...
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="profile-nickname">닉네임</Label>
        <Input
          id="profile-nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="다른 사람에게 보여질 이름을 입력해주세요"
          maxLength={30}
        />
      </div>

      <div className="flex items-center justify-between rounded-md border p-3">
        <div>
          <p className="text-sm font-medium">실명 공개</p>
          <p className="text-xs text-muted-foreground">
            켜면 닉네임과 함께 회원명(실명)도 함께 공개됩니다
          </p>
        </div>
        <Switch checked={nameVisible} onCheckedChange={setNameVisible} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={isSubmitting || isUploadingImage}>
        {isSubmitting ? "저장 중..." : mode === "setup" ? "설정 완료" : "저장"}
      </Button>
    </form>
  );
}
