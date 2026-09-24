'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DisabledNavItem } from '@/design/components/DisabledNavItem';

export interface RailProps {
  className?: string;
}

export function Rail({ className = '' }: RailProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isDecisionEventsActive = pathname === '/' || pathname.startsWith('/decisions');
  const isStyleguideActive = pathname.startsWith('/styleguide');

  return (
    <aside
      style={{ width: collapsed ? '64px' : '220px' }}
      className={`h-screen sticky top-0 shrink-0 bg-[var(--rail)] text-[var(--rail-ink)] flex flex-col justify-between transition-all duration-200 border-r border-[var(--rail-2)] z-30 select-none ${className}`}
      aria-label="Application Navigation"
    >
      {/* Top: Logo + Nav Items */}
      <div className="flex flex-col">
        {/* Logo block: height 64px */}
        <div className="h-16 flex items-center px-4 border-b border-[var(--rail-2)]">
          <Link href="/" className="flex items-center gap-3 w-full overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]">
            <div className="w-8 h-8 rounded-[var(--r-sm)] bg-[var(--primary)] text-white font-bold flex items-center justify-center shrink-0 shadow-sm text-sm">
              C
            </div>
            {!collapsed && (
              <div className="flex flex-col leading-tight truncate">
                <span className="font-semibold text-[14px] text-white tracking-tight">
                  Credge Clarity
                </span>
                <span className="text-[10px] text-[var(--rail-ink-muted)] uppercase tracking-wider font-semibold">
                  Decision Assurance
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation items: height 40px each */}
        <nav className="p-2 flex flex-col gap-1">
          {/* Decision Events (Active item) */}
          <Link
            href="/"
            aria-current={isDecisionEventsActive ? 'page' : undefined}
            className={`relative flex items-center gap-3 px-3 h-10 rounded-[var(--r-sm)] text-[13px] font-medium transition-colors ${
              isDecisionEventsActive
                ? 'bg-[var(--rail-2)] text-[var(--rail-ink)]'
                : 'text-[var(--rail-ink-muted)] hover:text-[var(--rail-ink)] hover:bg-[var(--rail-2)]/60'
            } ${collapsed ? 'justify-center px-2' : ''}`}
          >
            {isDecisionEventsActive && (
              <span
                aria-hidden="true"
                className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[var(--rail-active)] rounded-r"
              />
            )}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 3.5C2 2.67 2.67 2 3.5 2H12.5C13.33 2 14 2.67 14 3.5V12.5C14 13.33 13.33 14 12.5 14H3.5C2.67 14 2 13.33 2 12.5V3.5Z" stroke="currentColor" strokeWidth="1.2" />
              <path d="M2 6H14M6 6V14" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            {!collapsed && <span>Decision Events</span>}
          </Link>

          {/* Disabled out-of-scope nav items */}
          <DisabledNavItem
            label="Reports"
            reason="Coming soon · Reports in development"
            collapsed={collapsed}
            icon={
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 2.5C3 2.22 3.22 2 3.5 2H10L13 5V13.5C13 13.78 12.78 14 12.5 14H3.5C3.22 14 3 13.78 3 13.5V2.5Z" stroke="currentColor" strokeWidth="1.2" />
                <path d="M6 7H10M6 10H10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            }
          />

          <DisabledNavItem
            label="Alerts"
            reason="Coming soon · Alerts detail in development"
            collapsed={collapsed}
            icon={
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 2.5C6.07 2.5 4.5 4.07 4.5 6V9L3 11.5H13L11.5 9V6C11.5 4.07 9.93 2.5 8 2.5Z" stroke="currentColor" strokeWidth="1.2" />
                <path d="M6.5 12C6.5 12.83 7.17 13.5 8 13.5C8.83 13.5 9.5 12.83 9.5 12" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            }
          />

          <DisabledNavItem
            label="Settings"
            reason="Coming soon · System settings"
            collapsed={collapsed}
            icon={
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M8 1.5V3.5M8 12.5V14.5M1.5 8H3.5M12.5 8H14.5M3.4 3.4L4.8 4.8M11.2 11.2L12.6 12.6M3.4 12.6L4.8 11.2M11.2 4.8L12.6 3.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            }
          />

          {/* Styleguide link for design review */}
          <Link
            href="/styleguide"
            aria-current={isStyleguideActive ? 'page' : undefined}
            className={`relative flex items-center gap-3 px-3 h-10 rounded-[var(--r-sm)] text-[13px] font-medium transition-colors mt-2 ${
              isStyleguideActive
                ? 'bg-[var(--rail-2)] text-[var(--rail-ink)]'
                : 'text-[var(--rail-ink-muted)] hover:text-[var(--rail-ink)] hover:bg-[var(--rail-2)]/60'
            } ${collapsed ? 'justify-center px-2' : ''}`}
          >
            {isStyleguideActive && (
              <span
                aria-hidden="true"
                className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[var(--primary)] rounded-r"
              />
            )}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.5 4.5H13.5M2.5 8H13.5M2.5 11.5H8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            {!collapsed && <span>Styleguide</span>}
          </Link>
        </nav>
      </div>

      {/* Bottom: Collapse toggle */}
      <div className="p-2 border-t border-[var(--rail-2)]">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center gap-3 px-3 h-10 rounded-[var(--r-sm)] text-[12px] font-semibold text-[var(--rail-ink-muted)] hover:text-white hover:bg-[var(--rail-2)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
          aria-label={collapsed ? 'Expand navigation rail' : 'Collapse navigation rail'}
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d={collapsed ? 'M6 4L10 8L6 12' : 'M10 4L6 8L10 12'}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
