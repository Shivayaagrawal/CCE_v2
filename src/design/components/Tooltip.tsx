import React, { useState } from 'react';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({
  content,
  children,
  placement = 'top',
  className = '',
}: TooltipProps) {
  const [visible, setVisible] = useState(false);

  const placementClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
  };

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && content && (
        <div
          role="tooltip"
          className={`absolute z-50 px-3 py-2 text-[12px] leading-[16px] font-medium text-white bg-[var(--ink)] rounded-[10px] shadow-[var(--e2)] pointer-events-none whitespace-normal max-w-[280px] ${placementClasses[placement]}`}
        >
          <span
            aria-hidden
            className={`absolute w-2 h-2 bg-[var(--ink)] rotate-45 ${
              placement === 'bottom'
                ? '-top-1 left-1/2 -translate-x-1/2'
                : placement === 'left'
                ? '-right-1 top-1/2 -translate-y-1/2'
                : placement === 'right'
                ? '-left-1 top-1/2 -translate-y-1/2'
                : '-bottom-1 left-1/2 -translate-x-1/2'
            }`}
          />
          {content}
        </div>
      )}
    </div>
  );
}
