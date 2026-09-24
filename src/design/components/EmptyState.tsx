import React from 'react';

export interface EmptyStateProps {
  title: string;
  detail: string;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  detail,
  icon,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`p-6 rounded-[var(--r-md)] border border-dashed border-[var(--rule-strong)] bg-[var(--surface-2)] flex flex-col items-center justify-center text-center ${className}`}
    >
      <div className="w-9 h-9 rounded-full bg-[var(--surface-sunken)] text-[var(--ink-3)] flex items-center justify-center mb-2.5">
        {icon || (
          <svg className="w-5 h-5 opacity-70" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M5 8H11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <h4 className="text-[14px] font-semibold text-[var(--ink)]">{title}</h4>
      <p className="text-[12px] text-[var(--ink-3)] mt-1 max-w-sm">{detail}</p>
    </div>
  );
}
