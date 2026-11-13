import { describe, expect, it } from 'vitest';
import { generateCharacter } from '../dccData';
import {
  formatPartyCSV,
  formatPartyJSON,
  formatPartyMarkdown,
  formatPartyPrintableHTML,
} from '../exportUtils';

describe('Export utilities', () => {
  it('formats markdown, JSON, CSV, and printable HTML cleanly', () => {
    const party = [generateCharacter([]), generateCharacter([])];
    party[0].name = 'Agnes "The Bold" <Test>';

    const md = formatPartyMarkdown(party);
    expect(md).toContain('AGNES "THE BOLD" <TEST>');
    expect(md).toContain('Crit:');
    expect(md).toContain('XP:');

    const json = formatPartyJSON(party);
    const parsed = JSON.parse(json);
    expect(parsed.level).toBe(0);
    expect(Array.isArray(parsed.characters)).toBe(true);
    expect(parsed.characters).toHaveLength(2);

    const csv = formatPartyCSV(party);
    expect(csv.split('\n')).toHaveLength(3);
    expect(csv).toContain('"Agnes ""The Bold"" <Test>"');

    const html = formatPartyPrintableHTML(party);
    expect(html).toContain('<!doctype html>');
    expect(html).toContain('@media print');
    expect(html).toContain('Agnes &quot;The Bold&quot; &lt;Test&gt;');
  });
});
