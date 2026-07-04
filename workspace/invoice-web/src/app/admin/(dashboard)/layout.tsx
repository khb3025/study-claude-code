import { AdminNav } from "@/components/admin/admin-nav";
import { Section } from "@/components/shared/section";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col">
      <Section>
        <div className="flex flex-col gap-6">
          <AdminNav />
          {children}
        </div>
      </Section>
    </main>
  );
}
