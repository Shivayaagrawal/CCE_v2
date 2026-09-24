import type { TelemetryRow } from '@/lib/data/types';

/** Shared 35-row telemetry for UC1/UC2/UC3 (Appendix A.4). */
export function buildSharedTelemetry(options: {
  sohPct: string;
  sohStatus: string;
  modelVersion: string;
  flaggedImbalance?: boolean;
}): TelemetryRow[] {
  const rows: Omit<TelemetryRow, 'flagged'>[] = [
    { param: 'SoH Percentage (Model Output)', value: options.sohPct, unit: '%', basis: 'Range: 0–100% | Good band: 80–<90% | Replacement review below 80%' },
    { param: 'SoH Status', value: options.sohStatus, unit: '—', basis: 'ChargeUp classification; Good band 80–<90%' },
    { param: 'Charge Cycle Count', value: '397', unit: 'Cycles', basis: 'Integer ≥ 0' },
    { param: 'State of Charge (SoC)', value: '66.1', unit: '%', basis: 'Range: 0–100% | Deep-discharge risk below 10% (AIS-156)' },
    { param: 'Current', value: '-20.7269', unit: 'A', basis: 'Negative = discharge (as supplied)' },
    { param: 'Power', value: '-1059.7966', unit: 'W', basis: 'Sign must match current' },
    { param: 'Cell Imbalance (std)', value: '0.06497', unit: 'V', basis: 'Digital Twin output | Threshold 0.05 V (50 mV)' },
    { param: 'Internal Resistance (raw)', value: '-0.00792', unit: 'Ω', basis: 'As displayed, before CCE ABS preprocessing' },
    { param: 'Internal Resistance (CCE)', value: '0.00792', unit: 'Ω', basis: 'Post-ABS; must be > 0' },
    { param: 'Cell 01 Voltage', value: '3.8172', unit: 'V', basis: 'Range: 2.5–4.2 V' },
    { param: 'Cell 02 Voltage', value: '3.8142', unit: 'V', basis: 'Range: 2.5–4.2 V' },
    { param: 'Cell 03 Voltage', value: '3.8309', unit: 'V', basis: 'Range: 2.5–4.2 V' },
    { param: 'Cell 04 Voltage', value: '3.8212', unit: 'V', basis: 'Range: 2.5–4.2 V' },
    { param: 'Cell 05 Voltage', value: '3.8324', unit: 'V', basis: 'Range: 2.5–4.2 V' },
    { param: 'Cell 06 Voltage', value: '3.8266', unit: 'V', basis: 'Range: 2.5–4.2 V' },
    { param: 'Cell 07 Voltage', value: '3.8332', unit: 'V', basis: 'Range: 2.5–4.2 V' },
    { param: 'Cell 08 Voltage', value: '3.8333', unit: 'V', basis: 'Range: 2.5–4.2 V' },
    { param: 'Cell 09 Voltage', value: '3.9063', unit: 'V', basis: 'Range: 2.5–4.2 V' },
    { param: 'Cell 10 Voltage', value: '3.8408', unit: 'V', basis: 'Range: 2.5–4.2 V' },
    { param: 'Cell 11 Voltage', value: '3.821', unit: 'V', basis: 'Range: 2.5–4.2 V' },
    { param: 'Cell 12 Voltage', value: '3.8352', unit: 'V', basis: 'Range: 2.5–4.2 V' },
    { param: 'Cell 13 Voltage', value: '3.8379', unit: 'V', basis: 'Range: 2.5–4.2 V' },
    { param: 'Cell 14 Voltage', value: '3.8956', unit: 'V', basis: 'Range: 2.5–4.2 V' },
    { param: 'Max Cell Voltage (DT)', value: '4.0098', unit: 'V', basis: 'Digital Twin | Range: 2.5–4.2 V' },
    { param: 'Min Cell Voltage (DT)', value: '3.779', unit: 'V', basis: 'Digital Twin | Range: 2.5–4.2 V' },
    { param: 'Max–Min ΔV (DT)', value: '0.2309', unit: 'V', basis: 'Digital Twin | Inspection above 200 mV (AIS-038)' },
    { param: 'Battery Pack Voltage', value: '53.7459', unit: 'V', basis: 'Range: 35.0–58.8 V (14S) | Should equal sum of 14 cells' },
    { param: 'Over/Under Voltage Event', value: '0', unit: '—', basis: 'BMS fault flag; 0 = no breach (AIS-156)' },
    { param: 'Max Cell Temperature', value: '32.32', unit: '°C', basis: 'Range: -20 to +60 °C discharge' },
    { param: 'Min Cell Temperature', value: '30.28', unit: '°C', basis: 'Range: -20 to +60 °C discharge' },
    { param: 'Cell Temp 01', value: '31.2', unit: '°C', basis: 'Within [min, max] cell temperature' },
    { param: 'Cell Temp 02', value: '31.21', unit: '°C', basis: 'Within [min, max] cell temperature' },
    { param: 'Cell Temp 03', value: '31.82', unit: '°C', basis: 'Within [min, max] cell temperature' },
    { param: 'Model Version', value: options.modelVersion, unit: '—', basis: 'Must equal configured production model' },
    { param: 'Configured Production Model', value: 'DLL:V2', unit: '—', basis: 'Reference value' },
  ];

  return rows.map((r) => ({
    ...r,
    flagged: Boolean(options.flaggedImbalance && r.param === 'Cell Imbalance (std)'),
  }));
}

/** UC4 — six rows only (Appendix A.5). */
export function buildUc4Telemetry(): TelemetryRow[] {
  return [
    { param: 'SoH Percentage (Model Output)', value: '76.2', unit: '%', basis: 'Range: 0–100% | Good band: 80–<90% | Replacement review below 80%', flagged: false },
    { param: 'SoH Status', value: 'REPLACEMENT REVIEW', unit: '—', basis: 'ChargeUp classification; Good band 80–<90%', flagged: false },
    { param: 'Charge Cycle Count', value: '312', unit: 'Cycles', basis: 'Integer ≥ 0', flagged: false },
    { param: 'Model Version', value: 'DLL:V2', unit: '—', basis: 'Must equal configured production model', flagged: false },
    { param: 'Configured Production Model', value: 'DLL:V2', unit: '—', basis: 'Reference value', flagged: false },
    { param: 'Forecast Horizon', value: '365', unit: 'days', basis: 'Supplied for this scenario', flagged: false },
  ];
}
