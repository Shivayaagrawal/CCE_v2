'use client';

import React from 'react';
import { EventFilters, Outcome, EngineAction, VehicleType, SohStatus } from '@/lib/data/types';
import { AS_OF } from '@/lib/data/fixture/fleet';

export interface FilterBarProps {
  filters: EventFilters;
  onChange: (filters: EventFilters) => void;
  onExport: () => void;
  totalFiltered: number;
  className?: string;
}

const VEHICLE_TYPES: VehicleType[] = [
  'Last Mile Delivery',
  'Intercity Cargo',
  'Passenger Shuttle',
  'Municipal Fleet',
  'Rental Pool',
];

const MANUFACTURERS = ['LG', 'Samsung SDI', 'Exide'];

const OUTCOMES: Outcome[] = [
  'ASSURED',
  'ASSURED WITH LIMITATIONS',
  'REVIEW REQUIRED',
  'ESCALATE',
];

const ENGINE_ACTIONS: { value: EngineAction; label: string }[] = [
  { value: 'CONTINUE_OPERATION', label: 'Continue Operation' },
  { value: 'SCHEDULE_MAINTENANCE', label: 'Schedule Maintenance' },
  { value: 'REPLACE_BATTERY', label: 'Replace Battery' },
  { value: 'RETIRE_ASSET', label: 'Retire Asset' },
  { value: 'ESCALATE_FOR_REVIEW', label: 'Escalate for Review' },
];

const SOH_BANDS = [
  { label: '≥90% (Excellent)', min: 90, max: 101 },
  { label: '80–<90% (Good)', min: 80, max: 90 },
  { label: '70–<80% (Wear)', min: 70, max: 80 },
  { label: '60–<70% (Worn)', min: 60, max: 70 },
  { label: '<60% (Critical)', min: 0, max: 60 },
];

const DATE_PRESETS = [
  { label: 'All Dates (14d)', days: 14 },
  { label: 'Today (24h)', days: 1 },
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 14 Days', days: 14 },
  { label: 'Last 30 Days', days: 30 },
];

