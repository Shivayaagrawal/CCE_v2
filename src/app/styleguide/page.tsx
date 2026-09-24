'use client';

import React, { useState } from 'react';
import { AppShell } from '@/features/shell';
import {
  StatusBadge,
  OutcomeCard,
  Panel,
  Tabs,
  MetricTile,
  KeyValue,
  Tooltip,
  CheckRow,
  EmptyState,
  Breadcrumb,
  DisabledNavItem,
  ChartFrame,
  DataTable,
  TelemetryTable,
  ProvenanceLine,
  FilterBar,
} from '@/design/components';
import { Check, TelemetryRow, EventFilters, Outcome, LayerResult } from '@/lib/data/types';

export default function StyleguidePage() {
  const [activeTab, setActiveTab] = useState('tokens');
  const [chartTableView, setChartTableView] = useState(false);
  const [filters, setFilters] = useState<EventFilters>({
    outcomes: ['ASSURED'],
    vehicleTypes: ['Last Mile Delivery'],
    query: 'BAT-CU-14S',
  });

  const sampleChecks: Check[] = [
    {
      id: 'SOH-RANGE-01',
      label: 'Output Range Validation',
      evaluates: 'SoH output within 0.0–100.0%',
      result: 'clear',
      finding: null,
    },
    {
      id: 'MOD-VER-01',
      label: 'Model Identity & Version Gate',
      evaluates: 'Incoming model version equals configured production release',
      result: 'limitation',
      finding: 'Model version DLL:V1 does not match production DLL:V2',
    },
    {
      id: 'EXP-FAITH-02',
      label: 'Output Faithfulness',
      evaluates: 'The explanation accurately states the SoH percentage and status',
      result: 'review',
      finding: 'Explanation does not surface model version mismatch',
    },
    {
      id: 'AIS-038-IMB',
      label: 'Cell Imbalance Standard',
      evaluates: 'σ of the 14 cell voltages ≤ 0.050 V (50 mV)',
      result: 'breach',
      finding: 'Cell imbalance 64.97 mV exceeds policy threshold 50.0 mV',
    },
    {
      id: 'UNM-CHK-05',
      label: 'Unmeasured Check Example',
      evaluates: 'Evaluates telemetry vector when telemetry feed is present',
      result: 'unmeasured',
      finding: null,
    },
  ];

  const sampleTelemetryRows: TelemetryRow[] = [
    { param: 'SoH Percentage (Model Output)', value: '85.4', unit: '%', basis: 'Range: 0–100% | Good band: 80–<90%', flagged: false },
    { param: 'SoH Status', value: 'GOOD', unit: '—', basis: 'ChargeUp classification; Good band 80–<90%', flagged: false },
    { param: 'Charge Cycle Count', value: '397', unit: 'Cycles', basis: 'Integer ≥ 0', flagged: false },
    { param: 'State of Charge (SoC)', value: '66.1', unit: '%', basis: 'Range: 0–100% | Deep-discharge risk below 10%', flagged: false },
    { param: 'Current', value: '-20.7269', unit: 'A', basis: 'Negative = discharge', flagged: false },
    { param: 'Power', value: '-1059.7966', unit: 'W', basis: 'Sign must match current', flagged: false },
    { param: 'Cell Imbalance (std)', value: '0.06497', unit: 'V', basis: 'Threshold 0.05 V (50 mV)', flagged: true },
    { param: 'Internal Resistance (raw)', value: '-0.00792', unit: 'Ω', basis: 'Before CCE ABS preprocessing', flagged: false },
    { param: 'Internal Resistance (CCE)', value: '0.00792', unit: 'Ω', basis: 'Post-ABS; must be > 0', flagged: false },
    { param: 'Cell 01 Voltage', value: '3.8172', unit: 'V', basis: 'Range: 2.5–4.2 V', flagged: false },
    { param: 'Cell 02 Voltage', value: '3.8142', unit: 'V', basis: 'Range: 2.5–4.2 V', flagged: false },
    { param: 'Over/Under Voltage Event', value: null, unit: '—', basis: 'Not supplied in this record', flagged: false },
  ];

  const sampleTableRows: {
    id: string;
    batteryId: string;
    vehicleId: string;
    sohPct: number;
    outcome: Outcome;
    action: string;
    hasFullRecord: boolean;
  }[] = [
    { id: 'CRD-2026-UC1-001', batteryId: 'BAT-CU-14S-8842', vehicleId: 'VEH-CU-4092', sohPct: 85.4, outcome: 'ASSURED', action: 'CONTINUE_OPERATION', hasFullRecord: true },
    { id: 'CRD-2026-UC2-001', batteryId: 'BAT-CU-14S-8842', vehicleId: 'VEH-CU-4092', sohPct: 85.4, outcome: 'ASSURED WITH LIMITATIONS', action: 'CONTINUE_OPERATION', hasFullRecord: true },
    { id: 'CRD-2026-UC3-001', batteryId: 'BAT-CU-14S-8842', vehicleId: 'VEH-CU-4092', sohPct: 87.2, outcome: 'REVIEW REQUIRED', action: 'ESCALATE_FOR_REVIEW', hasFullRecord: true },
    { id: 'CRD-2026-UC4-001', batteryId: 'BAT-CU-14S-9031', vehicleId: 'VEH-CU-4092', sohPct: 76.2, outcome: 'ESCALATE', action: 'ESCALATE_FOR_REVIEW', hasFullRecord: true },
    { id: 'CRD-2026-FLT-005', batteryId: 'BAT-CU-14S-1209', vehicleId: 'VEH-CU-1082', sohPct: 88.1, outcome: 'ASSURED', action: 'CONTINUE_OPERATION', hasFullRecord: false },
  ];

  const layerResultsList: LayerResult[] = ['clear', 'limitation', 'review', 'breach', 'unmeasured'];
  const outcomesList: Outcome[] = ['ASSURED', 'ASSURED WITH LIMITATIONS', 'REVIEW REQUIRED', 'ESCALATE'];

  return (
    <AppShell
      leftContent={
        <Breadcrumb
          items={[
            { label: 'CCE Dashboard', href: '/' },
            { label: 'Design System & Component Styleguide' },
          ]}
        />
      }
    >
      <div className="flex flex-col gap-6 max-w-[1600px] mx-auto w-full pb-12">
        {/* Page Header */}
        <div className="flex flex-col gap-1 border-b border-[var(--rule)] pb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-[20px] font-semibold text-[var(--ink)] tracking-tight">
              Design System & Component Styleguide
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--surface-sunken)] text-[var(--ink-2)]">
              SPEC.md §7 & §9
            </span>
          </div>
          <p className="text-[13px] text-[var(--ink-3)]">
            Complete verification and visual catalog of all design tokens, primitives, status states, and responsive component variations.
          </p>
        </div>

        {/* Section Navigation */}
        <Tabs
          items={[
            { id: 'tokens', label: '1. Design Tokens (§7)' },
            { id: 'status', label: '2. Status & Outcomes (§7.2, §4)' },
            { id: 'primitives', label: '3. Component Primitives (§9)' },
            { id: 'data', label: '4. Data & Table Primitives (§9, §11)' },
            { id: 'all', label: 'View All Sections' },
          ]}
          active={activeTab}
          onChange={setActiveTab}
        />

        {/* TAB 1: DESIGN TOKENS */}
        {(activeTab === 'tokens' || activeTab === 'all') && (
          <section className="flex flex-col gap-6">
            {/* 7.1 Surfaces & Ink */}
            <Panel title="7.1 Surfaces & Ink Tokens">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {[
                  { name: '--rail', val: '#0B1A2F', bg: 'var(--rail)', text: '#FFFFFF', desc: 'Nav Rail (17.5:1)' },
                  { name: '--rail-2', val: '#122844', bg: 'var(--rail-2)', text: '#FFFFFF', desc: 'Nav Rail Sub' },
                  { name: '--rail-active', val: '#1D4ED8', bg: 'var(--rail-active)', text: '#FFFFFF', desc: 'Active Marker' },
                  { name: '--canvas', val: '#F5F7FA', bg: 'var(--canvas)', text: 'var(--ink)', desc: 'Canvas Bg' },
                  { name: '--surface', val: '#FFFFFF', bg: 'var(--surface)', text: 'var(--ink)', desc: 'Surface' },
                  { name: '--surface-2', val: '#F8FAFC', bg: 'var(--surface-2)', text: 'var(--ink)', desc: 'Surface 2' },
                  { name: '--surface-sunken', val: '#F1F4F8', bg: 'var(--surface-sunken)', text: 'var(--ink)', desc: 'Sunken' },
                  { name: '--primary', val: '#1D4ED8', bg: 'var(--primary)', text: '#FFFFFF', desc: 'Primary Interactive' },
                  { name: '--rule', val: '#E3E8EF', bg: 'var(--rule)', text: 'var(--ink)', desc: 'Panel Rule' },
                  { name: '--rule-strong', val: '#CDD5DF', bg: 'var(--rule-strong)', text: 'var(--ink)', desc: 'Divider' },
                  { name: '--ink', val: '#0F1B2D', bg: 'var(--ink)', text: '#FFFFFF', desc: 'Primary Ink (17.3:1)' },
                  { name: '--ink-2', val: '#4A5A70', bg: 'var(--ink-2)', text: '#FFFFFF', desc: 'Secondary Ink (7.0:1)' },
                  { name: '--ink-3', val: '#5F6C7E', bg: 'var(--ink-3)', text: '#FFFFFF', desc: 'Labels/Meta (5.3:1)' },
                  { name: '--primary-wash', val: '#EEF3FE', bg: 'var(--primary-wash)', text: 'var(--primary)', desc: 'Interactive Wash' },
                  { name: '--focus-ring', val: '#2563EB', bg: 'var(--focus-ring)', text: '#FFFFFF', desc: 'Focus Ring' },
                ].map((token) => (
                  <div key={token.name} className="p-2.5 rounded-[var(--r-md)] border border-[var(--rule)] flex flex-col justify-between h-24" style={{ backgroundColor: token.bg, color: token.text }}>
                    <div className="font-mono text-[10px] font-semibold">{token.name}</div>
                    <div>
                      <div className="font-mono text-[11px] font-bold">{token.val}</div>
                      <div className="text-[10px] opacity-80">{token.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            {/* 7.2 Status Palette */}
            <Panel title="7.2 Status Palette Tokens (All 5 States × 4 Tokens)">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {[
                  { state: 'assured', label: 'Assured / Clear', mark: '#157F52', ink: '#0B5B36', bg: '#E6F4EC', border: '#BFE1CE' },
                  { state: 'limitation', label: 'Limitation', mark: '#B07D00', ink: '#6E4A00', bg: '#FBF1DC', border: '#EDD9AC' },
                  { state: 'review', label: 'Review Required', mark: '#FF6A00', ink: '#9A3400', bg: '#FFE8D6', border: '#FF9A4D' },
                  { state: 'escalate', label: 'Escalate / Breach', mark: '#FF1F1F', ink: '#9F0010', bg: '#FFE1E1', border: '#FF6B6B' },
                  { state: 'unmeasured', label: 'Unmeasured', mark: '#8A94A3', ink: '#4B5563', bg: '#F1F3F6', border: '#DDE1E7' },
                ].map((s) => (
                  <div key={s.state} className="p-3 rounded-[var(--r-md)] border flex flex-col gap-2" style={{ backgroundColor: s.bg, borderColor: s.border, color: s.ink }}>
                    <div className="text-[13px] font-bold capitalize flex items-center justify-between">
                      <span>{s.label}</span>
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.mark }} />
                    </div>
                    <div className="text-[10px] font-mono flex flex-col gap-0.5 opacity-90">
                      <div>Mark: {s.mark}</div>
                      <div>Text: {s.ink}</div>
                      <div>Bg: {s.bg}</div>
                      <div>Border: {s.border}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            {/* 7.3 & 7.4 Categorical & Sequential Ramp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Panel title="7.3 Categorical Series Palette (5 Engine Actions)">
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { slot: '1', name: 'CONTINUE_OPERATION', hex: '#2A78D6', token: '--series-1' },
                    { slot: '2', name: 'SCHEDULE_MAINTENANCE', hex: '#EB6834', token: '--series-2' },
                    { slot: '3', name: 'REPLACE_BATTERY', hex: '#1BAF7A', token: '--series-3' },
                    { slot: '4', name: 'RETIRE_ASSET', hex: '#EDA100', token: '--series-4' },
                    { slot: '5', name: 'ESCALATE_FOR_REVIEW', hex: '#FF1F1F', token: '--series-5' },
                  ].map((c) => (
                    <div key={c.slot} className="p-2 rounded-[var(--r-sm)] text-white text-center flex flex-col justify-between h-20" style={{ backgroundColor: c.hex }}>
                      <div className="text-[10px] font-bold">Slot {c.slot}</div>
                      <div className="text-[9px] font-mono">{c.hex}</div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="7.4 Sequential Ramp (13 Named Steps 100–700)">
                <div className="grid grid-cols-7 sm:grid-cols-13 gap-1">
                  {[
                    { step: '100', hex: '#CDE2FB' },
                    { step: '150', hex: '#B7D3F6' },
                    { step: '200', hex: '#9EC5F4' },
                    { step: '250', hex: '#86B6EF' },
                    { step: '300', hex: '#6DA7EC' },
                    { step: '350', hex: '#5598E7' },
                    { step: '400', hex: '#3987E5' },
                    { step: '450', hex: '#2A78D6' },
                    { step: '500', hex: '#256ABF' },
                    { step: '550', hex: '#1C5CAB' },
                    { step: '600', hex: '#184F95' },
                    { step: '650', hex: '#104281' },
                    { step: '700', hex: '#0D366B' },
                  ].map((ramp, idx) => (
                    <div key={ramp.step} className="p-1 rounded-[var(--r-sm)] text-center flex flex-col justify-between h-16" style={{ backgroundColor: ramp.hex, color: idx > 6 ? '#FFF' : '#0F1B2D' }}>
                      <div className="text-[9px] font-bold">{ramp.step}</div>
                      <div className="text-[7px] font-mono">{ramp.hex}</div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>

            {/* 7.5 Typography Scale */}
            <Panel title="7.5 Typography Scale Tokens">
              <div className="flex flex-col divide-y divide-[var(--rule)]">
                <div className="py-2 flex items-baseline justify-between gap-4">
                  <span className="font-mono text-[11px] text-[var(--ink-3)] w-28 shrink-0">--t-hero</span>
                  <span className="t-hero text-[var(--ink)]">85.4% SoH</span>
                  <span className="text-[11px] text-[var(--ink-3)]">34px / 38px / 600</span>
                </div>
                <div className="py-2 flex items-baseline justify-between gap-4">
                  <span className="font-mono text-[11px] text-[var(--ink-3)] w-28 shrink-0">--t-metric</span>
                  <span className="t-metric text-[var(--ink)]">1,248 Events</span>
                  <span className="text-[11px] text-[var(--ink-3)]">28px / 32px / 600</span>
                </div>
                <div className="py-2 flex items-baseline justify-between gap-4">
                  <span className="font-mono text-[11px] text-[var(--ink-3)] w-28 shrink-0">--t-h1</span>
                  <span className="t-h1 text-[var(--ink)]">Decision Events Dashboard</span>
                  <span className="text-[11px] text-[var(--ink-3)]">20px / 26px / 600</span>
                </div>
                <div className="py-2 flex items-baseline justify-between gap-4">
                  <span className="font-mono text-[11px] text-[var(--ink-3)] w-28 shrink-0">--t-h2</span>
                  <span className="t-h2 text-[var(--ink)]">Input Assurance Checks</span>
                  <span className="text-[11px] text-[var(--ink-3)]">15px / 20px / 600</span>
                </div>
                <div className="py-2 flex items-baseline justify-between gap-4">
                  <span className="font-mono text-[11px] text-[var(--ink-3)] w-28 shrink-0">--t-body</span>
                  <span className="t-body text-[var(--ink-2)]">All five assurance layers passed verification without findings.</span>
                  <span className="text-[11px] text-[var(--ink-3)]">13px / 18px / 400</span>
                </div>
                <div className="py-2 flex items-baseline justify-between gap-4">
                  <span className="font-mono text-[11px] text-[var(--ink-3)] w-28 shrink-0">--t-body-strong</span>
                  <span className="t-body-strong text-[var(--ink)]">Battery BAT-CU-14S-8842 Tier 1 Clearance</span>
                  <span className="text-[11px] text-[var(--ink-3)]">13px / 18px / 600</span>
                </div>
                <div className="py-2 flex items-baseline justify-between gap-4">
                  <span className="font-mono text-[11px] text-[var(--ink-3)] w-28 shrink-0">--t-label</span>
                  <span className="t-label text-[var(--ink-3)]">ASSURANCE STATUS</span>
                  <span className="text-[11px] text-[var(--ink-3)]">11px / 14px / 600 UPPERCASE</span>
                </div>
                <div className="py-2 flex items-baseline justify-between gap-4">
                  <span className="font-mono text-[11px] text-[var(--ink-3)] w-28 shrink-0">--t-micro</span>
                  <span className="t-micro text-[var(--ink-2)]">PROVISIONAL</span>
                  <span className="text-[11px] text-[var(--ink-3)]">10px / 13px / 600</span>
                </div>
                <div className="py-2 flex items-baseline justify-between gap-4">
                  <span className="font-mono text-[11px] text-[var(--ink-3)] w-28 shrink-0">--t-mono</span>
                  <span className="t-mono text-[var(--ink)]">CRD-2026-UC1-001 · SOH-RANGE-01</span>
                  <span className="text-[11px] text-[var(--ink-3)]">12px / 16px / 500 Monospace</span>
                </div>
              </div>
            </Panel>

            {/* 7.6 & 7.7 Spacing, Radius, Elevation, Motion */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Panel title="7.6 Spacing Tokens">
                <div className="flex items-end gap-2 text-center text-[10px] font-mono">
                  {[
                    { name: '--s1', px: 4 },
                    { name: '--s2', px: 8 },
                    { name: '--s3', px: 12 },
                    { name: '--s4', px: 16 },
                    { name: '--s5', px: 20 },
                    { name: '--s6', px: 24 },
                    { name: '--s8', px: 32 },
                  ].map((s) => (
                    <div key={s.name} className="flex flex-col items-center gap-1">
                      <div className="bg-[var(--primary)] rounded-t w-6" style={{ height: `${s.px * 2}px` }} />
                      <span>{s.px}px</span>
                      <span className="text-[8px] text-[var(--ink-3)]">{s.name}</span>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="7.6 Radius & Elevation">
                <div className="flex flex-col gap-2.5">
                  <div className="p-2 rounded-[var(--r-sm)] border border-[var(--rule)] bg-[var(--surface-2)] text-[11px] font-medium">
                    --r-sm: 4px (Badges & Chips)
                  </div>
                  <div className="p-2 rounded-[var(--r-md)] border border-[var(--rule)] bg-[var(--surface)] shadow-[var(--e1)] text-[11px] font-medium">
                    --r-md: 8px (Panels, Cards) & --e1 Elevation
                  </div>
                  <div className="p-2 rounded-[var(--r-lg)] border border-[var(--rule)] bg-[var(--surface)] shadow-[var(--e2)] text-[11px] font-medium">
                    --r-lg: 10px (Overall Result Card Only)
                  </div>
                </div>
              </Panel>

              <Panel title="7.7 Motion Durations">
                <div className="flex flex-col gap-2 text-[11px] font-mono text-[var(--ink-2)]">
                  <div>--m-fast: 140ms (Hover / Focus / Badge)</div>
                  <div>--m-base: 220ms (Tabs / Expand / Panel Swap)</div>
                  <div>--m-enter: 320ms (Panel Entrance / Draw-in)</div>
                  <div>--m-rail: 380ms (Layer Transitions)</div>
                  <div>--m-stagger: 40ms (Sibling Delay)</div>
                </div>
              </Panel>
            </div>
          </section>
        )}

        {/* TAB 2: STATUS & OUTCOMES */}
        {(activeTab === 'status' || activeTab === 'all') && (
          <section className="flex flex-col gap-6">
            <Panel title="StatusBadge: All 5 Layer Results (clear, limitation, review, breach, unmeasured) × Sizes">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-[11px] font-semibold text-[var(--ink-3)] w-28">Medium (md):</span>
                  {layerResultsList.map((res) => (
                    <StatusBadge key={res} result={res} size="md" />
                  ))}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-[11px] font-semibold text-[var(--ink-3)] w-28">Small (sm):</span>
                  {layerResultsList.map((res) => (
                    <StatusBadge key={res} result={res} size="sm" />
                  ))}
                </div>
              </div>
            </Panel>

            <Panel title="StatusBadge: All 4 Overall Assurance Outcomes (ASSURED, ASSURED WITH LIMITATIONS, REVIEW REQUIRED, ESCALATE)">
              <div className="flex items-center gap-3 flex-wrap">
                {outcomesList.map((out) => (
                  <StatusBadge key={out} outcome={out} size="md" />
                ))}
              </div>
            </Panel>

            <Panel title="OutcomeCard: All 4 Outcomes (Display vs Rail Sizes)">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <h4 className="text-[12px] font-semibold text-[var(--ink-3)] uppercase tracking-wider">
                    Display Size (--r-lg 10px)
                  </h4>
                  <OutcomeCard outcome="ASSURED" action="APPROVE WARRANTY — TIER 1 CLEARANCE" size="display" />
                  <OutcomeCard outcome="ASSURED WITH LIMITATIONS" action="ONE MODEL VERSION REVIEW" size="display" />
                  <OutcomeCard outcome="REVIEW REQUIRED" action="HOLD FOR HUMAN REVIEW" size="display" />
                  <OutcomeCard outcome="ESCALATE" action="VEHICLE INSPECTION" size="display" />
                </div>

                <div className="flex flex-col gap-3">
                  <h4 className="text-[12px] font-semibold text-[var(--ink-3)] uppercase tracking-wider">
                    Rail Size (Compact)
                  </h4>
                  <OutcomeCard outcome="ASSURED" action="APPROVE WARRANTY — TIER 1 CLEARANCE" size="rail" />
                  <OutcomeCard outcome="ASSURED WITH LIMITATIONS" action="ONE MODEL VERSION REVIEW" size="rail" />
                  <OutcomeCard outcome="REVIEW REQUIRED" action="HOLD FOR HUMAN REVIEW" size="rail" />
                  <OutcomeCard outcome="ESCALATE" action="VEHICLE INSPECTION" size="rail" />
                </div>
              </div>
            </Panel>
          </section>
        )}

        {/* TAB 3: PRIMITIVES */}
        {(activeTab === 'primitives' || activeTab === 'all') && (
          <section className="flex flex-col gap-6">
            {/* Metric Tiles */}
            <Panel title="MetricTile: Measured, Supplied, Not Measured & Deltas">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <MetricTile
                  label="Total Decision Events"
                  value={1248}
                  delta={{ value: '+4.2%', direction: 'up', label: 'vs prev 14d' }}
                  provenance="measured"
                />
                <MetricTile
                  label="Average Fleet SoH"
                  value="85.4"
                  unit="%"
                  delta={{ value: '-0.3%', direction: 'down', label: 'vs baseline' }}
                  provenance="measured"
                />
                <MetricTile
                  label="Model Accuracy (Supplied)"
                  value="97.87"
                  unit="%"
                  provenance="supplied"
                  subtext="Holdout set"
                />
                <MetricTile
                  label="Cell Imbalance (UC4)"
                  value={null}
                  provenance="not_measured"
                  subtext="Telemetry not supplied"
                />
              </div>
            </Panel>

            {/* KeyValue & Tooltips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Panel title="KeyValue: Value, Monospace, Basis & Null handling">
                <div className="grid grid-cols-2 gap-3">
                  <KeyValue label="Battery ID" value="BAT-CU-14S-8842" mono />
                  <KeyValue label="Vehicle ID" value="VEH-CU-4092" mono />
                  <KeyValue label="Current SoH" value="85.4%" basis="Range: 0–100% | Good band: 80–<90%" />
                  <KeyValue label="Previous Battery" value={null} basis="Not applicable for this asset" />
                </div>
              </Panel>

              <Panel title="Tooltips (Placements: Top, Bottom, Left, Right)">
                <div className="flex items-center justify-around h-32 flex-wrap gap-2">
                  <Tooltip content="Tooltip on top with --e2 shadow" placement="top">
                    <button className="px-3 py-1.5 text-[12px] font-semibold rounded bg-[var(--surface-2)] border border-[var(--rule)]">
                      Hover Top
                    </button>
                  </Tooltip>
                  <Tooltip content="Tooltip on bottom" placement="bottom">
                    <button className="px-3 py-1.5 text-[12px] font-semibold rounded bg-[var(--surface-2)] border border-[var(--rule)]">
                      Hover Bottom
                    </button>
                  </Tooltip>
                  <Tooltip content="Tooltip on left" placement="left">
                    <button className="px-3 py-1.5 text-[12px] font-semibold rounded bg-[var(--surface-2)] border border-[var(--rule)]">
                      Hover Left
                    </button>
                  </Tooltip>
                  <Tooltip content="Tooltip on right" placement="right">
                    <button className="px-3 py-1.5 text-[12px] font-semibold rounded bg-[var(--surface-2)] border border-[var(--rule)]">
                      Hover Right
                    </button>
                  </Tooltip>
                </div>
              </Panel>
            </div>

            {/* CheckRow & EmptyState */}
            <Panel title="CheckRow: All States (Clear, Limitation, Review, Breach)">
              <div className="flex flex-col gap-1">
                {sampleChecks.map((check) => (
                  <CheckRow key={check.id} check={check} />
                ))}
              </div>
            </Panel>

            {/* ChartFrame */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ChartFrame
                title="ChartFrame (Interactive Chart / Table Toggle)"
                subtitle="Cell voltage spread with shaded band"
                tableView={chartTableView}
                onToggleTable={() => setChartTableView(!chartTableView)}
                tableContent={
                  <div className="p-4 text-[12px] font-mono text-[var(--ink-2)]">
                    <div>Cell 01: 3.8172 V | Cell 02: 3.8142 V</div>
                    <div>Cell 03: 3.8309 V | Cell 04: 3.8212 V</div>
                  </div>
                }
              >
                <div className="h-32 bg-[var(--surface-sunken)] rounded-[var(--r-sm)] border border-dashed border-[var(--rule)] flex items-center justify-center text-[12px] text-[var(--ink-3)]">
                  Active Chart Canvas Representation
                </div>
              </ChartFrame>

              <ChartFrame
                title="ChartFrame (Empty / Not Measured State)"
                empty
                emptyTitle="Cell-level telemetry not supplied"
                emptyDetail="The source system did not record cell telemetry for this scenario."
              >
                <div />
              </ChartFrame>
            </div>
          </section>
        )}

        {/* TAB 4: DATA & TABLE PRIMITIVES */}
        {(activeTab === 'data' || activeTab === 'all') && (
          <section className="flex flex-col gap-6">
            {/* FilterBar */}
            <Panel title="FilterBar (Dropdowns, Query Search, CSV Export, Active Chips)">
              <FilterBar
                filters={filters}
                onChange={setFilters}
                onExport={() => alert('Export CSV triggered')}
              />
            </Panel>

            {/* TelemetryTable */}
            <Panel title="TelemetryTable (8-row Collapsed State, Flagged Rows, Null Guards)">
              <TelemetryTable rows={sampleTelemetryRows} collapsedCount={8} />
            </Panel>

            {/* DataTable */}
            <Panel title="DataTable (Sortable Columns, Row Hover, Clickable & Disabled Tooltip)">
              <DataTable
                columns={[
                  {
                    key: 'id',
                    label: 'Decision ID',
                    render: (row) => <span className="font-mono font-semibold text-[var(--primary)]">{row.id}</span>,
                  },
                  {
                    key: 'batteryId',
                    label: 'Battery ID',
                    render: (row) => <span className="font-mono text-[12px]">{row.batteryId}</span>,
                  },
                  {
                    key: 'vehicleId',
                    label: 'Vehicle ID',
                    render: (row) => <span className="font-mono text-[12px]">{row.vehicleId}</span>,
                  },
                  {
                    key: 'sohPct',
                    label: 'SoH %',
                    align: 'right',
                    render: (row) => <span className="tabular font-semibold">{row.sohPct.toFixed(1)}%</span>,
                  },
                  {
                    key: 'outcome',
                    label: 'Outcome',
                    render: (row) => <StatusBadge outcome={row.outcome} size="sm" />,
                  },
                  {
                    key: 'action',
                    label: 'Action',
                    render: (row) => <span className="text-[12px] text-[var(--ink-2)]">{row.action}</span>,
                  },
                ]}
                rows={sampleTableRows}
                onRowClick={(row) => alert(`Clicked decision event: ${row.id}`)}
                isRowClickable={(row) => row.hasFullRecord}
              />
            </Panel>

            {/* Provenance Notices */}
            <Panel title="ProvenanceLine (Supplied vs Demonstration Banners)">
              <div className="flex flex-col gap-3">
                <ProvenanceLine provenance="supplied" />
                <ProvenanceLine provenance="demonstration" />
              </div>
            </Panel>
          </section>
        )}
      </div>
    </AppShell>
  );
}
