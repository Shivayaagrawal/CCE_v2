import { describe, it, expect } from 'vitest';
import {
  NOT_MEASURED,
  formatPercent,
  formatVoltage,
  formatResistance,
  formatMillivolts,
  formatTemperature,
  formatCount,
  formatLatency,
  formatDate,
  formatTime,
  formatDateTime,
  formatIsoUtc,
} from '../format';

describe('format.ts formatting rules', () => {
  describe('Null rule (SPEC.md §14.3)', () => {
    it('returns "Not measured" for null and undefined across all formatters', () => {
      expect(formatPercent(null)).toBe(NOT_MEASURED);
      expect(formatPercent(undefined)).toBe(NOT_MEASURED);
      expect(formatVoltage(null)).toBe(NOT_MEASURED);
      expect(formatResistance(null)).toBe(NOT_MEASURED);
      expect(formatMillivolts(null)).toBe(NOT_MEASURED);
      expect(formatTemperature(null)).toBe(NOT_MEASURED);
      expect(formatCount(null)).toBe(NOT_MEASURED);
      expect(formatLatency(null)).toBe(NOT_MEASURED);
      expect(formatDate(null)).toBe(NOT_MEASURED);
      expect(formatTime(null)).toBe(NOT_MEASURED);
      expect(formatDateTime(null)).toBe(NOT_MEASURED);
      expect(formatIsoUtc(null)).toBe(NOT_MEASURED);
    });

    it('returns "Not measured" for NaN numbers or invalid date strings', () => {
      expect(formatPercent(NaN)).toBe(NOT_MEASURED);
      expect(formatDate('invalid-date')).toBe(NOT_MEASURED);
      expect(formatTime('invalid-date')).toBe(NOT_MEASURED);
      expect(formatDateTime('invalid-date')).toBe(NOT_MEASURED);
      expect(formatIsoUtc('invalid-date')).toBe(NOT_MEASURED);
    });
  });

  describe('Numeric formatters', () => {
    it('formats percentages to 1 decimal place: 85.4%', () => {
      expect(formatPercent(85.4)).toBe('85.4%');
      expect(formatPercent(85.37)).toBe('85.4%');
      expect(formatPercent(100)).toBe('100.0%');
      expect(formatPercent(0)).toBe('0.0%');
    });

    it('formats voltages to 4 decimal places: 3.8172 V', () => {
      expect(formatVoltage(3.8172)).toBe('3.8172 V');
      expect(formatVoltage(53.7459)).toBe('53.7459 V');
      expect(formatVoltage(4)).toBe('4.0000 V');
    });

    it('formats internal resistance to 5 decimal places: 0.00792 Ω', () => {
      expect(formatResistance(0.00792)).toBe('0.00792 Ω');
      expect(formatResistance(-0.00792)).toBe('-0.00792 Ω');
    });

    it('formats millivolts to 2 decimal places: 64.97 mV', () => {
      expect(formatMillivolts(64.97)).toBe('64.97 mV');
      expect(formatMillivolts(50)).toBe('50.00 mV');
    });

    it('formats temperature to 2 decimal places: 32.32 °C', () => {
      expect(formatTemperature(32.32)).toBe('32.32 °C');
      expect(formatTemperature(-20)).toBe('-20.00 °C');
    });

    it('formats integer counts with locale grouping: 1,248', () => {
      expect(formatCount(1248)).toBe('1,248');
      expect(formatCount(0)).toBe('0');
      expect(formatCount(312)).toBe('312');
    });

    it('formats latency in seconds: 0.42 s', () => {
      expect(formatLatency(0.42)).toBe('0.42 s');
      expect(formatLatency(1.5)).toBe('1.50 s');
    });
  });

  describe('Date & Time formatters', () => {
    const timestamp = '2026-06-01T09:30:00Z';

    it('formats dates as "1 June 2026"', () => {
      expect(formatDate(timestamp)).toBe('1 June 2026');
    });

    it('formats time as "9:30 AM"', () => {
      expect(formatTime(timestamp)).toBe('9:30 AM');
    });

    it('formats combined date and time as "1 June 2026, 9:30 AM"', () => {
      expect(formatDateTime(timestamp)).toBe('1 June 2026, 9:30 AM');
    });

    it('formats ISO UTC string as ISO timestamp', () => {
      expect(formatIsoUtc(timestamp)).toBe('2026-06-01T09:30:00.000Z');
    });
  });
});