export function FilterBar({
  filters,
  onChange,
  onExport,
  totalFiltered,
  className = '',
}: FilterBarProps) {
  const activeChips: { key: string; label: string; remove: () => void }[] = [];

  // Active chips extraction
  if (filters.vehicleTypes && filters.vehicleTypes.length > 0) {
    filters.vehicleTypes.forEach((vt) => {
      activeChips.push({
        key: `vt-${vt}`,
        label: `Type: ${vt}`,
        remove: () => {
          const next = filters.vehicleTypes?.filter((x) => x !== vt);
          onChange({ ...filters, vehicleTypes: next && next.length > 0 ? next : undefined });
        },
      });
    });
  }

  if (filters.manufacturers && filters.manufacturers.length > 0) {
    filters.manufacturers.forEach((m) => {
      activeChips.push({
        key: `mfg-${m}`,
        label: `Maker: ${m}`,
        remove: () => {
          const next = filters.manufacturers?.filter((x) => x !== m);
          onChange({ ...filters, manufacturers: next && next.length > 0 ? next : undefined });
        },
      });
    });
  }

  if (filters.outcomes && filters.outcomes.length > 0) {
    filters.outcomes.forEach((o) => {
      activeChips.push({
        key: `out-${o}`,
        label: `Outcome: ${o}`,
        remove: () => {
          const next = filters.outcomes?.filter((x) => x !== o);
          onChange({ ...filters, outcomes: next && next.length > 0 ? next : undefined });
        },
      });
    });
  }

  if (filters.engineActions && filters.engineActions.length > 0) {
    filters.engineActions.forEach((ea) => {
      activeChips.push({
        key: `ea-${ea}`,
        label: `Action: ${ea}`,
        remove: () => {
          const next = filters.engineActions?.filter((x) => x !== ea);
          onChange({ ...filters, engineActions: next && next.length > 0 ? next : undefined });
        },
      });
    });
  }

  if (filters.sohBand) {
    const bandLabel = SOH_BANDS.find(b => b.min === filters.sohBand?.min && b.max === filters.sohBand?.max)?.label || `SoH: ${filters.sohBand.min}–${filters.sohBand.max}%`;
    activeChips.push({
      key: 'sohBand',
      label: `SoH: ${bandLabel}`,
      remove: () => {
        const { sohBand, ...rest } = filters;
        onChange(rest);
      },
    });
  }

  if (filters.from) {
    activeChips.push({
      key: 'dateRange',
      label: `Date from: ${filters.from.split('T')[0]}`,
      remove: () => {
        const { from, to, ...rest } = filters;
        onChange(rest);
      },
    });
  }

  if (filters.query) {
    activeChips.push({
      key: 'query',
      label: `Search: "${filters.query}"`,
      remove: () => {
        const { query, ...rest } = filters;
        onChange(rest);
      },
    });
  }

  const handleDatePreset = (days: number) => {
    if (days === 14 && !filters.from) return;
    const asOfMs = new Date(AS_OF).getTime();
    const fromMs = asOfMs - days * 24 * 60 * 60 * 1000;
    onChange({
      ...filters,
      from: new Date(fromMs).toISOString(),
      to: AS_OF,
    });
  };

  const clearAll = () => {
    onChange({});
  };

  return (
    <div className={`p-3 bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--r-md)] shadow-[var(--e1)] flex flex-col gap-2.5 ${className}`}>
      <div className="flex items-center justify-between gap-2.5 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          {/* Quick Free-Text Search */}
          <div className="relative min-w-[170px] max-w-xs flex-1">
            <input
              type="text"
              placeholder="Search ID, battery, vehicle..."
              value={filters.query || ''}
              onChange={(e) => onChange({ ...filters, query: e.target.value || undefined, page: 1 })}
              className="w-full px-2.5 py-1.5 pl-7 text-[12px] bg-[var(--surface-2)] border border-[var(--rule)] rounded-[var(--r-sm)] text-[var(--ink)] placeholder:text-[var(--ink-3)] focus:border-[var(--primary)] outline-none"
            />
            <svg
              className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-[var(--ink-3)] pointer-events-none"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>

          {/* 1. Date Range Filter */}
          <select
            value={filters.from ? 'custom' : ''}
            onChange={(e) => {
              const val = e.target.value;
              if (!val) {
                const { from, to, ...rest } = filters;
                onChange({ ...rest, page: 1 });
              } else {
                handleDatePreset(parseInt(val, 10));
              }
            }}
            className="px-2 py-1.5 text-[12px] bg-[var(--surface-2)] border border-[var(--rule)] rounded-[var(--r-sm)] text-[var(--ink)] outline-none focus:border-[var(--primary)]"
          >
            <option value="">All Dates (14d)</option>
            <option value="1">Today (24h)</option>
            <option value="7">Last 7 Days</option>
            <option value="14">Last 14 Days</option>
            <option value="30">Last 30 Days</option>
          </select>

          {/* 2. Assurance Outcome Filter */}
          <select
            value={filters.outcomes?.[0] || ''}
            onChange={(e) => {
              const val = e.target.value as Outcome;
              onChange({
                ...filters,
                outcomes: val ? [val] : undefined,
                page: 1,
              });
            }}
            className="px-2 py-1.5 text-[12px] bg-[var(--surface-2)] border border-[var(--rule)] rounded-[var(--r-sm)] text-[var(--ink)] outline-none focus:border-[var(--primary)]"
          >
            <option value="">All Outcomes</option>
            {OUTCOMES.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>

          {/* 3. Engine Action Filter */}
          <select
            value={filters.engineActions?.[0] || ''}
            onChange={(e) => {
              const val = e.target.value as EngineAction;
              onChange({
                ...filters,
                engineActions: val ? [val] : undefined,
                page: 1,
              });
            }}
            className="px-2 py-1.5 text-[12px] bg-[var(--surface-2)] border border-[var(--rule)] rounded-[var(--r-sm)] text-[var(--ink)] outline-none focus:border-[var(--primary)]"
          >
            <option value="">All Engine Actions</option>
            {ENGINE_ACTIONS.map((ea) => (
              <option key={ea.value} value={ea.value}>
                {ea.label}
              </option>
            ))}
          </select>

          {/* 4. Vehicle Type Filter */}
          <select
            value={filters.vehicleTypes?.[0] || ''}
            onChange={(e) => {
              const val = e.target.value as VehicleType;
              onChange({
                ...filters,
                vehicleTypes: val ? [val] : undefined,
                page: 1,
              });
            }}
            className="px-2 py-1.5 text-[12px] bg-[var(--surface-2)] border border-[var(--rule)] rounded-[var(--r-sm)] text-[var(--ink)] outline-none focus:border-[var(--primary)]"
          >
            <option value="">All Vehicle Types</option>
            {VEHICLE_TYPES.map((vt) => (
              <option key={vt} value={vt}>
                {vt}
              </option>
            ))}
          </select>

          {/* 5. Manufacturer Filter */}
          <select
            value={filters.manufacturers?.[0] || ''}
            onChange={(e) => {
              const val = e.target.value;
              onChange({
                ...filters,
                manufacturers: val ? [val] : undefined,
                page: 1,
              });
            }}
            className="px-2 py-1.5 text-[12px] bg-[var(--surface-2)] border border-[var(--rule)] rounded-[var(--r-sm)] text-[var(--ink)] outline-none focus:border-[var(--primary)]"
          >
            <option value="">All Manufacturers</option>
            {MANUFACTURERS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* 6. SoH Band Filter */}
          <select
            value={filters.sohBand ? `${filters.sohBand.min}-${filters.sohBand.max}` : ''}
            onChange={(e) => {
              const val = e.target.value;
              if (!val) {
                const { sohBand, ...rest } = filters;
                onChange({ ...rest, page: 1 });
              } else {
                const [minStr, maxStr] = val.split('-');
                onChange({
                  ...filters,
                  sohBand: { min: parseFloat(minStr), max: parseFloat(maxStr) },
                  page: 1,
                });
              }
            }}
            className="px-2 py-1.5 text-[12px] bg-[var(--surface-2)] border border-[var(--rule)] rounded-[var(--r-sm)] text-[var(--ink)] outline-none focus:border-[var(--primary)]"
          >
            <option value="">All SoH Bands</option>
            {SOH_BANDS.map((b) => (
              <option key={b.label} value={`${b.min}-${b.max}`}>
                {b.label}
              </option>
            ))}
          </select>
        </div>

        {/* Export CSV Button */}
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-[var(--ink)] bg-[var(--surface-2)] hover:bg-[var(--surface-sunken)] border border-[var(--rule)] rounded-[var(--r-sm)] transition-colors shrink-0 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 2V10M8 10L5.5 7.5M8 10L10.5 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2.5 11.5V13.5H13.5V11.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span>Export CSV ({totalFiltered})</span>
        </button>
      </div>

      {/* Active Filter Chips & Clear All */}
      {activeChips.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[var(--rule)]">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ink-3)] mr-1">
            Active Filters ({activeChips.length}):
          </span>
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--r-sm)] bg-[var(--primary-wash)] text-[var(--primary)] text-[11px] font-medium border border-[var(--primary)]"
            >
              <span>{chip.label}</span>
              <button
                type="button"
                onClick={chip.remove}
                className="hover:text-[var(--primary-hover)] p-0.5 cursor-pointer leading-none font-bold"
                aria-label={`Remove filter ${chip.label}`}
              >
                ×
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="text-[11px] font-semibold text-[var(--ink-3)] hover:text-[var(--escalate-ink)] ml-2 transition-colors cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
