'use client';

import { Sidebar } from './sidebar';
import { Header } from './header';
import { MobileBottomNav } from './mobile-bottom-nav';
import { 
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';
import { usePwaInstall } from '@/hooks/use-pwa-install';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import Image from 'next/image';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { canInstall, isStandalone, promptInstall } = usePwaInstall();
  const [showInstallHint, setShowInstallHint] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('qa-install-hint-seen');
    if (!seen && canInstall && !isStandalone) {
      setShowInstallHint(true);
      localStorage.setItem('qa-install-hint-seen', '1');
    }
  }, [canInstall, isStandalone]);

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

      {/* First-visit Install Hint */}
      <Sheet open={showInstallHint} onOpenChange={setShowInstallHint}>
        <SheetContent side="bottom" className="rounded-t-xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Image src="/icon-192x192.png" alt="App icon" width={24} height={24} />
              Install Quild Academy
            </SheetTitle>
            <SheetDescription>
              Get faster access, offline support, and a better mobile experience.
            </SheetDescription>
          </SheetHeader>
          <div className="p-4 flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowInstallHint(false)}>Maybe later</Button>
            <Button onClick={async () => {
              await promptInstall();
              setShowInstallHint(false);
            }}>Install</Button>
          </div>
          <SheetFooter />
        </SheetContent>
      </Sheet>
    </SidebarProvider>
  );
}
