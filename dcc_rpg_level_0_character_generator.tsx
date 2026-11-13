import React, { useState, useEffect, useRef, useId } from 'react';
import {
  Dice5, User, Users, Printer, Copy, RotateCcw,
  ShoppingBag, FileText, Shield, Heart, Zap, Swords,
  Sparkles, Check, Coins, X, Download, Skull, Plus, Minus, Pencil
} from 'lucide-react';
import {
  Alignment,
  Character,
  SHOP_ITEMS,
  ShopItem,
  SOBRIQUET_NAMES,
  buyEquipmentItem,
  formatCoins,
  formatMod,
  generateCharacter,
  getShieldRestrictionReason,
} from './src/dccData';
import {
  copyTextReliable,
  downloadFileReliable,
  formatPartyCSV,
  formatPartyJSON,
  formatPartyMarkdown,
  formatPartyPrintableHTML,
} from './src/exportUtils';

// ==========================================
// NATIVE <dialog> HOOK (modern-web-guidance)
// ==========================================

function useModalDialog(onClose: () => void) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (!dialog.open) {
      dialog.showModal();
    }

    const handleClose = () => {
      onClose();
    };
    dialog.addEventListener('close', handleClose);

    // Fallback light-dismiss for browsers without closedby="any" (e.g., Safari)
    let cleanupFallback: (() => void) | undefined;
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      let pressedOutside = false;
      const isOutside = (e: PointerEvent) => {
        const r = dialog.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      const onPointerDown = (e: PointerEvent) => {
        pressedOutside = isOutside(e);
      };
      const onPointerUp = (e: PointerEvent) => {
        if (pressedOutside && isOutside(e)) {
          dialog.close();
        }
      };
      dialog.addEventListener('pointerdown', onPointerDown);
      dialog.addEventListener('pointerup', onPointerUp);
      cleanupFallback = () => {
        dialog.removeEventListener('pointerdown', onPointerDown);
        dialog.removeEventListener('pointerup', onPointerUp);
      };
    }

    return () => {
      dialog.removeEventListener('close', handleClose);
      cleanupFallback?.();
      if (dialog.open) {
        dialog.close();
      }
    };
  }, [onClose]);

  return dialogRef;
}

// ==========================================
// MAIN APP COMPONENT
// ==========================================

