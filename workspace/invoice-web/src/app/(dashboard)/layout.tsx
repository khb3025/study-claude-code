import { Sidebar } from "@/components/layout/sidebar";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        {/* 대시보드 상단 바 */}
        <header className="flex h-16 items-center justify-end border-b border-border px-6">
          <ThemeToggle />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
