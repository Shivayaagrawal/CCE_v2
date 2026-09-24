import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ items, active, onChange, className = '' }: TabsProps) {
  return (
    <div
      role="tablist"
      className={`flex items-center gap-1 border-b border-[var(--rule)] overflow-x-auto no-scrollbar ${className}`}
    >
      {items.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={`relative px-3.5 py-2.5 text-[13px] font-semibold leading-[18px] transition-colors whitespace-nowrap outline-none focus-visible:rounded-[var(--r-sm)] ${
              isActive
                ? 'text-[var(--primary)]'
                : 'text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full tabular ${
                    isActive
                      ? 'bg-[var(--primary-wash)] text-[var(--primary)]'
                      : 'bg-[var(--surface-sunken)] text-[var(--ink-3)]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </span>
            {isActive && (
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--primary)] rounded-t-sm transition-all duration-200"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