export default function App() {
  const [mode, setMode] = useState<'single' | 'funnel'>('funnel');
  const [party, setParty] = useState<Character[]>(() => {
    const initial: Character[] = [];
    for (let i = 0; i < 4; i++) {
      initial.push(generateCharacter(initial));
    }
    return initial;
  });
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

  const handleModeChange = (newMode: 'single' | 'funnel') => {
    setMode(newMode);
    generateNewParty(newMode === 'funnel' ? 4 : 1);
  };

  const rerollSingleCharacter = (id: string) => {
    setParty((prev) =>
      prev.map((c) => (c.id === id ? generateCharacter(prev.filter((x) => x.id !== id)) : c))
    );
  };

  const rerollName = (id: string) => {
    const newName = SOBRIQUET_NAMES[Math.floor(Math.random() * SOBRIQUET_NAMES.length)];
    setParty((prev) => prev.map((c) => (c.id === id ? { ...c, name: newName } : c)));
  };

  const updateCharacterName = (id: string, newName: string) => {
    setParty((prev) => prev.map((c) => (c.id === id ? { ...c, name: newName } : c)));
  };

  const updateCharacterAlignment = (id: string, newAlignment: Alignment) => {
    setParty((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const oldAlignTongue = `${c.alignment} Alignment Tongue`;
        const newAlignTongue = `${newAlignment} Alignment Tongue`;
        const updatedLangs = c.knownLanguages.map((l) => (l === oldAlignTongue ? newAlignTongue : l));
        return {
          ...c,
          alignment: newAlignment,
          knownLanguages: updatedLangs,
        };
      })
    );
  };

  const adjustHp = (id: string, delta: number) => {
    setParty((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const nextHp = Math.max(0, Math.min(c.maxHp, c.hp + delta));
        return {
          ...c,
          hp: nextHp,
          isDead: nextHp === 0 ? true : c.isDead && delta > 0 ? false : c.isDead,
        };
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
      setStatusMessage('');
    }, 2500);
  };

  const handleQuickCopy = async () => {
    const text = formatPartyMarkdown(party);
    const ok = await copyTextReliable(text);
    announceCopy(ok);
    if (!ok) {
      setIsExportOpen(true);
    }
  };

  const activeShopChar = party.find((c) => c.id === activeShopCharId);
  const activeLogChar = party.find((c) => c.id === activeLogCharId);

  return (
    <div className="min-h-screen bg-[#14110f] text-[#e7dec8] font-body p-3 md:p-6 print:bg-white print:text-black print:p-0">
      {/* PRINT-ONLY HEADER (Placed at top of DOM so it prints before sheets) */}
      <div className="hidden print:block text-center mb-3 border-b-2 border-black pb-1.5">
        <h2 className="font-display text-lg font-black uppercase tracking-widest text-black">
          Dungeon Crawl Classics &mdash; Level 0 Peasant Funnel
        </h2>
        <p className="text-[9pt] italic text-black">
          Official Character Creation Rules (4th Printing)
        </p>
      </div>

      {/* HEADER CONTROLS (Hidden in Print Mode) */}
      <header className="max-w-6xl mx-auto mb-6 bg-[#1f1914] border-2 border-[#7c5828] rounded-md p-4 shadow-2xl print:hidden">
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
              </p>
            </div>
          </div>

          {/* ACTION CONTROLS */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {/* Mode Switcher */}
            <div className="flex bg-[#14110f] p-1 rounded border border-[#5c3d1e]" role="group" aria-label="Party size mode">
              <button
                type="button"
                aria-pressed={mode === 'single'}
                onClick={() => handleModeChange('single')}
                className={`px-3 py-1.5 rounded-sm text-xs md:text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  mode === 'single'
                    ? 'bg-[#7c5828] text-[#fef3c7] shadow'
                    : 'text-[#c2b293] hover:text-white'
                }`}
              >
                <User className="w-4 h-4" aria-hidden="true" /> Single Peasant
              </button>
              <button
                type="button"
                aria-pressed={mode === 'funnel'}
                onClick={() => handleModeChange('funnel')}
                className={`px-3 py-1.5 rounded-sm text-xs md:text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  mode === 'funnel'
                    ? 'bg-[#7c5828] text-[#fef3c7] shadow'
                    : 'text-[#c2b293] hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" aria-hidden="true" /> 4-Peasant Funnel
              </button>
            </div>

            {/* Re-roll All */}
            <button
              type="button"
              onClick={() => generateNewParty(mode === 'funnel' ? 4 : 1)}
              className="px-3 py-2 bg-[#8b1a1a] hover:bg-[#6e1313] text-[#fef2f2] rounded-sm text-xs md:text-sm font-bold flex items-center gap-1.5 shadow transition border border-[#fca5a5]/30 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" /> Roll New {mode === 'funnel' ? 'Party' : 'Peasant'}
            </button>

            {/* Quick Copy */}
            <span className="relative inline-flex items-center">
              <button
                type="button"
                onClick={handleQuickCopy}
                className="px-3 py-2 bg-[#2d4a1e] hover:bg-[#1f3514] text-[#d9f99d] rounded-sm text-xs md:text-sm font-bold flex items-center gap-1.5 shadow transition border border-[#bef264]/30 cursor-pointer"
              >
                {copyStatus === 'copied' ? (
                  <Check className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Copy className="w-4 h-4" aria-hidden="true" />
                )}
                {copyStatus === 'copied' ? 'Copied!' : copyStatus === 'failed' ? 'Copy Failed' : 'Copy Text'}
              </button>
              <span className="visually-hidden" role="status" aria-live="polite">
                {statusMessage}
              </span>
            </span>

            {/* Export / Download Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsExportOpen(true)}
              className="px-3 py-2 bg-[#3d2817] hover:bg-[#523620] text-[#f3d37a] rounded-sm text-xs md:text-sm font-bold flex items-center gap-1.5 shadow transition border border-[#7c5828] cursor-pointer"
            >
              <Download className="w-4 h-4" aria-hidden="true" /> Export
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-2 bg-[#29221c] hover:bg-[#3d332a] text-[#e7dec8] rounded-sm text-xs md:text-sm font-bold flex items-center gap-1.5 shadow transition border border-[#786a58] cursor-pointer"
            >
              <Printer className="w-4 h-4" aria-hidden="true" /> Print
            </button>
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
          onClose={() => setIsExportOpen(false)}
        />
      )}
    </div>
  );
}

// ==========================================
// CHARACTER CARD COMPONENT
// ==========================================

interface CharacterCardProps {
  char: Character;
  onReroll: () => void;
  onRerollName: () => void;
  onUpdateName: (name: string) => void;
  onUpdateAlignment: (align: Alignment) => void;
  onAdjustHp: (delta: number) => void;
  onToggleDead: () => void;
  onOpenShop: () => void;
  onOpenLog: () => void;
}

function CharacterCard({
  char,
  onReroll,
  onRerollName,
  onUpdateName,
  onUpdateAlignment,
  onAdjustHp,
  onToggleDead,
  onOpenShop,
  onOpenLog,
}: CharacterCardProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(char.name);
  const nameInputId = useId();
  const alignSelectId = useId();

  useEffect(() => {
    setTempName(char.name);
  }, [char.name]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateName(tempName.trim() || char.name);
    setIsEditingName(false);
  };

  return (
    <article
      className={`dcc-sheet relative rounded-sm p-4 print:p-2.5 flex flex-col justify-between transition-opacity ${
        char.isDead ? 'opacity-80' : ''
      }`}
    >
      {/* DECEASED STAMP OVERLAY */}
      {char.isDead && (
        <div
          className="pointer-events-none absolute top-14 right-4 z-10 border-2 border-[#8b1a1a] text-[#8b1a1a] bg-[#f4ebd0]/90 px-2.5 py-0.5 font-display font-black text-xs uppercase tracking-widest -rotate-6 shadow-sm print:bg-white print:text-black print:border-black"
          aria-label="Character is deceased"
        >
          Deceased
        </div>
      )}

      <div>
        {/* CARD HEADER */}
        <div className="flex items-start justify-between border-b-2 border-[#3d2817] pb-2 mb-2.5 gap-2">
          <div className="flex-1 min-w-0">
            {isEditingName ? (
              <form onSubmit={handleNameSubmit} className="flex items-center gap-1.5">
                <label htmlFor={nameInputId} className="visually-hidden">
                  Character Name
                </label>
                <input
                  id={nameInputId}
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="px-2 py-0.5 bg-white border border-[#5c3d1e] rounded-sm text-sm font-bold text-[#1a1410] w-full"
                  autoFocus
                  onBlur={handleNameSubmit}
                />
                <button
                  type="submit"
                  className="text-xs bg-[#3d2817] text-[#fef3c7] px-2.5 py-1 rounded-sm font-bold shrink-0 cursor-pointer"
                >
                  Save
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-1.5">
                <h2 className="font-display text-base md:text-lg font-black text-[#1a1410] uppercase tracking-wide truncate">
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="text-left hover:underline decoration-[#8b1a1a] cursor-pointer inline-flex items-center gap-1.5"
                    aria-label={`Edit name ${char.name}`}
                  >
                    <span>{char.name}</span>
                    <Pencil className="w-3 h-3 text-[#6b4c2e] print:hidden shrink-0" aria-hidden="true" />
                  </button>
                </h2>
                <button
                  type="button"
                  onClick={onRerollName}
                  className="p-1 text-[#5c3d1e] hover:text-[#8b1a1a] print:hidden cursor-pointer shrink-0"
                  aria-label={`Randomize sobriquet for ${char.name}`}
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            )}

            <p className="text-xs md:text-sm font-bold text-[#6e2c14] uppercase tracking-wider mt-0.5">
              {char.title} <span className="text-[#3d2817]">({char.race})</span>
              <span className="ml-2 font-mono-stats text-[11px] text-[#4a3728] font-semibold">
                &bull; XP: {char.xp}/10
              </span>
            </p>
          </div>

          {/* ALIGNMENT & SHEET CONTROLS */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="flex items-center gap-1 print:hidden">
              <label htmlFor={alignSelectId} className="visually-hidden">
                Alignment for {char.name}
              </label>
              <select
                id={alignSelectId}
                value={char.alignment}
                onChange={(e) => onUpdateAlignment(e.target.value as Alignment)}
                className="bg-[#eadbb8] border border-[#5c3d1e] text-[#1a1410] font-bold text-xs rounded-sm px-1.5 py-1 cursor-pointer"
              >
                <option value="Lawful">Lawful</option>
                <option value="Neutral">Neutral</option>
                <option value="Chaotic">Chaotic</option>
              </select>

              <button
                type="button"
                onClick={onToggleDead}
                aria-pressed={char.isDead}
                aria-label={char.isDead ? `Revive ${char.name}` : `Mark ${char.name} deceased`}
                className={`p-1.5 rounded-sm border transition cursor-pointer ${
                  char.isDead
                    ? 'bg-[#8b1a1a] text-white border-[#5c1010]'
                    : 'bg-[#eadbb8] text-[#4a3728] border-[#5c3d1e] hover:text-[#8b1a1a]'
                }`}
              >
                <Skull className="w-3.5 h-3.5" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onReroll}
                aria-label={`Re-roll ${char.name}`}
                className="p-1.5 bg-[#8b1a1a] hover:bg-[#6e1313] text-white rounded-sm shadow-sm transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>

            <span className="hidden print:inline text-xs font-bold uppercase text-black border border-black px-1.5 py-0.5">
              {char.alignment}
            </span>
          </div>
        </div>

        {/* CORE ABILITIES STRIP (3d6 Straight) */}
        <div className="grid grid-cols-6 gap-1.5 mb-2.5 text-center">
          {[
            { label: 'STR', val: char.abilities.str, mod: char.abilityMods.strMod },
            { label: 'AGI', val: char.abilities.agi, mod: char.abilityMods.agiMod },
            { label: 'STA', val: char.abilities.sta, mod: char.abilityMods.staMod },
            { label: 'PER', val: char.abilities.per, mod: char.abilityMods.perMod },
            { label: 'INT', val: char.abilities.int, mod: char.abilityMods.intMod },
            { label: 'LCK', val: char.abilities.lck, mod: char.abilityMods.luckMod },
          ].map((stat) => (
            <div key={stat.label} className="dcc-stat-box rounded-sm py-1 px-0.5 flex flex-col items-center">
              <span className="font-display text-[10px] font-bold text-[#4a3728] tracking-wider">
                {stat.label}
              </span>
              <span className="font-mono-stats text-sm md:text-base font-bold text-[#1a1410] leading-tight">
                {stat.val}
              </span>
              <span
                className={`font-mono-stats text-[11px] font-bold leading-tight ${
                  stat.mod > 0
                    ? 'text-[#1e5631] print:text-black'
                    : stat.mod < 0
                    ? 'text-[#8b1a1a] print:text-black'
                    : 'text-[#5c4938] print:text-black'
                }`}
              >
                {formatMod(stat.mod)}
              </span>
            </div>
          ))}
        </div>

        {/* COMBAT & DERIVED STATS */}
        <div className="grid grid-cols-4 gap-1.5 mb-2.5 text-center">
          <div className="dcc-rule-box rounded-sm p-1.5 flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-[#4a3728] uppercase flex items-center gap-0.5">
              <Heart className="w-3 h-3 text-[#8b1a1a]" aria-hidden="true" /> HP
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onAdjustHp(-1)}
                aria-label={`Decrease HP for ${char.name}`}
                className="print:hidden w-5 h-5 flex items-center justify-center rounded-sm bg-[#eadbb8] hover:bg-[#dcc594] text-[#3d2817] border border-[#7c5828] cursor-pointer"
              >
                <Minus className="w-2.5 h-2.5" aria-hidden="true" />
              </button>
              <span className="font-mono-stats text-base font-bold text-[#8b1a1a] print:text-black">
                {char.hp}
                <span className="text-[11px] text-[#5c4938] font-normal">/{char.maxHp}</span>
              </span>
              <button
                type="button"
                onClick={() => onAdjustHp(1)}
                aria-label={`Increase HP for ${char.name}`}
                className="print:hidden w-5 h-5 flex items-center justify-center rounded-sm bg-[#eadbb8] hover:bg-[#dcc594] text-[#3d2817] border border-[#7c5828] cursor-pointer"
              >
                <Plus className="w-2.5 h-2.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="dcc-rule-box rounded-sm p-1.5 flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-[#4a3728] uppercase flex items-center gap-0.5">
              <Shield className="w-3 h-3 text-[#2b4c7e]" aria-hidden="true" /> AC
            </span>
            <span className="font-mono-stats text-base font-bold text-[#1a1410]">{char.ac}</span>
            <span className="text-[10px] text-[#4a3728] leading-tight truncate max-w-full">
              {char.armor}
            </span>
          </div>

          <div className="dcc-rule-box rounded-sm p-1.5 flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-[#4a3728] uppercase flex items-center gap-0.5">
              <Zap className="w-3 h-3 text-[#92400e]" aria-hidden="true" /> INIT
            </span>
            <span className="font-mono-stats text-base font-bold text-[#1a1410]">
              {formatMod(char.initMod)}
            </span>
            <span className="font-mono-stats text-[10px] text-[#4a3728] leading-tight">
              {char.initDie}
              {char.weapon.isTwoHanded ? ' (2H)' : ''}
            </span>
          </div>

          <div className="dcc-rule-box rounded-sm p-1.5 flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-[#4a3728] uppercase">SPEED</span>
            <span className="font-mono-stats text-base font-bold text-[#1a1410]">{char.speed}'</span>
            <span className="font-mono-stats text-[10px] text-[#4a3728] leading-tight">
              Act: 1d20
            </span>
          </div>
        </div>

        {/* SAVING THROWS, CRIT, FUMBLE & CHECK PENALTY */}
        <div className="dcc-rule-box rounded-sm px-2.5 py-1.5 mb-2.5 text-xs flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <div className="flex items-center gap-2.5 font-mono-stats">
            <span>
              <strong className="font-body text-[#4a3728]">FORT</strong> {formatMod(char.saves.fort)}
            </span>
            <span>
              <strong className="font-body text-[#4a3728]">REF</strong> {formatMod(char.saves.ref)}
            </span>
            <span>
              <strong className="font-body text-[#4a3728]">WILL</strong> {formatMod(char.saves.will)}
            </span>
          </div>
          <div className="flex items-center gap-2.5 font-mono-stats text-[11px] text-[#3d2817]">
            <span>
              Crit: {char.critDie} Tbl {char.critTable} ({formatMod(char.critBonus)})
            </span>
            <span>
              Fumble: {char.fumbleDie} ({formatMod(char.fumbleMod)})
            </span>
            <span>Chk: {char.checkPenalty}</span>
          </div>
        </div>

        {/* TRAINED WEAPON BLOCK */}
        <div className="dcc-rule-box rounded-sm p-2 mb-2.5">
          <div className="flex items-center justify-between border-b border-[#8c6d46]/50 pb-1 mb-1">
            <span className="text-xs font-display font-bold text-[#3d2817] uppercase flex items-center gap-1">
              <Swords className="w-3.5 h-3.5 text-[#8b1a1a]" aria-hidden="true" /> Trained Weapon
            </span>
            <span className="font-mono-stats text-xs font-bold text-[#8b1a1a] print:text-black">
              Atk {formatMod(char.weapon.attBonus)} | Dmg {char.weapon.damage}
              {char.weapon.dmgBonus !== 0 ? formatMod(char.weapon.dmgBonus) : ''}
              {char.weapon.dmgBonus < 0 ? ' (min 1)' : ''}
            </span>
          </div>
          <div className="flex flex-wrap justify-between items-center text-xs font-bold text-[#1a1410] gap-1">
            <span>
              {char.weapon.name}
              {char.weapon.ammo ? ` (${char.weapon.ammo})` : ''}
            </span>
            {char.weapon.range !== '-' && (
              <span className="font-mono-stats text-[11px] font-normal text-[#4a3728]">
                Range: {char.weapon.range}
              </span>
            )}
          </div>
          {char.weapon.type === 'melee/thrown' && char.weapon.thrownAttBonus !== undefined && (
            <div className="font-mono-stats text-[11px] text-[#4a3728] mt-1 pt-1 border-t border-dashed border-[#8c6d46]/40">
              Thrown: Atk {formatMod(char.weapon.thrownAttBonus)} | Dmg {char.weapon.damage}
              {(char.weapon.thrownDmgBonus ?? 0) !== 0
                ? formatMod(char.weapon.thrownDmgBonus ?? 0)
                : ''}
              {char.abilityMods.strMod !== 0
                ? ` (${formatMod(char.abilityMods.strMod)} STR close range)`
                : ''}
            </div>
          )}
        </div>

        {/* BIRTH AUGUR BLOCK */}
        <div className="bg-[#eadbb8] border border-[#5c3d1e] rounded-sm p-2 mb-2.5 text-xs print:bg-white print:border-black">
          <div className="flex items-center justify-between gap-2 font-bold text-[#3d2817]">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#8b1a1a]" aria-hidden="true" />
              Birth Augur #{char.augur.id}: {char.augur.name}
            </span>
            <span className="font-mono-stats font-bold">
              Luck {formatMod(char.abilityMods.luckMod)}
            </span>
          </div>
          <p className="text-xs text-[#2b1d0e] italic mt-0.5">{char.augur.desc}</p>
        </div>

        {/* EQUIPMENT, TRADE GOODS, PURSE & LANGUAGES */}
        <dl className="space-y-1 mb-2.5 text-xs">
          <div className="flex justify-between gap-3">
            <dt className="font-bold text-[#4a3728] shrink-0">Trade Goods:</dt>
            <dd className="font-semibold text-right text-[#1a1410]">{char.tradeItem}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="font-bold text-[#4a3728] shrink-0">Inventory:</dt>
            <dd className="font-medium text-right text-[#1a1410]">{char.inventory.join(', ')}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="font-bold text-[#4a3728] shrink-0">Purse:</dt>
            <dd className="font-mono-stats font-bold text-[#6e2c14] flex items-center gap-1 print:text-black">
              <Coins className="w-3.5 h-3.5 inline" aria-hidden="true" /> {formatCoins(char.coins)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="font-bold text-[#4a3728] shrink-0">Languages:</dt>
            <dd className="font-medium text-right text-[#1a1410]">
              {char.knownLanguages.join(', ')}
            </dd>
          </div>
        </dl>

        {/* SPECIAL NOTES */}
        {char.specialNotes.length > 0 && (
          <div className="bg-[#f8e7e2] border border-[#991b1b]/50 rounded-sm p-1.5 mb-2.5 text-[11px] text-[#6e1313] font-medium leading-snug print:bg-white print:text-black print:border-black">
            <strong>Notes:</strong> {char.specialNotes.join(' ')}
          </div>
        )}
      </div>

      {/* FOOTER BUTTONS */}
      <div className="pt-2 border-t border-[#5c3d1e]/50 flex items-center justify-between print:hidden">
        <button
          type="button"
          onClick={onOpenShop}
          className="px-3 py-1.5 bg-[#3d2817] hover:bg-[#523620] text-[#f3d37a] rounded-sm text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" /> Buy Gear
        </button>

        <button
          type="button"
          onClick={onOpenLog}
          className="px-3 py-1.5 bg-[#29221c] hover:bg-[#3d332a] text-[#e7dec8] rounded-sm text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" aria-hidden="true" /> Dice Log
        </button>
      </div>
    </article>
  );
}

// ==========================================
// EQUIPMENT SHOP MODAL (Native <dialog>)
// ==========================================

interface EquipmentShopModalProps {
  character: Character;
  onClose: () => void;
  onBuy: (item: ShopItem) => void;
}

function EquipmentShopModal({ character, onClose, onBuy }: EquipmentShopModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Adventuring Gear' | 'Weapons' | 'Armor'>('All');
  const titleId = useId();
  const dialogRef = useModalDialog(onClose);

  const categories: Array<'All' | 'Adventuring Gear' | 'Weapons' | 'Armor'> = [
    'All',
    'Adventuring Gear',
    'Weapons',
    'Armor',
  ];

  const filteredItems = SHOP_ITEMS.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  const shieldRestriction = getShieldRestrictionReason(character);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      {...({ closedby: 'any' } as Record<string, string>)}
      className="w-full max-w-lg rounded-md shadow-2xl"
    >
      <div className="dcc-sheet rounded-md p-4 max-h-[88dvh] flex flex-col">
        <div className="flex items-center justify-between border-b-2 border-[#3d2817] pb-2 mb-3">
          <div>
            <h3 id={titleId} className="font-display text-lg font-black text-[#1a1410] uppercase flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#8b1a1a]" aria-hidden="true" /> Village Outfitter
            </h3>
            <p className="text-xs text-[#4a3728] font-bold">
              Buyer: {character.name} &bull; Purse:{' '}
              <span className="font-mono-stats text-[#6e2c14]">{formatCoins(character.coins)}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close equipment shop"
            className="p-1.5 hover:bg-[#eadbb8] rounded-sm text-[#3d2817] cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* CATEGORY TABS */}
        <div className="flex gap-1 mb-3 bg-[#eadbb8] p-1 rounded-sm border border-[#5c3d1e]">
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-sm transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#3d2817] text-[#fef3c7] shadow'
                  : 'text-[#3d2817] hover:bg-[#f4ebd0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ITEMS LIST */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredItems.map((item) => {
            const canAfford = character.coins >= item.cost;
            const shieldBlocked = item.type === 'shield' ? shieldRestriction : null;
            const disabled = !canAfford || Boolean(shieldBlocked);

            return (
              <div
                key={item.name}
                className="flex items-center justify-between p-2 dcc-rule-box rounded-sm gap-2"
              >
                <div>
                  <h4 className="text-xs font-bold text-[#1a1410]">{item.name}</h4>
                  <span className="font-mono-stats text-[11px] font-semibold text-[#6e2c14]">
                    Cost: {formatCoins(item.cost)}
                  </span>
                  {shieldBlocked && (
                    <p className="text-[10px] text-[#8b1a1a] font-semibold mt-0.5">
                      {shieldBlocked}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onBuy(item)}
                  disabled={disabled}
                  className={`px-3 py-1.5 rounded-sm text-xs font-bold shadow-sm transition shrink-0 ${
                    !disabled
                      ? 'bg-[#2d4a1e] hover:bg-[#1f3514] text-[#d9f99d] cursor-pointer'
                      : 'bg-[#a89f91] text-[#e7dec8] cursor-not-allowed'
                  }`}
                >
                  Buy
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-2 border-t border-[#5c3d1e] flex justify-end">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="px-4 py-1.5 bg-[#3d2817] text-[#fef3c7] rounded-sm font-bold text-xs hover:bg-[#523620] cursor-pointer"
          >
            Done Shopping
          </button>
        </div>
      </div>
    </dialog>
  );
}

// ==========================================
// ROLL BREAKDOWN / DICE LOG MODAL
// ==========================================

interface RollLogModalProps {
  character: Character;
  onClose: () => void;
}

function RollLogModal({ character, onClose }: RollLogModalProps) {
  const titleId = useId();
  const dialogRef = useModalDialog(onClose);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      {...({ closedby: 'any' } as Record<string, string>)}
      className="w-full max-w-md rounded-md shadow-2xl"
    >
      <div className="bg-[#1c1714] border-2 border-[#7c5828] rounded-md p-4 text-[#e7dec8] max-h-[85dvh] flex flex-col font-mono-stats text-xs">
        <div className="flex items-center justify-between border-b border-[#4a3728] pb-2 mb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#f3d37a]" aria-hidden="true" />
            <h3 id={titleId} className="font-display text-base font-bold text-[#f3d37a]">
              Dice Log: {character.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close dice log"
            className="p-1 text-[#c2b293] hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 bg-[#110e0c] p-3 rounded-sm border border-[#3d2817]">
          {character.diceLog.map((entry, idx) => (
            <div key={idx} className="text-[#bef264] border-b border-[#1f1914] pb-1">
              &gt; {entry}
            </div>
          ))}
        </div>

        <div className="mt-3 pt-2 border-t border-[#4a3728] flex justify-end">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="px-4 py-1.5 bg-[#7c5828] text-[#fef3c7] rounded-sm font-bold text-xs hover:bg-[#5c3d1e] cursor-pointer"
          >
            Close Log
          </button>
        </div>
      </div>
    </dialog>
  );
}

// ==========================================
// EXPORT MODAL (Iframe-Safe Copy & Download)
// ==========================================

interface ExportModalProps {
  party: Character[];
  onClose: () => void;
}

function ExportModal({ party, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<'text' | 'json' | 'csv'>('text');
  const [modalCopyState, setModalCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const titleId = useId();
  const previewId = useId();
  const dialogRef = useModalDialog(onClose);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const previewText =
    format === 'text'
      ? formatPartyMarkdown(party)
      : format === 'json'
      ? formatPartyJSON(party)
      : formatPartyCSV(party);

  const handleCopyFromModal = async () => {
    const ok = await copyTextReliable(previewText);
    setModalCopyState(ok ? 'copied' : 'failed');
    if (!ok && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
    setTimeout(() => setModalCopyState('idle'), 2500);
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      {...({ closedby: 'any' } as Record<string, string>)}
      className="w-full max-w-2xl rounded-md shadow-2xl"
    >
      <div className="dcc-sheet rounded-md p-4 max-h-[88dvh] flex flex-col">
        <div className="flex items-center justify-between border-b-2 border-[#3d2817] pb-2 mb-3">
          <div>
            <h3 id={titleId} className="font-display text-lg font-black text-[#1a1410] uppercase flex items-center gap-2">
              <Download className="w-5 h-5 text-[#8b1a1a]" aria-hidden="true" /> Export Character Sheets
            </h3>
            <p className="text-xs text-[#4a3728]">
              Works locally and inside embedded iframes (Google Sites).
            </p>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close export dialog"
            className="p-1.5 hover:bg-[#eadbb8] rounded-sm text-[#3d2817] cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* FORMAT TABS */}
        <div className="flex gap-1 mb-2.5 bg-[#eadbb8] p-1 rounded-sm border border-[#5c3d1e]">
          {(
            [
              { id: 'text', label: 'Text / Markdown' },
              { id: 'json', label: 'JSON' },
              { id: 'csv', label: 'CSV' },
            ] as const
          ).map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setFormat(tab.id)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-sm transition cursor-pointer ${
                format === tab.id
                  ? 'bg-[#3d2817] text-[#fef3c7] shadow'
                  : 'text-[#3d2817] hover:bg-[#f4ebd0]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <label htmlFor={previewId} className="visually-hidden">
          Exported character data preview
        </label>
        <textarea
          ref={textareaRef}
          id={previewId}
          readOnly
          value={previewText}
          rows={12}
          className="w-full flex-1 font-mono-stats text-xs bg-[#fffdf7] text-[#1a1410] border border-[#5c3d1e] rounded-sm p-2.5 resize-y"
        />

        {/* DOWNLOAD & COPY ACTIONS */}
        <div className="mt-3 pt-3 border-t border-[#5c3d1e] flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() =>
                downloadFileReliable(formatPartyMarkdown(party), 'dcc-level0-party.txt', 'text/plain;charset=utf-8')
              }
              className="px-2.5 py-1.5 bg-[#eadbb8] hover:bg-[#dcc594] border border-[#5c3d1e] text-[#1a1410] rounded-sm text-xs font-bold cursor-pointer"
            >
              Download .TXT
            </button>
            <button
              type="button"
              onClick={() =>
                downloadFileReliable(formatPartyJSON(party), 'dcc-level0-party.json', 'application/json;charset=utf-8')
              }
              className="px-2.5 py-1.5 bg-[#eadbb8] hover:bg-[#dcc594] border border-[#5c3d1e] text-[#1a1410] rounded-sm text-xs font-bold cursor-pointer"
            >
              Download .JSON
            </button>
            <button
              type="button"
              onClick={() =>
                downloadFileReliable(formatPartyCSV(party), 'dcc-level0-party.csv', 'text/csv;charset=utf-8')
              }
              className="px-2.5 py-1.5 bg-[#eadbb8] hover:bg-[#dcc594] border border-[#5c3d1e] text-[#1a1410] rounded-sm text-xs font-bold cursor-pointer"
            >
              Download .CSV
            </button>
            <button
              type="button"
              onClick={() =>
                downloadFileReliable(
                  formatPartyPrintableHTML(party),
                  'dcc-level0-sheets.html',
                  'text/html;charset=utf-8'
                )
              }
              className="px-2.5 py-1.5 bg-[#eadbb8] hover:bg-[#dcc594] border border-[#5c3d1e] text-[#1a1410] rounded-sm text-xs font-bold cursor-pointer"
            >
              Printable .HTML
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyFromModal}
              className="px-3 py-1.5 bg-[#2d4a1e] hover:bg-[#1f3514] text-[#d9f99d] rounded-sm text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
              {modalCopyState === 'copied'
                ? 'Copied!'
                : modalCopyState === 'failed'
                ? 'Selected — Press Ctrl/Cmd+C'
                : 'Copy'}
            </button>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="px-3 py-1.5 bg-[#3d2817] text-[#fef3c7] rounded-sm font-bold text-xs hover:bg-[#523620] cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
