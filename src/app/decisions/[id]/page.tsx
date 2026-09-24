import { redirect } from 'next/navigation';
import { getDecision } from '@/lib/data';
import { firstStopSlug, LAYER_ORDER } from '@/features/labels';

export default async function DecisionIndex({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await getDecision(id);
  const results = record
    ? Object.fromEntries(LAYER_ORDER.map((layer) => [layer.key, record.layers[layer.key].result]))
    : {};
  redirect(`/decisions/${id}/${firstStopSlug(results)}`);
}
