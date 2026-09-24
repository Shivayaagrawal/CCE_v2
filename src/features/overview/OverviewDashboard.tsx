'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Alert, DecisionEvent, EngineAction, EventFilters, FleetAggregates, Outcome } from '@/lib/data/types';
import { getAggregates, getAlerts, getEvents } from '@/lib/data';
import { AS_OF } from '@/lib/data/fixture/config';
import { formatCount, formatDate, formatDateTime, formatPercent, formatShortDateTime } from '@/lib/format';
import { AppShell } from '@/features/shell';
import { FilterBar } from '@/design/components/FilterBar';
import { Panel } from '@/design/components/Panel';
import { DataTable, type Column } from '@/design/components/DataTable';
import { StatusBadge } from '@/design/components/StatusBadge';
import { ProvenanceLine } from '@/design/components/ProvenanceLine';
import { ChartFrame } from '@/design/components/ChartFrame';
import { ChartTooltip } from '@/features/charts/ChartTooltip';
import { engineActionLabel, firstStopSlug, LAYER_ORDER, outcomeLabel } from '@/features/labels';
import { StatusIcon } from '@/design/components/StatusBadge';
import { ACTION_FILL, OUTCOME_FILL, SOH_BIN_FILLS } from '@/features/charts/palette';
import { useChartTableToggle } from '@/features/charts/useChartTableToggle';
import { Entrance, useCountUp, useMotionMs } from '@/features/motion';

const OUTCOMES: Outcome[] = ['ASSURED', 'ASSURED WITH LIMITATIONS', 'REVIEW REQUIRED', 'ESCALATE'];
const ACTIONS: EngineAction[] = [
  'CONTINUE_OPERATION',
  'SCHEDULE_MAINTENANCE',
  'REPLACE_BATTERY',
  'RETIRE_ASSET',
  'ESCALATE_FOR_REVIEW',
];

function share(count: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((count / total) * 1000) / 10;
}

function KpiValue({ value, playKey }: { value: number; playKey: number }) {
  const animated = useCountUp(value, playKey);
  return <>{formatCount(Math.round(animated))}</>;
}

