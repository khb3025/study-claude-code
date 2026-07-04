import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="관리자 대시보드" description="견적서 관리 기능은 추후 단계에서 추가됩니다." />
      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground">준비 중입니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}
