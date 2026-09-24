import React from 'react';
import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1.5 text-[12px] text-[var(--ink-3)] ${className}`}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;

        return (
          <React.Fragment key={idx}>
            {idx > 0 && <span className="text-[var(--rule-strong)]" aria-hidden="true">/</span>}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="font-medium text-[var(--ink-2)] hover:text-[var(--primary)] transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'font-semibold text-[var(--ink)]' : 'font-medium'}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
