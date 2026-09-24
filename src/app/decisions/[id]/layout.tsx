import { DecisionChrome } from '@/features/decision/DecisionChrome';

export default async function DecisionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DecisionChrome id={id}>{children}</DecisionChrome>;
}
