import React, { useMemo, useState } from 'react';
import { BookOpen, Search, Skull, Sparkles } from 'lucide-react';
import { CRIT_TABLE_I, FUMBLE_TABLE, lookupCritTableI, lookupFumbleTable } from '../critFumbleTables';
import { ModalDialog, SegmentedTabs } from './ui';

export interface CritFumbleModalProps {
  onClose: () => void;
  initialTab?: 'crit' | 'fumble';
  highlightedRoll?: { kind: 'crit' | 'fumble'; total: number } | null;
}

export function CritFumbleModal({
  onClose,
  initialTab,
  highlightedRoll = null,
}: CritFumbleModalProps) {
  const [activeTab, setActiveTab] = useState<'crit' | 'fumble'>(
    initialTab ?? highlightedRoll?.kind ?? 'crit'
  );
  const [query, setQuery] = useState('');

  const entries = activeTab === 'crit' ? CRIT_TABLE_I : FUMBLE_TABLE;

  const matchedEntry = useMemo(() => {
    if (!highlightedRoll || highlightedRoll.kind !== activeTab) return null;
    return activeTab === 'crit'
      ? lookupCritTableI(highlightedRoll.total)
      : lookupFumbleTable(highlightedRoll.total);
  }, [activeTab, highlightedRoll]);

  const filteredEntries = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (entry) =>
        entry.rollLabel.toLowerCase().includes(q) || entry.text.toLowerCase().includes(q)
    );
  }, [entries, query]);

  return (
    <ModalDialog
      onClose={onClose}
      theme="parchment"
      maxWidthClass="max-w-2xl"
      icon={<BookOpen className="w-4 h-4 text-[#f59e0b]" />}
      title="DCC Crit & Fumble Tables"
      subtitle="4th Printing — Crit Table I (Level 0 / Unskilled) & Table 4-2: Fumbles"
      closeLabel="Close tables"
    >
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <SegmentedTabs<'crit' | 'fumble'>
            value={activeTab}
            onChange={setActiveTab}
            theme="parchment"
            ariaLabel="Crit and Fumble tables"
            options={[
              {
                id: 'crit',
                label: (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#b45309]" /> Crit Table I (1d4 + LCK)
                  </>
                ),
              },
              {
                id: 'fumble',
                label: (
                  <>
                    <Skull className="w-3.5 h-3.5 text-[#991b1b]" /> Table 4-2: Fumbles
                  </>
                ),
              },
            ]}
          />
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#785c3e] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter roll or effect..."
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-[#fdf8ed] border border-[#b89f78] rounded-sm text-[#2c1e16] placeholder-[#8c7051] focus:outline-none focus:border-[#5c3d1e]"
            />
          </div>
        </div>

        {matchedEntry && (
          <div className="bg-[#fef3c7] border border-[#b45309] rounded-sm px-3 py-2 text-xs text-[#2c1e16]">
            <span className="font-bold uppercase tracking-wider text-[10px] text-[#92400e] mr-1.5">
              Last Roll ({highlightedRoll?.total}):
            </span>
            <span className="font-bold mr-1">[{matchedEntry.rollLabel}]</span>
            {matchedEntry.text}
          </div>
        )}

        <div className="max-h-[55vh] overflow-y-auto border border-[#b89f78] rounded-sm bg-[#fdf8ed] divide-y divide-[#e3d2b3]">
          {filteredEntries.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-[#785c3e]">
              No table entries match "{query}".
            </div>
          ) : (
            filteredEntries.map((entry) => {
              const isHighlighted = matchedEntry?.rollLabel === entry.rollLabel;
              return (
                <div
                  key={entry.rollLabel}
                  className={`flex gap-3 px-3 py-2 text-xs leading-relaxed ${
                    isHighlighted ? 'bg-[#fef3c7]' : ''
                  }`}
                >
                  <div className="w-16 shrink-0 font-mono font-bold text-[#5c3d1e]">
                    {entry.rollLabel}
                  </div>
                  <div className="flex-1 text-[#2c1e16]">{entry.text}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </ModalDialog>
  );
}
