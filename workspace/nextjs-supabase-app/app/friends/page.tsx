"use client";

import { Search, UserPlus } from "lucide-react";
import { BackToEventsLink } from "@/components/back-to-events-link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CURRENT_USER_ID,
  DUMMY_FRIENDSHIPS,
  DUMMY_USERS,
} from "@/app/events/dummy-data";

// 친구 목록/친구 요청 페이지: 수락된 친구와 대기중인 요청을 구분해 보여준다
export default function FriendsPage() {
  const myFriendships = DUMMY_FRIENDSHIPS.filter(
    (friendship) => friendship.user_id === CURRENT_USER_ID,
  );
  const acceptedFriends = myFriendships.filter(
    (friendship) => friendship.status === "accepted",
  );
  const pendingRequests = myFriendships.filter(
    (friendship) => friendship.status === "pending",
  );

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <div className="flex items-center gap-3">
        <BackToEventsLink />
        <h1 className="text-2xl font-bold">친구</h1>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="이메일 또는 닉네임으로 검색" className="pl-9" />
        </div>
        <Button onClick={() => {}}>
          {/* TODO: 친구 추가 요청 로직 구현 필요 */}
          <UserPlus className="h-4 w-4" />
          친구 추가
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">받은 친구 요청</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {pendingRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              대기중인 친구 요청이 없습니다.
            </p>
          ) : (
            pendingRequests.map((request) => {
              const friend = DUMMY_USERS[request.friend_id];
              return (
                <div
                  key={request.id}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{friend?.initial ?? "?"}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {friend?.name ?? request.friend_id}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {friend?.email}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => {}}>
                      {/* TODO: 친구 요청 수락 로직 구현 필요 */}
                      수락
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {}}>
                      {/* TODO: 친구 요청 거절 로직 구현 필요 */}
                      거절
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">친구 목록</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {acceptedFriends.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              아직 친구가 없습니다.
            </p>
          ) : (
            acceptedFriends.map((friendship) => {
              const friend = DUMMY_USERS[friendship.friend_id];
              return (
                <div
                  key={friendship.id}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{friend?.initial ?? "?"}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {friend?.name ?? friendship.friend_id}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {friend?.email}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary">친구</Badge>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
