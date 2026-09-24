import React from 'react';
import { Provenance } from '@/lib/data/types';
import { ProvenanceLine } from './ProvenanceLine';

export interface PanelProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  provenance?: Provenance;
  provenanceNote?: string;
  dense?: boolean;
  tableView?: boolean;
  onToggleTable?: () => void;
  className?: string;
  children: React.ReactNode;
}

export function Panel({
  title,
  subtitle,
  actions,
  provenance,
  provenanceNote,
  dense = false,
  tableView,
  onToggleTable,
  className = '',
  children,
}: PanelProps) {
  const hasHeader = title || subtitle || actions || onToggleTable !== undefined;
  const paddingClass = dense ? 'p-3' : 'p-4';

  return (
    <div
      className={`bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--r-md)] shadow-[var(--e1)] flex flex-col ${paddingClass} ${className}`}
    >
      {hasHeader && (
        <div className="flex items-start justify-between gap-3 mb-3 shrink-0">
          <div>
            {title && (
              <h3 className="text-[15px] font-semibold leading-[20px] text-[var(--ink)] tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-[12px] leading-[16px] text-[var(--ink-3)] mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onToggleTable !== undefined && (
              <button
                type="button"
                onClick={onToggleTable}
                className={`inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase px-2 py-1 rounded-[var(--r-sm)] border transition-colors ${
                  tableView
                    ? 'bg-[var(--primary-wash)] text-[var(--primary)] border-[var(--primary)]'
                    : 'bg-[var(--surface-2)] text-[var(--ink-2)] border-[var(--rule)] hover:text-[var(--ink)]'
                }`}
                aria-pressed={tableView}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 3.5C2 2.67 2.67 2 3.5 2H12.5C13.33 2 14 2.67 14 3.5V12.5C14 13.33 13.33 14 12.5 14H3.5C2.67 14 2 13.33 2 12.5V3.5Z" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M2 6H14M6 6V14" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                <span>{tableView ? 'Chart' : 'Table'}</span>
              </button>
            )}
            {actions}
          </div>
        </div>
      )}

      {provenance && provenance !== 'measured' && (
        <div className="mb-3">
          <ProvenanceLine provenance={provenance} note={provenanceNote} />
        </div>
      )}

      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
