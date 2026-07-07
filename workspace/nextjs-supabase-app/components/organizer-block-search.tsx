"use client";

import { useState, useTransition } from "react";
import { Search, Ban } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  blockOrganizer,
  searchOrganizers,
  type OrganizerSearchResult,
} from "@/app/events/invite-actions";

function getDisplayName(organizer: OrganizerSearchResult) {
  return (
    organizer.nickname ??
    (organizer.name_visible ? organizer.full_name : null) ??
    "이름 미설정"
  );
}

// 이벤트를 주최한 적 있는 사용자를 닉네임/이메일로 검색해 직접 차단하는 컴포넌트(초대를 받지 않아도 사용 가능)
export function OrganizerBlockSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OrganizerSearchResult[]>([]);
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSearching, startSearchTransition] = useTransition();
  const [isBlocking, startBlockTransition] = useTransition();

  function handleSearch() {
    setErrorMessage(null);
    startSearchTransition(async () => {
      const result = await searchOrganizers(query);
      setResults(result.results);
      setBlockedIds(
        new Set(result.results.filter((r) => r.isBlocked).map((r) => r.id)),
      );
      setErrorMessage(result.error);
    });
  }

  function handleBlock(organizerId: string) {
    setErrorMessage(null);
    startBlockTransition(async () => {
      const result = await blockOrganizer(organizerId);
      if (result.error) {
        setErrorMessage(result.error);
        return;
      }
      setBlockedIds((prev) => new Set(prev).add(organizerId));
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="닉네임 또는 이메일로 주최자 검색"
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
          {results.map((organizer) => {
            const isBlocked = blockedIds.has(organizer.id);
            return (
              <div
                key={organizer.id}
                className="flex items-center justify-between gap-2 p-1"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {getDisplayName(organizer).slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {getDisplayName(organizer)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {organizer.email}
                    </span>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={isBlocking || isBlocked}
                    >
                      <Ban className="h-4 w-4" />
                      {isBlocked ? "차단됨" : "차단"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {getDisplayName(organizer)}님을 차단하시겠습니까?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        차단하면 이 주최자의 이벤트와 향후 초대를 받지 않습니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction
                        disabled={isBlocking}
                        onClick={() => handleBlock(organizer.id)}
                      >
                        차단
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
