'use client';

import { ExplanationPanel } from '@/features/layers/ExplanationPanel';
import { useDecisionRecord } from '@/features/decision/DecisionChrome';

export default function ExplanationPage() {
  const record = useDecisionRecord();
  return <ExplanationPanel record={record} />;
}
