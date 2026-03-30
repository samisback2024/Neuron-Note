import { Sidebar } from "./Sidebar";
import { ContextPanel } from "./ContextPanel";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="h-screen overflow-hidden bg-surface-100 dark:bg-surface-900 md:grid md:grid-cols-[auto_1fr_auto]">
      <Sidebar />
      <main className="min-w-0 overflow-y-auto pb-20 md:pb-0">{children}</main>
      <ContextPanel />
    </div>
  );
}
