'use client';

import { DecisionPanel } from '@/features/layers/DecisionPanel';
import { useDecisionRecord } from '@/features/decision/DecisionChrome';

export default function DecisionPage() {
  const record = useDecisionRecord();
  return <DecisionPanel record={record} />;
}
