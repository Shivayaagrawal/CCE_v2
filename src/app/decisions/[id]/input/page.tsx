'use client';

import { InputPanel } from '@/features/layers/InputPanel';
import { useDecisionRecord } from '@/features/decision/DecisionChrome';

export default function InputPage() {
  const record = useDecisionRecord();
  return <InputPanel record={record} />;
}
