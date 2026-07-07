import { redirect } from "next/navigation";

// /admin으로 직접 접근 시(레이아웃의 AdminGuard를 통과한 로그인된 관리자) 대시보드로 이동
export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
