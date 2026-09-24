import { DecisionEvent } from './data/types';

export function exportEventsToCsv(events: DecisionEvent[], filename?: string): void {
  if (typeof window === 'undefined') return;

  const headers = [
    'Decision ID',
    'Timestamp (UTC)',
    'Battery ID',
    'Vehicle ID',
    'Vehicle Type',
    'Manufacturer',
    'SoH (%)',
    'SoH Status',
    'Engine Action',
    'Assurance Outcome',
    'Input Result',
    'Model Result',
    'Policy Result',
    'Decision Result',
    'Explanation Result',
    'Has Full Record',
  ];

  const rows = events.map((e) => [
    e.id,
    e.timestampUtc,
    e.batteryId,
    e.vehicleId,
    `"${e.vehicleType}"`,
    `"${e.manufacturer}"`,
    e.sohPct.toFixed(1),
    `"${e.sohStatus}"`,
    `"${e.engineAction}"`,
    `"${e.outcome}"`,
    e.layerResults.input,
    e.layerResults.model,
    e.layerResults.policy,
    e.layerResults.decision,
    e.layerResults.explanation,
    e.hasFullRecord ? 'true' : 'false',
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const exportFilename = filename || `cce-decision-events-${new Date().toISOString().slice(0, 10)}.csv`;
  link.setAttribute('download', exportFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
