'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Header } from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        <Header />
        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6 overflow-auto">
          {children}
        </main>
        <MobileNav />
      </div>
    </div>
  );
}