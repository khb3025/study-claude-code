import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { EventsBottomNav } from "@/components/events-bottom-nav";
import { EventsTopNav } from "@/components/events-top-nav";
import { NewEventFab } from "@/components/new-event-fab";
import { hasEnvVars } from "@/lib/utils";
import { Suspense } from "react";

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="flex w-full flex-1 flex-col items-center gap-8">
        <EventsTopNav
          authSlot={
            !hasEnvVars ? (
              <EnvVarWarning />
            ) : (
              <Suspense>
                <AuthButton />
              </Suspense>
            )
          }
        />
        <div className="flex w-full max-w-5xl flex-1 flex-col gap-8 p-5 pb-24 md:pb-8">
          {children}
        </div>
      </div>
      <EventsBottomNav />
      <NewEventFab />
    </main>
  );
}