export function OverviewDashboard() {
  const router = useRouter();
  const [filters, setFilters] = useState<EventFilters>({ page: 1, pageSize: 8 });
  const [aggregates, setAggregates] = useState<FleetAggregates | null>(null);
  const [prior, setPrior] = useState<FleetAggregates | null>(null);
  const [events, setEvents] = useState<{ rows: DecisionEvent[]; total: number; page: number; pageSize: number } | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [banner, setBanner] = useState(true);
  const [asOf, setAsOf] = useState(AS_OF);
  const [playKey, setPlayKey] = useState(0);
  const duration = useMotionMs(320);
  const c1 = useChartTableToggle();
  const c2 = useChartTableToggle();
  const c3 = useChartTableToggle();
  const c4 = useChartTableToggle();

  useEffect(() => {
    let cancelled = false;
    const query = { ...filters, page: filters.page ?? 1, pageSize: filters.pageSize ?? 8 };
    Promise.all([getAggregates(query), getEvents(query), getAlerts()]).then(([nextAggregates, nextEvents, nextAlerts]) => {
      if (cancelled) return;
      setAggregates(nextAggregates);
      setEvents(nextEvents);
      setAlerts(nextAlerts);
    });
    return () => {
      cancelled = true;
    };
  }, [filters]);

  useEffect(() => {
    let cancelled = false;
    const end = filters.from ? new Date(filters.from) : new Date(AS_OF);
    const startBound = filters.to && filters.from ? new Date(filters.from).getTime() : end.getTime() - 13 * 24 * 60 * 60 * 1000;
    const span = (filters.to ? new Date(filters.to).getTime() : new Date(AS_OF).getTime()) - startBound;
    const priorTo = new Date(startBound - 1).toISOString();
    const priorFrom = new Date(startBound - span).toISOString();
    getAggregates({ ...filters, from: priorFrom, to: priorTo, page: undefined, pageSize: undefined }).then((value) => {
      if (!cancelled) setPrior(value);
    });
    return () => {
      cancelled = true;
    };
  }, [filters]);

  const outcomeSlices = useMemo(() => {
    if (!aggregates) return [];
    return OUTCOMES.map((outcome) => ({
      key: outcome,
      name: outcomeLabel(outcome),
      count: aggregates.byOutcome[outcome],
      share: share(aggregates.byOutcome[outcome], aggregates.totalEvents),
      fill: OUTCOME_FILL[outcome],
    }));
  }, [aggregates]);

  const actionSlices = useMemo(() => {
    if (!aggregates) return [];
    return ACTIONS.map((action) => ({
      key: action,
      name: engineActionLabel(action),
      count: aggregates.byAction[action],
      share: share(aggregates.byAction[action], aggregates.totalEvents),
      fill: ACTION_FILL[action],
    }));
  }, [aggregates]);

  function delta(current: number, previous: number | undefined) {
    if (previous == null || prior?.totalEvents === 0) return undefined;
    const diff = current - previous;
    return { value: formatCount(Math.abs(diff)), direction: diff > 0 ? 'up' as const : diff < 0 ? 'down' as const : 'neutral' as const, label: 'vs prior window' };
  }

  async function exportCsv() {
    const all = await getEvents({ ...filters, page: 1, pageSize: Math.max(events?.total ?? 1, 1) });
    const header = ['id', 'timestampUtc', 'batteryId', 'vehicleId', 'vehicleType', 'manufacturer', 'sohPct', 'engineAction', 'outcome'];
    const lines = all.rows.map((row) =>
      [row.id, row.timestampUtc, row.batteryId, row.vehicleId, row.vehicleType, row.manufacturer, row.sohPct, row.engineAction, row.outcome].join(',')
    );
    const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `decision-events-${AS_OF.slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const columns: Column<DecisionEvent>[] = [
    {
      key: 'id',
      label: 'Decision ID',
      width: '16%',
      render: (row) => <span className="font-mono text-[12px] text-[var(--primary)]">{row.id}</span>,
    },
    { key: 'batteryId', label: 'Battery ID', width: '15%', render: (row) => <span className="font-mono text-[12px]">{row.batteryId}</span> },
    { key: 'vehicleId', label: 'Vehicle ID', width: '13%', render: (row) => <span className="font-mono text-[12px]">{row.vehicleId}</span> },
    { key: 'sohPct', label: 'SoH', width: '8%', sortable: true, align: 'right', render: (row) => formatPercent(row.sohPct) },
    { key: 'engineAction', label: 'Engine action', width: '16%', render: (row) => engineActionLabel(row.engineAction) },
    {
      key: 'outcome',
      label: 'Assurance outcome',
      width: '18%',
      sortable: true,
      render: (row) => (
        <OutcomeLink
          outcome={row.outcome}
          enabled={row.hasFullRecord}
          onOpen={() => router.push(`/decisions/${row.id}/${firstStopSlug(row.layerResults)}`)}
        />
      ),
    },
    { key: 'timestampUtc', label: 'Timestamp', width: '16%', sortable: true, render: (row) => formatShortDateTime(row.timestampUtc) },
  ];

  return (
    <AppShell
      asOfDate={formatDateTime(asOf)}
      executionLabel={
        aggregates && aggregates.byOutcome.ESCALATE > 0
          ? `Auto on · ${formatCount(aggregates.byOutcome.ESCALATE)} held for review`
          : 'Auto Execution ON'
      }
      onRefresh={() => {
        setAsOf(new Date().toISOString());
        setPlayKey((key) => key + 1);
      }}
    >
      <div className="flex flex-col gap-3">
        {banner && (
          <Entrance index={0}>
            <div className="relative">
              <ProvenanceLine provenance="demonstration" />
              <button type="button" className="absolute top-2 right-2 text-[11px] font-semibold text-[var(--ink-3)]" onClick={() => setBanner(false)}>
                Dismiss
              </button>
            </div>
          </Entrance>
        )}
        <Entrance index={1}>
          <FilterBar filters={filters} asOf={AS_OF} totalFiltered={events?.total} onChange={(next) => setFilters({ ...next, page: 1, pageSize: 8 })} onExport={exportCsv} />
        </Entrance>
        {aggregates && (
          <section className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3 rounded-[var(--r-md)] border border-[var(--escalate-border)] bg-[var(--surface)] px-3 py-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--escalate-bg)] text-[var(--escalate)]" aria-hidden>
                <ReviewIcon />
              </span>
              <div className="min-w-0">
                <h2 className="text-[13px] font-semibold text-[var(--ink)]">Needs a human</h2>
                <p className="text-[12px] text-[var(--ink-2)]">
                  <span className="font-semibold tabular text-[var(--escalate-ink)]">{formatCount(aggregates.byOutcome.ESCALATE)}</span> escalate
                  <span className="mx-1.5 text-[var(--rule-strong)]">/</span>
                  <span className="font-semibold tabular text-[var(--review-ink)]">{formatCount(aggregates.byOutcome['REVIEW REQUIRED'])}</span> review
                </p>
              </div>
              <button
                type="button"
                className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[var(--escalate-bg)] text-[var(--escalate-ink)] text-[12px] font-semibold border border-[var(--escalate-border)]"
                onClick={() => setFilters((current) => ({ ...current, outcomes: ['ESCALATE', 'REVIEW REQUIRED'], page: 1 }))}
              >
                <SearchIcon />
                Show held cases
              </button>
            </div>
            <p className="text-[13px] text-[var(--ink-2)]">
              <span className="font-semibold text-[var(--assured-ink)]">{formatCount(aggregates.byOutcome.ASSURED)} assured</span>
              <span className="mx-2 text-[var(--rule-strong)]">/</span>
              <span className="font-semibold text-[#7A5600]">{formatCount(aggregates.byOutcome['ASSURED WITH LIMITATIONS'])} with limitations</span>
              <span className="mx-2 text-[var(--rule-strong)]">/</span>
              <span className="font-semibold text-[var(--ink)]">{formatCount(aggregates.totalEvents)} events</span>
              {prior ? <span className="text-[var(--ink-3)]"> · prior window {formatCount(prior.totalEvents)}</span> : null}
            </p>
            <AssurancePipeline rates={aggregates.layerClearRate} />
          </section>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 items-stretch" key={playKey}>
          <ChartFrame className="min-w-0 h-full overflow-hidden" title="Assurance result distribution" tableView={c1.tableView} onToggleTable={c1.onToggleTable} tableContent={<SliceTable rows={outcomeSlices} />}>
            <Donut data={outcomeSlices} total={aggregates?.totalEvents ?? 0} duration={duration} onPick={(key) => setFilters((current) => ({ ...current, outcomes: current.outcomes?.[0] === key ? undefined : [key as Outcome], page: 1 }))} />
          </ChartFrame>
          <ChartFrame className="min-w-0 h-full overflow-hidden" title="SoH distribution" tableView={c2.tableView} onToggleTable={c2.onToggleTable} tableContent={<SliceTable rows={(aggregates?.sohDistribution ?? []).map((bin) => ({ name: bin.bin, count: bin.count, share: bin.pct }))} />}>
            <div className="h-[220px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aggregates?.sohDistribution ?? []} margin={{ top: 16, right: 8, left: 0, bottom: 28 }}>
                  <CartesianGrid stroke="var(--grid)" vertical={false} />
                  <XAxis dataKey="bin" tick={{ fontSize: 10, fill: '#5F6C7E' }} interval={0} tickLine={false} tickFormatter={shortSohBin} />
                  <YAxis tick={{ fontSize: 10, fill: '#5F6C7E' }} width={28} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} wrapperStyle={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} isAnimationActive={duration > 0} animationDuration={duration} onClick={(bar) => {
                    const label = String((bar as { bin?: string }).bin ?? '');
                    const status = label.includes('Excellent') ? 'EXCELLENT' : label.includes('Good') ? 'GOOD' : label.includes('Noticeable') ? 'FAIR' : label.includes('Significantly') ? 'REPLACEMENT REVIEW' : 'CRITICAL';
                    setFilters((current) => ({ ...current, sohStatuses: current.sohStatuses?.[0] === status ? undefined : [status], page: 1 }));
                  }}>
                    {(aggregates?.sohDistribution ?? []).map((bin, index) => (
                      <Cell key={bin.bin} fill={SOH_BIN_FILLS[index] ?? '#2A78D6'} />
                    ))}
                    <LabelList dataKey="count" position="top" style={{ fontSize: 10, fill: '#0F1B2D' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartFrame>
          <ChartFrame className="min-w-0 h-full overflow-hidden" title="SoH trend" subtitle="Fleet mean" tableView={c3.tableView} onToggleTable={c3.onToggleTable} tableContent={<SliceTable rows={(aggregates?.sohTrend ?? []).map((point) => ({ name: point.date, count: point.meanSohPct, share: point.meanSohPct }))} />}>
            <div className="h-[220px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={aggregates?.sohTrend ?? []} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--grid)" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(value) => formatDate(String(value)).slice(0, 6)} tick={{ fontSize: 10, fill: '#5F6C7E' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#5F6C7E' }} width={32} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} wrapperStyle={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }} />
                  <Line type="monotone" dataKey="meanSohPct" name="Mean SoH" stroke="#1D4ED8" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={duration > 0} animationDuration={duration} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartFrame>
          <ChartFrame className="min-w-0 h-full overflow-hidden" title="Decision distribution" tableView={c4.tableView} onToggleTable={c4.onToggleTable} tableContent={<SliceTable rows={actionSlices} />}>
            <Donut data={actionSlices} total={aggregates?.totalEvents ?? 0} duration={duration} onPick={(key) => setFilters((current) => ({ ...current, engineActions: current.engineActions?.[0] === key ? undefined : [key as EngineAction], page: 1 }))} />
          </ChartFrame>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <Panel title="Recent decision events" className="min-w-0">
            <DataTable
              fixedLayout
              columns={columns}
              rows={events?.rows ?? []}
              total={events?.total}
              page={events?.page ?? 1}
              pageSize={8}
              onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
              onRowClick={(row) => {
                if (row.hasFullRecord) router.push(`/decisions/${row.id}/${firstStopSlug(row.layerResults)}`);
              }}
            />
          </Panel>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <div className="min-w-0">
            <Panel title="Alerts" dense>
              <ul className="flex flex-col gap-2">
                {alerts.map((alert) => (
                  <li key={alert.id} className="flex gap-2 text-[12px]">
                    <StatusBadge
                      size="sm"
                      result={alert.severity === 'critical' ? 'breach' : alert.severity === 'warning' ? 'review' : 'clear'}
                    />
                    <div>
                      <div className="font-semibold text-[var(--ink)]">{alert.title}</div>
                      <div className="text-[var(--ink-2)]">{alert.detail}</div>
                      <div className="text-[var(--ink-3)]">{formatDateTime(alert.timestampUtc)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function SliceTable({ rows }: { rows: { name: string; count: number; share: number }[] }) {
  return (
    <table className="w-full text-[12px]">
      <thead>
        <tr className="text-[10px] uppercase tracking-[0.06em] text-[var(--ink-3)]">
          <th className="text-left">Label</th>
          <th className="text-right">Count</th>
          <th className="text-right">Share</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.name} className="border-t border-[var(--rule)]">
            <td>{row.name}</td>
            <td className="text-right tabular">{formatCount(row.count)}</td>
            <td className="text-right tabular">{formatPercent(row.share)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const OUTCOME_CHIP: Record<Outcome, string> = {
  ASSURED: 'bg-[#D9FFE8] text-[#085C32] border-[#12C46A]',
  'ASSURED WITH LIMITATIONS': 'bg-[#FFF4C2] text-[#7A5600] border-[#F5C400]',
  'REVIEW REQUIRED': 'bg-[#FFE4CC] text-[#9A3400] border-[#FF6A00]',
  ESCALATE: 'bg-[#FFD6D6] text-[#9F0010] border-[#FF1F1F]',
};

const OUTCOME_LINES: Record<Outcome, [string, string]> = {
  ASSURED: ['Assured', ''],
  'ASSURED WITH LIMITATIONS': ['Assured', 'with limitations'],
  'REVIEW REQUIRED': ['Review', 'required'],
  ESCALATE: ['Escalate', ''],
};

function OutcomeLink({
  outcome,
  enabled,
  onOpen,
}: {
  outcome: Outcome;
  enabled: boolean;
  onOpen: () => void;
}) {
  const [primary, secondary] = OUTCOME_LINES[outcome];
  const className = `inline-flex w-full max-w-[148px] items-center gap-1.5 rounded-md border px-1.5 py-1 text-[12px] font-semibold leading-[14px] text-left ${OUTCOME_CHIP[outcome]}`;
  const body = (
    <>
      <StatusIcon status={outcome} className="w-3.5 h-3.5 shrink-0" />
      <span>
        <span className="block whitespace-nowrap">{primary}</span>
        {secondary ? <span className="block whitespace-nowrap">{secondary}</span> : null}
      </span>
    </>
  );
  if (!enabled) {
    return <span className={`${className} opacity-80`}>{body}</span>;
  }
  return (
    <button type="button" className={className} onClick={(event) => { event.stopPropagation(); onOpen(); }}>
      {body}
    </button>
  );
}

function ReviewIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="6" cy="6" r="3.25" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8.4 8.4L12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M6 4.7V6.4L7.1 7.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10.2 10.2L13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function LayerGlyph({ name }: { name: string }) {
  const common = { className: 'w-3.5 h-3.5', viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true as const };
  if (name === 'input') {
    return (
      <svg {...common}>
        <path d="M3 4.5h10M3 8h10M3 11.5h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === 'model') {
    return (
      <svg {...common}>
        <rect x="2.5" y="3" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M6 13.5h4M8 11v2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === 'policy') {
    return (
      <svg {...common}>
        <path d="M8 2.5l4.5 1.6v3.6c0 2.7-1.8 4.6-4.5 5.8-2.7-1.2-4.5-3.1-4.5-5.8V4.1L8 2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === 'decision') {
    return (
      <svg {...common}>
        <path d="M8 2.4l5.2 5.2L8 12.8 2.8 7.6 8 2.4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M4 2.5h5.5L12.5 5.5V13.5h-8.5V2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M9.2 2.7V5.6H12.2M5.5 8h5M5.5 10.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function AssurancePipeline({ rates }: { rates: FleetAggregates['layerClearRate'] }) {
  const weakest = LAYER_ORDER.reduce((low, layer) => (rates[layer.key] < rates[low.key] ? layer : low), LAYER_ORDER[0]);
  return (
    <div className="rounded-[var(--r-md)] border border-[var(--rule)] bg-[var(--surface)] px-3 py-3">
      <h2 className="text-[13px] font-semibold text-[var(--ink)] mb-3">Assurance pipeline</h2>
      <ol className="flex items-start overflow-x-auto">
        {LAYER_ORDER.map((layer, index) => {
          const rate = rates[layer.key];
          const hot = layer.key === weakest.key && rate < 1;
          return (
            <li key={layer.key} className="relative flex min-w-[92px] flex-1 flex-col items-center text-center px-1">
              {index > 0 && (
                <span aria-hidden className="absolute right-1/2 top-[15px] h-[2px] w-full bg-[#1D4ED8]" />
              )}
              <span
                className={`relative z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border ${
                  hot
                    ? 'bg-[var(--escalate-bg)] text-[var(--escalate)] border-[var(--escalate-border)]'
                    : 'bg-[var(--surface)] text-[#1D4ED8] border-[#1D4ED8]'
                }`}
              >
                <LayerGlyph name={layer.key} />
              </span>
              <span className="mt-1.5 text-[12px] font-medium text-[var(--ink)]">{layer.name.replace(' Assurance', '')}</span>
              <span className={`text-[12px] tabular font-semibold ${hot ? 'text-[var(--escalate-ink)]' : 'text-[var(--ink-2)]'}`}>
                {formatPercent(rate * 100)} clear
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function shortSohBin(label: string): string {
  if (label.includes('Excellent')) return '≥90';
  if (label.includes('Good')) return '80–90';
  if (label.includes('Noticeable')) return '70–80';
  if (label.includes('Significantly')) return '60–70';
  return '<60';
}

function Donut({
  data,
  total,
  duration,
  onPick,
}: {
  data: { key: string; name: string; count: number; share: number; fill: string }[];
  total: number;
  duration: number;
  onPick: (key: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 min-w-0">
      <div className="h-[148px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="name" innerRadius={40} outerRadius={58} paddingAngle={2} isAnimationActive={duration > 0} animationDuration={duration} onClick={(slice) => onPick(String((slice as { key?: string }).key ?? ''))}>
              {data.map((slice) => (
                <Cell key={slice.key} fill={slice.fill} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} wrapperStyle={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[16px] font-semibold tabular">{formatCount(total)}</div>
      </div>
      <ul className="flex flex-col gap-1 text-[11px] leading-[14px]">
        {data.map((slice) => (
          <li key={slice.key} className="flex items-center justify-between gap-2 min-w-0">
            <span className="flex items-center gap-1.5 min-w-0">
              <i className="w-2 h-2 rounded-sm shrink-0" style={{ background: slice.fill }} />
              <span className="truncate">{slice.name}</span>
            </span>
            <span className="tabular shrink-0">{formatPercent(slice.share)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
