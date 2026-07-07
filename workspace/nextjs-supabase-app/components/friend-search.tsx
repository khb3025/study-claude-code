"use client";

import { useState, useTransition } from "react";
import { Search, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  searchUsers,
  sendFriendRequest,
  type FriendSearchResult,
} from "@/app/events/friends-actions";

function getDisplayName(user: FriendSearchResult) {
  return (
    user.nickname ??
    (user.name_visible ? user.full_name : null) ??
    "이름 미설정"
  );
}

// 친구 검색 및 요청 전송을 담당하는 클라이언트 컴포넌트
export function FriendSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FriendSearchResult[]>([]);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSearching, startSearchTransition] = useTransition();
  const [isSending, startSendTransition] = useTransition();

  function handleSearch() {
    setErrorMessage(null);
    startSearchTransition(async () => {
      const result = await searchUsers(query);
      setResults(result.results);
      setErrorMessage(result.error);
    });
  }

  function handleSendRequest(friendId: string) {
    setErrorMessage(null);
    startSendTransition(async () => {
      const result = await sendFriendRequest(friendId);
      if (result.error) {
        setErrorMessage(result.error);
        return;
      }
      setSentIds((prev) => new Set(prev).add(friendId));
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="이메일 또는 닉네임으로 검색"
            className="pl-9"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSearch();
              }
            }}
          />
        </div>
        <Button onClick={handleSearch} disabled={isSearching}>
          <Search className="h-4 w-4" />
          검색
        </Button>
      </div>

      {errorMessage && (
        <p className="text-xs text-destructive">{errorMessage}</p>
      )}

      {results.length > 0 && (
        <div className="flex flex-col gap-2 rounded-lg border p-2">
          {results.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between gap-2 p-1"
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {getDisplayName(user).slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {getDisplayName(user)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                variant={user.relationship === "none" ? "default" : "secondary"}
                disabled={
                  isSending ||
                  sentIds.has(user.id) ||
                  user.relationship !== "none"
                }
                onClick={() => handleSendRequest(user.id)}
              >
                <UserPlus className="h-4 w-4" />
                {user.relationship === "accepted"
                  ? "친구"
                  : user.relationship === "pending" || sentIds.has(user.id)
                    ? "요청됨"
                    : "친구 추가"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
