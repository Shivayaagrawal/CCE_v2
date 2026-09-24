import type { LayerKey, LayerResult, Outcome } from '@/lib/data/types';

const LAYER_ORDER: LayerKey[] = ['input', 'model', 'policy', 'decision', 'explanation'];

/** SPEC §4.3 — consistency indicator only; never overrides stored `outcome` on screens. */
export function rollupOutcome(layers: Record<LayerKey, LayerResult>): Outcome {
  const results = LAYER_ORDER.map((k) => layers[k]);
  if (results.some((r) => r === 'breach')) {
    return layers.decision === 'breach' ? 'ESCALATE' : 'REVIEW REQUIRED';
  }
  if (results.some((r) => r === 'review')) {
    return 'REVIEW REQUIRED';
  }
  if (results.some((r) => r === 'limitation')) {
    return 'ASSURED WITH LIMITATIONS';
  }
  if (results.every((r) => r === 'clear')) {
    return 'ASSURED';
  }
  return 'REVIEW REQUIRED';
}
