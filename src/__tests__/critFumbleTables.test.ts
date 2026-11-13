import { describe, expect, it } from 'vitest';
import {
  CRIT_TABLE_I,
  FUMBLE_TABLE,
  lookupCritTableI,
  lookupFumbleTable,
} from '../critFumbleTables';

describe('Crit Table I & Table 4-2: Fumbles', () => {
  it('has complete 4th Printing entry counts', () => {
    expect(CRIT_TABLE_I).toHaveLength(21);
    expect(FUMBLE_TABLE).toHaveLength(17);
  });

  it('looks up Crit Table I bounds and middle values accurately', () => {
    expect(lookupCritTableI(-3).rollLabel).toBe('0 or less');
    expect(lookupCritTableI(0).rollLabel).toBe('0 or less');
    expect(lookupCritTableI(1).text).toContain('+1d3 damage');
    expect(lookupCritTableI(8).text).toContain('unable to attack next round');
    expect(lookupCritTableI(20).rollLabel).toBe('20+');
    expect(lookupCritTableI(25).rollLabel).toBe('20+');
  });

  it('looks up Fumble Table bounds and middle values accurately', () => {
    expect(lookupFumbleTable(-2).rollLabel).toBe('0 or less');
    expect(lookupFumbleTable(0).rollLabel).toBe('0 or less');
    expect(lookupFumbleTable(1).text).toContain('laughingstock');
    expect(lookupFumbleTable(12).text).toContain('randomly determined ally');
    expect(lookupFumbleTable(16).rollLabel).toBe('16+');
    expect(lookupFumbleTable(22).rollLabel).toBe('16+');
  });
});
