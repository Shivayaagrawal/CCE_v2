import React from 'react';
import { notFound } from 'next/navigation';
import { AppShell } from '@/features/shell';
import { Breadcrumb } from '@/design/components/Breadcrumb';
import { EmptyState } from '@/design/components/EmptyState';
import { Panel } from '@/design/components/Panel';
import { DecisionHeader } from '@/features/decision/DecisionHeader';
import { PipelineRail } from '@/features/decision/PipelineRail';
import { getDecision } from '@/lib/data';

export interface DecisionLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function DecisionLayout({
  children,
  params,
}: DecisionLayoutProps) {
  const { id } = await params;
  const record = await getDecision(id);

  if (!record) {
    return (
      <AppShell
        leftContent={
          <Breadcrumb
            items={[
              { label: 'Decision Events', href: '/' },
              { label: id },
            ]}
          />
        }
      >
        <div className="p-8">
          <EmptyState
            title="Decision Record Not Found"
            detail={`No record found matching identifier ${id}. Please select a valid case from the Decision Events list.`}
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      leftContent={
        <Breadcrumb
          items={[
            { label: 'Decision Events', href: '/' },
            { label: record.id, href: `/decisions/${record.id}/input` },
            { label: 'Input Assurance' },
          ]}
        />
      }
    >
      <div className="flex flex-col gap-3 -m-4 sm:-m-6 min-h-screen bg-[var(--canvas)]">
        {/* Sticky 78px Decision Header Strip (12 cols) */}
        <DecisionHeader record={record} />

        <div className="px-4 sm:px-6 pb-6 flex flex-col gap-3 flex-1">
          {/* Main 12-col Grid: Pipeline Rail (3 cols) + Layer Panel (9 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch min-h-[420px]">
            {/* Pipeline Rail (3 cols) */}
            <div className="lg:col-span-3 h-full">
              <PipelineRail record={record} />
            </div>

            {/* Layer Panel (9 cols) */}
            <main className="lg:col-span-9 h-full flex flex-col">
              {children}
            </main>
          </div>

          {/* Bottom Row (Shared across all detail screens): Historical Events Table (7 cols) + C6 Trend (5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Historical Events Table (7 cols, 236px) */}
            <div className="lg:col-span-7 h-[236px]">
              <Panel title="Vehicle Historical Decision Events" className="h-full flex flex-col">
                <EmptyState
                  title="Historical Events Table (Track B)"
                  detail="HistoricalEventsTable component is currently being built in Phase 1 Track B."
                  className="h-full justify-center"
                />
              </Panel>
            </div>

            {/* SoH Trend C6 (5 cols, 236px) */}
            <div className="lg:col-span-5 h-[236px]">
              <Panel title="SoH Trend — Last 6 Decisions (C6)" className="h-full flex flex-col">
                <EmptyState
                  title="SoH Trend C6 (Track B)"
                  detail="C6 Line Chart component is currently being built in Phase 1 Track B."
                  className="h-full justify-center"
                />
              </Panel>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
