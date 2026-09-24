import React from 'react';
import { notFound } from 'next/navigation';
import { getDecision } from '@/lib/data';
import { ModelAssurancePanel } from '@/features/layers/ModelAssurancePanel';

export interface ModelPageProps {
  params: Promise<{ id: string }>;
}

export default async function ModelAssurancePage({ params }: ModelPageProps) {
  const { id } = await params;
  const record = await getDecision(id);

  if (!record) {
    notFound();
  }

  return <ModelAssurancePanel record={record} />;
}
