import Link from "next/link";

import { logoutAdmin } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export function AdminNav() {
  return (
    <nav className="flex items-center justify-between border-b py-4">
      <div className="flex items-center gap-6">
        <Link href="/admin" className="text-lg font-semibold tracking-tight">
          관리자
        </Link>
        <Link href="/admin/invoices" className="text-sm text-muted-foreground hover:text-foreground">
          견적서 목록
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <form action={logoutAdmin}>
          <Button type="submit" variant="outline" size="sm">
            로그아웃
          </Button>
        </form>
      </div>
    </nav>
  );
}
