import React from 'react';
import { EventFilters, Outcome, EngineAction, VehicleType, SohStatus } from '@/lib/data/types';

export interface FilterBarProps {
  filters: EventFilters;
  onChange: (filters: EventFilters) => void;
  onExport?: () => void;
  totalFiltered?: number;
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

const ENGINE_ACTIONS: EngineAction[] = [
  'CONTINUE_OPERATION',
  'SCHEDULE_MAINTENANCE',
  'REPLACE_BATTERY',
  'RETIRE_ASSET',
  'ESCALATE_FOR_REVIEW',
];

export function FilterBar({
  filters,
  onChange,
  onExport,
  totalFiltered,
  className = '',
}: FilterBarProps) {
  const activeChips: { key: keyof EventFilters; value: string; label: string }[] = [];

  if (filters.vehicleTypes && filters.vehicleTypes.length > 0) {
    filters.vehicleTypes.forEach((vt) => {
      activeChips.push({ key: 'vehicleTypes', value: vt, label: `Type: ${vt}` });
    });
  }

  if (filters.manufacturers && filters.manufacturers.length > 0) {
    filters.manufacturers.forEach((m) => {
      activeChips.push({ key: 'manufacturers', value: m, label: `Maker: ${m}` });
    });
  }

  if (filters.outcomes && filters.outcomes.length > 0) {
    filters.outcomes.forEach((o) => {
      activeChips.push({ key: 'outcomes', value: o, label: `Outcome: ${o}` });
    });
  }

  if (filters.engineActions && filters.engineActions.length > 0) {
    filters.engineActions.forEach((ea) => {
      activeChips.push({ key: 'engineActions', value: ea, label: `Action: ${ea}` });
    });
  }

  if (filters.query) {
    activeChips.push({ key: 'query', value: filters.query, label: `Search: "${filters.query}"` });
  }

  const removeChip = (key: keyof EventFilters, val: string) => {
    const next = { ...filters };
    if (key === 'query') {
      delete next.query;
    } else if (Array.isArray(next[key])) {
      const arr = (next[key] as string[]).filter((x) => x !== val);
      if (arr.length > 0) {
        (next as any)[key] = arr;
      } else {
        delete (next as any)[key];
      }
    }
    onChange(next);
  };

  const clearAll = () => {
    onChange({});
  };

  return (
    <div className={`p-3 bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--r-md)] shadow-[var(--e1)] flex flex-col gap-2.5 ${className}`}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          {/* Quick Search */}
          <div className="relative min-w-[200px] max-w-xs flex-1">
            <input
              type="text"
              placeholder="Search ID, Battery, Vehicle..."
              value={filters.query || ''}
              onChange={(e) => onChange({ ...filters, query: e.target.value || undefined })}
              className="w-full px-3 py-1.5 pl-8 text-[12px] bg-[var(--surface-2)] border border-[var(--rule)] rounded-[var(--r-sm)] text-[var(--ink)] placeholder:text-[var(--ink-3)] focus:border-[var(--primary)] outline-none"
            />
            <svg
              className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-3)] pointer-events-none"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>

          {/* Outcome Filter */}
          <select
            value={filters.outcomes?.[0] || ''}
            onChange={(e) => {
              const val = e.target.value as Outcome;
              onChange({
                ...filters,
                outcomes: val ? [val] : undefined,
              });
            }}
            className="px-2.5 py-1.5 text-[12px] bg-[var(--surface-2)] border border-[var(--rule)] rounded-[var(--r-sm)] text-[var(--ink)] outline-none focus:border-[var(--primary)]"
          >
            <option value="">All Outcomes</option>
            {OUTCOMES.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>

          {/* Vehicle Type Filter */}
          <select
            value={filters.vehicleTypes?.[0] || ''}
            onChange={(e) => {
              const val = e.target.value as VehicleType;
              onChange({
                ...filters,
                vehicleTypes: val ? [val] : undefined,
              });
            }}
            className="px-2.5 py-1.5 text-[12px] bg-[var(--surface-2)] border border-[var(--rule)] rounded-[var(--r-sm)] text-[var(--ink)] outline-none focus:border-[var(--primary)]"
          >
            <option value="">All Vehicle Types</option>
            {VEHICLE_TYPES.map((vt) => (
              <option key={vt} value={vt}>
                {vt}
              </option>
            ))}
          </select>

          {/* Manufacturer Filter */}
          <select
            value={filters.manufacturers?.[0] || ''}
            onChange={(e) => {
              const val = e.target.value;
              onChange({
                ...filters,
                manufacturers: val ? [val] : undefined,
              });
            }}
            className="px-2.5 py-1.5 text-[12px] bg-[var(--surface-2)] border border-[var(--rule)] rounded-[var(--r-sm)] text-[var(--ink)] outline-none focus:border-[var(--primary)]"
          >
            <option value="">All Manufacturers</option>
            {MANUFACTURERS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Export action */}
        {onExport && (
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-[var(--ink)] bg-[var(--surface-2)] hover:bg-[var(--surface-sunken)] border border-[var(--rule)] rounded-[var(--r-sm)] transition-colors shrink-0"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 2V10M8 10L5.5 7.5M8 10L10.5 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2.5 11.5V13.5H13.5V11.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[var(--rule)]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-3)] mr-1">
            Active Filters:
          </span>
          {activeChips.map((chip, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--r-sm)] bg-[var(--primary-wash)] text-[var(--primary)] text-[11px] font-medium border border-[var(--primary)]"
            >
              <span>{chip.label}</span>
              <button
                type="button"
                onClick={() => removeChip(chip.key, chip.value)}
                className="hover:text-[var(--primary-hover)] p-0.5"
                aria-label={`Remove filter ${chip.label}`}
              >
                ×
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="text-[11px] font-semibold text-[var(--ink-3)] hover:text-[var(--escalate-ink)] ml-2 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
