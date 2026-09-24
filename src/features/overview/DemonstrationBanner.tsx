'use client';

import React, { useState } from 'react';

export interface DemonstrationBannerProps {
  className?: string;
}

export function DemonstrationBanner({ className = '' }: DemonstrationBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      role="region"
      aria-label="Demonstration Notice"
      className={`p-3 bg-[var(--surface-2)] border border-[var(--rule)] rounded-[var(--r-md)] text-[12px] leading-[18px] text-[var(--ink-2)] flex items-start justify-between gap-3 shadow-[var(--e1)] ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <svg
          className="w-4 h-4 shrink-0 text-[var(--primary)] mt-0.5"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M8 5V8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="8" cy="11" r="0.75" fill="currentColor" />
        </svg>
        <div>
          <span className="font-semibold text-[var(--ink)]">Demonstration data. </span>
          <span>
            These are controlled demonstration scenarios, not production ChargeUp operational records. The four highlighted decision records are sourced from the ChargeUp CCE UC1–UC4 assurance master; surrounding fleet events are generated for this build.
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss demonstration banner"
        className="text-[var(--ink-3)] hover:text-[var(--ink)] p-1 rounded hover:bg-[var(--surface-sunken)] transition-colors shrink-0 text-[14px] leading-none"
      >
        ×
      </button>
    </div>
  );
}
