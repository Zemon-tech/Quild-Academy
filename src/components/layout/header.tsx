'use client';

import { UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Bell, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white dark:bg-gray-900 px-4 md:px-6 w-full">
      <div className="flex items-center space-x-4 flex-1">
        {/* Mobile: Show logo only, Desktop: Show sidebar trigger and search */}
        <div className="flex items-center space-x-3 md:hidden">
          <Link href="/">
            <Image src="/Subject.svg" alt="Quild Academy" width={24} height={24} priority />
          </Link>
          <span className="text-lg font-bold text-gray-900 dark:text-white">Quild Academy</span>
        </div>
        
        <SidebarTrigger className="hidden md:flex" />
        
        {/* Search bar - Desktop only */}
        <div className="relative hidden md:block flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            className="h-10 w-full rounded-md border border-gray-300 bg-gray-50 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="hidden md:flex">
          <Bell className="h-5 w-5" />
        </Button>
        <UserButton 
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-8 w-8"
            }
          }}
        />
      </div>
    </header>
  );
}
