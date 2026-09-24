'use client';

import React from 'react';

export function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number | string; color?: string; payload?: Record<string, unknown> }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="relative rounded-[10px] bg-[var(--ink)] text-white px-3 py-2 text-[12px] leading-[16px] shadow-[0_8px_24px_rgba(15,27,45,0.18)]">
      <span aria-hidden className="absolute -bottom-1 left-4 w-2 h-2 bg-[var(--ink)] rotate-45" />
      {label && <div className="font-semibold mb-1">{label}</div>}
      {payload.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color || '#fff' }} />
          <span>
            {item.name} · {item.value}
          </span>
        </div>
      ))}
      <div className="mt-1 text-[11px] text-white/70">Click to filter</div>
    </div>
  );
}
