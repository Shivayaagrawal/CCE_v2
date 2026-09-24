import type { EngineAction, LayerKey, LayerResult, Outcome, SohStatus } from '@/lib/data/types';

export const LAYER_ORDER: { key: LayerKey; index: 1 | 2 | 3 | 4 | 5; name: string; slug: string }[] = [
  { key: 'input', index: 1, name: 'Input Assurance', slug: 'input' },
  { key: 'model', index: 2, name: 'Model Assurance', slug: 'model' },
  { key: 'policy', index: 3, name: 'Policy Assurance', slug: 'policy' },
  { key: 'decision', index: 4, name: 'Decision Assurance', slug: 'decision' },
  { key: 'explanation', index: 5, name: 'Explanation Assurance', slug: 'explanation' },
];

export function layerHref(id: string, slug: string): string {
  return `/decisions/${id}/${slug}`;
}

const FAILING_RESULTS = new Set<LayerResult>(['limitation', 'review', 'breach']);

export function firstStopSlug(results: Partial<Record<LayerKey, LayerResult>>): string {
  return LAYER_ORDER.find((layer) => {
    const result = results[layer.key];
    return result != null && FAILING_RESULTS.has(result);
  })?.slug ?? 'input';
}

const ACTION_LABELS: Record<EngineAction, string> = {
  CONTINUE_OPERATION: 'Continue operation',
  SCHEDULE_MAINTENANCE: 'Schedule maintenance',
  REPLACE_BATTERY: 'Replace battery',
  RETIRE_ASSET: 'Retire asset',
  ESCALATE_FOR_REVIEW: 'Escalate for review',
};

export function engineActionLabel(action: EngineAction): string {
  return ACTION_LABELS[action];
}

const OUTCOME_LABELS: Record<Outcome, string> = {
  ASSURED: 'Assured',
  'ASSURED WITH LIMITATIONS': 'Assured with limitations',
  'REVIEW REQUIRED': 'Review required',
  ESCALATE: 'Escalate',
};

export function outcomeLabel(outcome: Outcome): string {
  return OUTCOME_LABELS[outcome];
}

export function sohStatusLabel(status: SohStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}
