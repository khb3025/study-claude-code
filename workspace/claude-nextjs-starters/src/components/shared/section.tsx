import { cn } from "@/lib/utils";

type SectionProps = {
  id?: string;
  className?: string;
  children: React.ReactNode;
};

// 섹션 간격 통일 래퍼 (py-16 md:py-24)
export function Section({ id, className, children }: SectionProps) {
  return (
    <section id={id} className={cn("px-4 py-16 md:py-24", className)}>
      <div className="container mx-auto">{children}</div>
    </section>
  );
}
