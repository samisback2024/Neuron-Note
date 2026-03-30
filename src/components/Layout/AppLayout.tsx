import { Sidebar } from "./Sidebar";
import { ContextPanel } from "./ContextPanel";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-surface-100 dark:bg-surface-900 overflow-hidden">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>
      <ContextPanel />
    </div>
  );
}
