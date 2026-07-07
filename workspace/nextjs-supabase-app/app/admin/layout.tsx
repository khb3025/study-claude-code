import { Suspense } from "react";
import { AdminGuard } from "@/app/admin/admin-guard";

// 관리자 페이지 공통 레이아웃: admin_users에 등록된 사용자만 접근 가능(미등록자는 404)
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <AdminGuard>{children}</AdminGuard>
    </Suspense>
  );
}
