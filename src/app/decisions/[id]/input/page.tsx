import React from 'react';
import { Panel } from '@/design/components/Panel';
import { EmptyState } from '@/design/components/EmptyState';
import { getDecision } from '@/lib/data';

export interface InputPageProps {
  params: Promise<{ id: string }>;
}

export default async function InputAssurancePage({ params }: InputPageProps) {
  const { id } = await params;
  const record = await getDecision(id);

  return (
    <Panel
      title="Layer 1: Input Assurance"
      subtitle={record ? `Structural & electrical telemetry validation for ${record.batteryId}` : 'Telemetry validation'}
      className="h-full flex flex-col flex-1"
    >
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-[var(--surface-sunken)] rounded-[var(--r-sm)] border border-dashed border-[var(--rule)] my-2">
        <EmptyState
          title="Input Assurance — Phase 2"
          detail="Layer panel content, telemetry validation checks, and temperature spread chart (C10) will be implemented in Phase 2 Track A."
        />
      </div>
    </Panel>
  );
}
