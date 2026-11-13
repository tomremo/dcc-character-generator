import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy, Dice5, Download, Printer, RotateCcw, User, Users } from 'lucide-react';
import {
  Alignment,
  Character,
  ShopItem,
  buyEquipmentItem,
  generateCharacter,
  generateRandomName,
  removeInventoryItem,
} from './src/dccData';
import { copyTextReliable, formatPartyMarkdown } from './src/exportUtils';
import { PartyMode, loadSavedPartyState, savePartyState } from './src/storageUtils';
import { CharacterCard } from './src/components/CharacterCard';
import { EquipmentShopModal } from './src/components/EquipmentShopModal';
import { ExportModal } from './src/components/ExportModal';
import { RollLogModal } from './src/components/RollLogModal';
import { Button, SegmentedTabs } from './src/components/ui';

const PARTY_MODE_TABS: ReadonlyArray<{ id: PartyMode; label: React.ReactNode }> = [
  {
    id: 'single',
    label: (
      <>
        <User className="w-4 h-4" aria-hidden="true" /> Single Peasant
      </>
    ),
  },
  {
    id: 'funnel',
    label: (
      <>
        <Users className="w-4 h-4" aria-hidden="true" /> 4-Peasant Funnel
      </>
    ),
  },
];

export default function App() {
  const [initialSaved] = useState(() => loadSavedPartyState());
  const [mode, setMode] = useState<PartyMode>(() => initialSaved?.mode ?? 'funnel');
  const [party, setParty] = useState<Character[]>(() => {
    if (initialSaved) return initialSaved.party;
    const initial: Character[] = [];
    for (let i = 0; i < 4; i++) {
      initial.push(generateCharacter(initial));
    }
    return initial;
  });
  const [storageAvailable, setStorageAvailable] = useState(true);

  useEffect(() => {
    setStorageAvailable(savePartyState(mode, party));
  }, [mode, party]);

  const [activeShopCharId, setActiveShopCharId] = useState<string | null>(null);
  const [activeLogCharId, setActiveLogCharId] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const lastAnnouncementRef = useRef('');
  const copyTimerRef = useRef<number | null>(null);

  const generateNewParty = (count: number) => {
    const newParty: Character[] = [];
    for (let i = 0; i < count; i++) {
      newParty.push(generateCharacter(newParty));
    }
    setParty(newParty);
  };

  const handleModeChange = (newMode: PartyMode) => {
    setMode(newMode);
    generateNewParty(newMode === 'funnel' ? 4 : 1);
  };

  const rerollSingleCharacter = (id: string) => {
    setParty((prev) =>
      prev.map((c) => (c.id === id ? generateCharacter(prev.filter((x) => x.id !== id)) : c))
    );
  };

  const rerollName = (id: string) => {
    const newName = generateRandomName();
    setParty((prev) => prev.map((c) => (c.id === id ? { ...c, name: newName } : c)));
  };

  const updateCharacterName = (id: string, newName: string) => {
    setParty((prev) => prev.map((c) => (c.id === id ? { ...c, name: newName } : c)));
  };

  const updateCharacterAlignment = (id: string, newAlignment: Alignment) => {
    setParty((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const updatedLanguages = c.knownLanguages.map((lang) =>
          lang.endsWith('Alignment Tongue') ? `${newAlignment} Alignment Tongue` : lang
        );
        return { ...c, alignment: newAlignment, knownLanguages: updatedLanguages };
      })
    );
  };

  const adjustHp = (id: string, delta: number) => {
    setParty((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const nextHp = Math.max(0, Math.min(c.maxHp, c.hp + delta));
        return { ...c, hp: nextHp, isDead: nextHp === 0 };
      })
    );
  };

  const toggleDead = (id: string) => {
    setParty((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isDead: !c.isDead } : c))
    );
  };

  const handleBuyItem = (charId: string, item: ShopItem) => {
    setParty((prev) => prev.map((c) => (c.id === charId ? buyEquipmentItem(c, item) : c)));
  };

  const handleRemoveItem = (charId: string, index: number) => {
    setParty((prev) => prev.map((c) => (c.id === charId ? removeInventoryItem(c, index) : c)));
  };

  const announceCopy = (ok: boolean) => {
    if (copyTimerRef.current) {
      window.clearTimeout(copyTimerRef.current);
    }
    let msg = ok ? 'Copied' : 'Copy failed';
    if (msg === lastAnnouncementRef.current) {
      msg += '\u00A0';
    }
    lastAnnouncementRef.current = msg;
    setCopyStatus(ok ? 'copied' : 'failed');
    setStatusMessage(msg);
    copyTimerRef.current = window.setTimeout(() => {
      setCopyStatus('idle');
    }, 2500);
  };

  const handleQuickCopy = async () => {
    const ok = await copyTextReliable(formatPartyMarkdown(party));
    announceCopy(ok);
    if (!ok) {
      setIsExportOpen(true);
    }
  };

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const activeShopChar = party.find((c) => c.id === activeShopCharId) || null;
  const activeLogChar = party.find((c) => c.id === activeLogCharId) || null;

  return (
    <div className="min-h-screen bg-[#14110f] text-[#e7dec8] p-3 md:p-6 print:p-0 print:bg-white print:text-black">
      {/* PRINT-ONLY HEADER (Top of DOM for clean printed sheets) */}
      <div className="hidden print:block text-center mb-3 border-b-2 border-black pb-1.5">
        <h2 className="font-display text-lg font-black uppercase tracking-widest text-black">
          Dungeon Crawl Classics &mdash; Level 0 Peasant Funnel
        </h2>
        <p className="text-[9pt] italic text-black">
          Official Character Creation Rules (4th Printing)
        </p>
      </div>

      {/* HEADER CONTROLS (Hidden in Print Mode) */}
      <header className="max-w-6xl mx-auto mb-6 dcc-panel rounded-md p-4 shadow-2xl print:hidden">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-[#3d2817] rounded-sm flex items-center justify-center border-2 border-[#d4a84f] shadow-inner shrink-0">
              <Dice5 className="w-7 h-7 text-[#f3d37a]" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-display text-xl md:text-2xl font-black tracking-wider text-[#f3d37a] uppercase">
                DCC RPG Level 0 Generator
              </h1>
              <p className="text-xs md:text-sm text-[#c2b293] italic">
                4th Printing Peasant Funnel &bull; Appendix N Character Forge
                <span className="ml-2 not-italic text-[11px] font-mono-stats text-[#d4a84f]">
                  &bull; {storageAvailable ? 'Auto-saved' : 'Storage blocked — use Export .JSON'}
                </span>
              </p>
            </div>
          </div>

          {/* ACTION CONTROLS */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <SegmentedTabs
              options={PARTY_MODE_TABS}
              value={mode}
              onChange={handleModeChange}
              theme="dark"
              ariaLabel="Party size mode"
            />

            <Button
              variant="crimson"
              size="md"
              onClick={() => generateNewParty(mode === 'funnel' ? 4 : 1)}
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" /> Roll New {mode === 'funnel' ? 'Party' : 'Peasant'}
            </Button>

            <span className="relative inline-flex items-center">
              <Button variant="forest" size="md" onClick={handleQuickCopy}>
                {copyStatus === 'copied' ? (
                  <Check className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Copy className="w-4 h-4" aria-hidden="true" />
                )}
                {copyStatus === 'copied' ? 'Copied!' : copyStatus === 'failed' ? 'Copy Failed' : 'Copy Text'}
              </Button>
              <span className="visually-hidden" role="status" aria-live="polite">
                {statusMessage}
              </span>
            </span>

            <Button variant="wood" size="md" onClick={() => setIsExportOpen(true)}>
              <Download className="w-4 h-4" aria-hidden="true" /> Export
            </Button>

            <Button variant="slate" size="md" onClick={() => window.print()}>
              <Printer className="w-4 h-4" aria-hidden="true" /> Print
            </Button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl mx-auto">
        <div
          className={`grid gap-5 ${
            mode === 'funnel'
              ? 'grid-cols-1 lg:grid-cols-2 print-funnel-grid'
              : 'grid-cols-1 max-w-2xl mx-auto'
          }`}
        >
          {party.map((char) => (
            <CharacterCard
              key={char.id}
              char={char}
              onReroll={() => rerollSingleCharacter(char.id)}
              onRerollName={() => rerollName(char.id)}
              onUpdateName={(newName) => updateCharacterName(char.id, newName)}
              onUpdateAlignment={(align) => updateCharacterAlignment(char.id, align)}
              onAdjustHp={(delta) => adjustHp(char.id, delta)}
              onToggleDead={() => toggleDead(char.id)}
              onRemoveItem={(idx) => handleRemoveItem(char.id, idx)}
              onOpenShop={() => setActiveShopCharId(char.id)}
              onOpenLog={() => setActiveLogCharId(char.id)}
            />
          ))}
        </div>
      </main>

      {/* SHOP MODAL */}
      {activeShopChar && (
        <EquipmentShopModal
          character={activeShopChar}
          onClose={() => setActiveShopCharId(null)}
          onBuy={(item) => handleBuyItem(activeShopChar.id, item)}
          onRemoveItem={(idx) => handleRemoveItem(activeShopChar.id, idx)}
        />
      )}

      {/* ROLL BREAKDOWN LOG MODAL */}
      {activeLogChar && (
        <RollLogModal
          character={activeLogChar}
          onClose={() => setActiveLogCharId(null)}
        />
      )}

      {/* EXPORT MODAL */}
      {isExportOpen && (
        <ExportModal
          party={party}
          onImportParty={(imported) => {
            setParty(imported);
            setMode(imported.length === 1 ? 'single' : 'funnel');
          }}
          onClose={() => setIsExportOpen(false)}
        />
      )}
    </div>
  );
}
