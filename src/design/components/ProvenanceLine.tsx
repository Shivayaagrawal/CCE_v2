import React from 'react';
import { Provenance } from '@/lib/data/types';

export interface ProvenanceLineProps {
  provenance: Provenance;
  note?: string;
  className?: string;
}

export function ProvenanceLine({ provenance, note, className = '' }: ProvenanceLineProps) {
  if (provenance === 'supplied') {
    return (
      <div className={`text-[11px] leading-[15px] italic text-[var(--ink-3)] flex items-center gap-1.5 ${className}`}>
        <svg className="w-3.5 h-3.5 shrink-0 opacity-75" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M8 5V8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="8" cy="11" r="0.75" fill="currentColor" />
        </svg>
        <span>
          {note || 'Supplied by the source system. Not measured or verified by CCE.'}
        </span>
      </div>
    );
  }

  if (provenance === 'demonstration') {
    return (
      <div className={`p-3 rounded-[var(--r-md)] bg-[var(--surface-2)] border border-[var(--rule)] text-[12px] leading-[17px] text-[var(--ink-2)] flex items-start gap-2.5 ${className}`}>
        <svg className="w-4 h-4 shrink-0 text-[var(--primary)] mt-0.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M8 5V8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="8" cy="11" r="0.75" fill="currentColor" />
        </svg>
        <div>
          <span className="font-semibold text-[var(--ink)]">Demonstration data. </span>
          <span>
            {note || 'These are controlled demonstration scenarios, not production ChargeUp operational records. The four highlighted decision records are sourced from the ChargeUp CCE UC1–UC4 assurance master; surrounding fleet events are generated for this build.'}
          </span>
        </div>
      </div>
    );
  }

  return null;
}
