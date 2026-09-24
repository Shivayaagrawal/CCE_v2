'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { DecisionRecord, LayerKey } from '@/lib/data/types';
import { getDecision } from '@/lib/data';
import { AS_OF } from '@/lib/data/fixture/config';
import { formatDateTime } from '@/lib/format';
import { AppShell } from '@/features/shell';
import { Breadcrumb } from '@/design/components/Breadcrumb';
import { EmptyState } from '@/design/components/EmptyState';
import { LAYER_ORDER, firstStopSlug, layerHref } from '@/features/labels';
import { DecisionHeader } from './DecisionHeader';
import { PipelineRail } from './PipelineRail';
import Link from 'next/link';
import { HistoricalEventsTable } from '@/features/history/HistoricalEventsTable';
import { SohTrendChart } from '@/features/history/SohTrendChart';

const RecordContext = createContext<DecisionRecord | null>(null);

export function useDecisionRecord(): DecisionRecord {
  const record = useContext(RecordContext);
  if (!record) throw new Error('Decision record is not available');
  return record;
}

function heldLabel(record: DecisionRecord): string {
  const results = Object.fromEntries(LAYER_ORDER.map((layer) => [layer.key, record.layers[layer.key].result]));
  const slug = firstStopSlug(results);
  const stop = LAYER_ORDER.find((layer) => layer.slug === slug);
  const stopName = stop && slug !== 'input' ? stop.name.replace(' Assurance', '') : null;
  if (record.outcome === 'ESCALATE') {
    return record.escalation.assignedTo ? `Held · ${record.escalation.assignedTo}` : 'Held for review';
  }
  if (record.outcome === 'ASSURED WITH LIMITATIONS') return `Assured with limitations${stopName ? ` · ${stopName}` : ''}`;
  if (record.outcome === 'REVIEW REQUIRED') return `Review required${stopName ? ` · ${stopName}` : ''}`;
  return 'Auto Execution ON';
}

function activeLayer(pathname: string): LayerKey {
  const match = LAYER_ORDER.find((layer) => pathname.endsWith(`/${layer.slug}`));
  return match?.key ?? 'input';
}

export function DecisionChrome({ id, children }: { id: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [record, setRecord] = useState<DecisionRecord | null | undefined>(undefined);
  const [asOf, setAsOf] = useState(AS_OF);
  const [playKey, setPlayKey] = useState(0);
  const layer = activeLayer(pathname);

  useEffect(() => {
    let cancelled = false;
    setRecord(undefined);
    getDecision(id).then((next) => {
      if (!cancelled) setRecord(next);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) return;
      if (event.key === 'Escape') {
        (document.activeElement as HTMLElement | null)?.blur();
        return;
      }
      const index = LAYER_ORDER.findIndex((item) => item.key === layer);
      if (event.key >= '1' && event.key <= '5') {
        const next = LAYER_ORDER[Number(event.key) - 1];
        if (next) router.push(layerHref(id, next.slug));
      } else if (event.key === 'ArrowRight' && index >= 0 && index < LAYER_ORDER.length - 1) {
        router.push(layerHref(id, LAYER_ORDER[index + 1]!.slug));
      } else if (event.key === 'ArrowLeft' && index > 0) {
        router.push(layerHref(id, LAYER_ORDER[index - 1]!.slug));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [id, layer, router]);

  const left = record ? (
    <Breadcrumb
      items={[
        { label: 'Decision events', href: '/' },
        { label: record.id },
        { label: LAYER_ORDER.find((item) => item.key === layer)?.name ?? 'Input Assurance' },
      ]}
    />
  ) : (
    <span className="text-[15px] font-semibold">Decision record</span>
  );

  return (
    <AppShell
      leftContent={left}
      asOfDate={formatDateTime(asOf)}
      executionLabel={record ? heldLabel(record) : 'Auto Execution ON'}
      onRefresh={() => {
        setAsOf(new Date().toISOString());
        setPlayKey((k) => k + 1);
      }}
    >
      {record === undefined && <p className="text-[13px] text-[var(--ink-3)]">Loading decision record…</p>}
      {record === null && (
        <EmptyState
          title="Record not retained"
          detail="Detailed assurance record not retained for this event."
        />
      )}
      {record && (
        <RecordContext.Provider value={record}>
          <div className="flex flex-col gap-3 min-h-0">
            <DecisionHeader record={record} />
            <PipelineRail record={record} active={layer} />
            <div key={`${layer}-${playKey}`} className="min-w-0 layer-enter">
              {children}
            </div>
            {layer === 'decision' ? (
              <div className="grid grid-cols-12 gap-3 h-[236px]">
                <div className="col-span-12 xl:col-span-7 min-h-0">
                  <HistoricalEventsTable vehicleId={record.vehicleId} currentId={record.id} />
                </div>
                <div className="col-span-12 xl:col-span-5 min-h-0">
                  <SohTrendChart vehicleId={record.vehicleId} outcome={record.outcome} playKey={playKey} />
                </div>
              </div>
            ) : (
              <Link href={layerHref(record.id, 'decision')} className="text-[13px] font-semibold text-[var(--primary)]">
                Historical events for this vehicle
              </Link>
            )}
          </div>
        </RecordContext.Provider>
      )}
    </AppShell>
  );
}
