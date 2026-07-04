"use client";

import { useActionState } from "react";

import { loginAdmin } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAdmin, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">패스워드</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "로그인 중..." : "로그인"}
      </Button>
    </form>
  );
}
