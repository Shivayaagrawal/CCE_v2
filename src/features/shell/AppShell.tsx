'use client';

import React from 'react';
import { Rail } from './Rail';
import { Topbar } from './Topbar';

export interface AppShellProps {
  leftContent?: React.ReactNode;
  asOfDate?: string;
  onRefresh?: () => void;
  children: React.ReactNode;
}

export function AppShell({
  leftContent,
  asOfDate,
  onRefresh,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen flex bg-[var(--canvas)] text-[var(--ink)]">
      {/* Navigation Rail */}
      <Rail />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar leftContent={leftContent} asOfDate={asOfDate} onRefresh={onRefresh} />
        <main className="flex-1 p-4 flex flex-col gap-3 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
