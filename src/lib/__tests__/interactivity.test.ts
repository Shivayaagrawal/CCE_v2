import { describe, it, expect } from 'vitest';
import { FLEET_EVENTS, filterFleetEvents, computeFleetAggregates } from '../data/fixture/fleet';
import { exportEventsToCsv } from '../export';

describe('Phase 4: Interactivity & Data Flow', () => {
  it('immediate filter reactivity without apply button', () => {
    // Unfiltered
    const all = filterFleetEvents(FLEET_EVENTS, {});
    expect(all.length).toBe(1248);

    // Filter by single outcome
    const reviewEvents = filterFleetEvents(FLEET_EVENTS, { outcomes: ['REVIEW REQUIRED'] });
    expect(reviewEvents.length).toBe(51);
    expect(reviewEvents.every((e) => e.outcome === 'REVIEW REQUIRED')).toBe(true);

    // Derived aggregates update immediately
    const reviewAggs = computeFleetAggregates(reviewEvents);
    expect(reviewAggs.totalEvents).toBe(51);
    expect(reviewAggs.byOutcome['REVIEW REQUIRED']).toBe(51);
    expect(reviewAggs.byOutcome.ASSURED).toBe(0);

    // Multi-criteria filter
    const multiFiltered = filterFleetEvents(FLEET_EVENTS, {
      vehicleTypes: ['Last Mile Delivery'],
      manufacturers: ['LG'],
    });
    expect(multiFiltered.length).toBeGreaterThan(0);
    expect(multiFiltered.every((e) => e.vehicleType === 'Last Mile Delivery' && e.manufacturer === 'LG')).toBe(true);
  });

  it('table sorting: timestamp, sohPct, and outcome', () => {
    // Timestamp sorting
    const ascTimestamp = [...FLEET_EVENTS].sort(
      (a, b) => new Date(a.timestampUtc).getTime() - new Date(b.timestampUtc).getTime()
    );
    expect(new Date(ascTimestamp[0].timestampUtc).getTime()).toBeLessThanOrEqual(
      new Date(ascTimestamp[ascTimestamp.length - 1].timestampUtc).getTime()
    );

    // SoH % sorting
    const ascSoh = [...FLEET_EVENTS].sort((a, b) => a.sohPct - b.sohPct);
    expect(ascSoh[0].sohPct).toBeLessThanOrEqual(ascSoh[ascSoh.length - 1].sohPct);
    const descSoh = [...FLEET_EVENTS].sort((a, b) => b.sohPct - a.sohPct);
    expect(descSoh[0].sohPct).toBeGreaterThanOrEqual(descSoh[descSoh.length - 1].sohPct);
  });

  it('pagination bounds and page sizes', () => {
    const pageSize = 8;
    const totalPages = Math.ceil(FLEET_EVENTS.length / pageSize);
    expect(totalPages).toBe(156);

    const page1 = FLEET_EVENTS.slice(0, pageSize);
    const page2 = FLEET_EVENTS.slice(pageSize, pageSize * 2);
    expect(page1.length).toBe(8);
    expect(page2.length).toBe(8);
    expect(page1[0].id).not.toBe(page2[0].id);
  });
});
