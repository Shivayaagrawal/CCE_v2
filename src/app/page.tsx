import React from 'react';
import { AppShell } from '@/features/shell';
import { OverviewDashboard } from '@/features/overview';

export default function HomePage() {
  return (
    <AppShell
      leftContent={
        <div className="flex items-center gap-2">
          <h1 className="text-[16px] font-semibold text-[var(--ink)] tracking-tight">
            Decision Events Dashboard
          </h1>
          <span className="text-[11px] font-mono text-[var(--ink-3)] bg-[var(--surface-sunken)] px-2 py-0.5 rounded border border-[var(--rule)]">
            Fleet Overview
          </span>
        </div>
      }
    >
      <OverviewDashboard />
    </AppShell>
  );
}
