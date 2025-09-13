'use client';

import { Sidebar } from './sidebar';
import { Header } from './header';
import { MobileBottomNav } from './mobile-bottom-nav';
import { 
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-100 dark:bg-gray-900">
        <Sidebar />
        <SidebarInset className="flex flex-1 flex-col overflow-hidden w-full">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6 w-full">
            <div className="w-full max-w-none">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
      <MobileBottomNav />
    </SidebarProvider>
  );
}
