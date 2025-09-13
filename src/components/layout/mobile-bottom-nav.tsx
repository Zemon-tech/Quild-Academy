'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Trophy, 
  Calendar, 
  User, 
  Settings
} from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { name: 'Schedule', href: '/schedule', icon: Calendar },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-700 md:hidden">
      <div className="flex items-center justify-around px-2 py-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          
          return (
            <Link key={item.name} href={item.href} className="flex-1">
              <div className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors",
                isActive 
                  ? "bg-purple-100 dark:bg-purple-900/30" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              )}>
                <item.icon 
                  className={cn(
                    "h-5 w-5 mb-1",
                    isActive 
                      ? "text-purple-600 dark:text-purple-400" 
                      : "text-gray-500 dark:text-gray-400"
                  )} 
                />
                <span className={cn(
                  "text-xs font-medium",
                  isActive 
                    ? "text-purple-600 dark:text-purple-400" 
                    : "text-gray-500 dark:text-gray-400"
                )}>
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
