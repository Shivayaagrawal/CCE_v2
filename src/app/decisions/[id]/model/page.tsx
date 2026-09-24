'use client';

import { ModelPanel } from '@/features/layers/ModelPanel';
import { useDecisionRecord } from '@/features/decision/DecisionChrome';

export default function ModelPage() {
  const record = useDecisionRecord();
  return <ModelPanel record={record} />;
}
