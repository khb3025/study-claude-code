import { LoginForm } from "@/components/admin/login-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminLoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>관리자 로그인</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
