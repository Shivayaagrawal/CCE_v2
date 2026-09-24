'use client';

import { PolicyPanel } from '@/features/layers/PolicyPanel';
import { useDecisionRecord } from '@/features/decision/DecisionChrome';

export default function PolicyPage() {
  const record = useDecisionRecord();
  return <PolicyPanel record={record} />;
}
