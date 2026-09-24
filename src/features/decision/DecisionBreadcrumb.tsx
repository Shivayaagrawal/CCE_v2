'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Breadcrumb } from '@/design/components/Breadcrumb';

export interface DecisionBreadcrumbProps {
  id: string;
}

const LAYER_TITLES: Record<string, string> = {
  input: 'Input Assurance',
  model: 'Model Assurance',
  policy: 'Policy Assurance',
  decision: 'Decision Assurance',
  explanation: 'Explanation Assurance',
};

export function DecisionBreadcrumb({ id }: DecisionBreadcrumbProps) {
  const pathname = usePathname() || '';
  const currentSegment = pathname.split('/').pop() || 'input';
  const layerTitle = LAYER_TITLES[currentSegment] || 'Input Assurance';

  return (
    <Breadcrumb
      items={[
        { label: 'Decision Events', href: '/' },
        { label: id, href: `/decisions/${id}/input` },
        { label: layerTitle },
      ]}
    />
  );
}
