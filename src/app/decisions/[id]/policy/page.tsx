import React from 'react';
import { notFound } from 'next/navigation';
import { getDecision } from '@/lib/data';
import { PolicyAssurancePanel } from '@/features/layers/PolicyAssurancePanel';

export interface PolicyPageProps {
  params: Promise<{ id: string }>;
}

export default async function PolicyAssurancePage({ params }: PolicyPageProps) {
  const { id } = await params;
  const record = await getDecision(id);

  if (!record) {
    notFound();
  }

  return <PolicyAssurancePanel record={record} />;
}
