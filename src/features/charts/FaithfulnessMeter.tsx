'use client';

import React from 'react';
import type { FaithfulnessBand } from '@/lib/data/types';

const BAND: Record<FaithfulnessBand, { ink: string; bg: string; mark: string }> = {
  Faithful: { ink: '#085C32', bg: '#D9FFE8', mark: '#12C46A' },
  'Partially faithful': { ink: '#7A5600', bg: '#FFF4C2', mark: '#F5C400' },
  'Not faithful': { ink: '#9F0010', bg: '#FFD6D6', mark: '#FF1F1F' },
};

export function FaithfulnessMeter({ band }: { band: FaithfulnessBand }) {
  const tone = BAND[band];
  return (
    <p
      className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-[13px] font-semibold w-fit"
      style={{ color: tone.ink, background: tone.bg, borderColor: tone.mark }}
      role="img"
      aria-label={`Faithfulness ${band}`}
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="8" cy="8" r="5.25" stroke="currentColor" strokeWidth="1.4" />
        {band === 'Not faithful' ? (
          <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        ) : band === 'Partially faithful' ? (
          <path d="M8 5v3.5M8 10.6v.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        ) : (
          <path d="M5.2 8.1l1.8 1.8 3.8-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
      {band}
    </p>
  );
}
