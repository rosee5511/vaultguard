'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/helpers';
import {
  LayoutDashboard,
  Shield,
  KeyRound,
  Lock,
  Settings,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/vault', label: 'Vault', icon: Shield },
  { href: '/generator', label: 'Gen', icon: KeyRound },
  { href: '/security', label: 'Security', icon: Lock },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-dark-surface/90 backdrop-blur-xl border-t border-gray-200 dark:border-dark-border safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200',
                isActive
                  ? 'text-vault-600 dark:text-vault-400'
                  : 'text-gray-400 dark:text-gray-500'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'scale-110')} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-vault-500" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}