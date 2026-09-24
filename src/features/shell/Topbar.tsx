'use client';

import React, { useState } from 'react';

export interface TopbarProps {
  leftContent?: React.ReactNode;
  asOfDate?: string;
  executionLabel?: string;
  onRefresh?: () => void;
  className?: string;
}

export function Topbar({
  leftContent,
  asOfDate = '24 Sep 2026, 10:30 AM',
  executionLabel = 'Auto Execution ON',
  onRefresh,
  className = '',
}: TopbarProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    if (onRefresh) {
      setRefreshing(true);
      onRefresh();
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  return (
    <header
      className={`h-14 bg-[var(--surface)] border-b border-[var(--rule)] px-4 flex items-center justify-between gap-4 sticky top-0 z-20 shrink-0 ${className}`}
    >
      {/* Left region: Title or Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {leftContent || (
          <div className="flex items-center gap-2">
            <h1 className="text-[15px] font-semibold text-[var(--ink)] tracking-tight">
              Decision Events Dashboard
            </h1>
            <span className="text-[11px] font-medium text-[var(--ink-3)] hidden sm:inline">
              · Fleet Decision Governance
            </span>
          </div>
        )}
      </div>

      {/* Right region: Status, Clock, Refresh */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Auto Execution status badge */}
        <div className="hidden md:flex items-center px-2.5 py-1 rounded-full bg-[var(--assured-bg)] text-[var(--assured-ink)] border border-[var(--assured-border)] text-[11px] font-semibold">
          <span>{executionLabel}</span>
        </div>

        {/* As of timestamp */}
        <div className="text-[12px] text-[var(--ink-3)] font-medium hidden sm:flex items-center gap-1">
          <span className="text-[var(--ink-3)] opacity-70">As of:</span>
          <span className="text-[var(--ink-2)] tabular font-mono text-[11px]">{asOfDate}</span>
        </div>

        {/* Refresh button */}
        <button
          type="button"
          onClick={handleRefresh}
          className="p-1.5 rounded-[var(--r-sm)] border border-[var(--rule)] bg-[var(--surface)] text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
          aria-label="Refresh dashboard data and animations"
          title="Re-run animations and refresh view"
        >
          <svg
            className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13.5 8C13.5 11.0376 11.0376 13.5 8 13.5C4.96243 13.5 2.5 11.0376 2.5 8C2.5 4.96243 4.96243 2.5 8 2.5C10.1504 2.5 12.0223 3.73273 12.9234 5.5M13.5 2.5V6H10"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
