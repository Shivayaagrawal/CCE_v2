import React from 'react';
import { Tooltip } from './Tooltip';

export interface DisabledNavItemProps {
  label: string;
  reason?: string;
  icon?: React.ReactNode;
  collapsed?: boolean;
  className?: string;
}

export function DisabledNavItem({
  label,
  reason = 'Coming soon',
  icon,
  collapsed = false,
  className = '',
}: DisabledNavItemProps) {
  return (
    <Tooltip content={reason} placement="right">
      <div
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-[var(--r-sm)] text-[var(--rail-ink-muted)] opacity-50 cursor-not-allowed select-none transition-opacity hover:opacity-75 ${
          collapsed ? 'justify-center px-2' : ''
        } ${className}`}
        aria-disabled="true"
      >
        {icon && <span className="w-4 h-4 shrink-0">{icon}</span>}
        {!collapsed && (
          <div className="flex items-center justify-between flex-1 min-w-0">
            <span className="text-[13px] font-medium leading-[18px] truncate">
              {label}
            </span>
            <span className="text-[9px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-[var(--rail-2)] text-[var(--rail-ink-muted)]">
              Soon
            </span>
          </div>
        )}
      </div>
    </Tooltip>
  );
}
