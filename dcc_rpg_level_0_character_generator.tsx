import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy, Dice5, Download, Printer, RotateCcw, User, Users } from 'lucide-react';
import {
  AbilityKey,
  Alignment,
  Character,
  ShopItem,
  addCharacterCondition,
  addInventoryItem,
  adjustAbilityScore,
  adjustXp,
  buyEquipmentItem,
  generateCharacter,
  generateRandomName,
  removeInventoryItem,
  resetAbilityOverrides,
  setCoinsFromDenominations,
  toggleCharacterCondition,
} from './src/dccData';
import { copyTextReliable, formatPartyMarkdown } from './src/exportUtils';
import { loadSoundPreference, playDiceSound, saveSoundPreference } from './src/soundUtils';
import { PartyMode, loadSavedPartyState, savePartyState } from './src/storageUtils';
import { CharacterCard, CharacterRollRequest } from './src/components/CharacterCard';
import { CritFumbleModal } from './src/components/CritFumbleModal';
import { DiceTray } from './src/components/DiceTray';
import { EquipmentShopModal } from './src/components/EquipmentShopModal';
import { ExportModal } from './src/components/ExportModal';
import { InitiativeTracker } from './src/components/InitiativeTracker';
import { RollLogModal } from './src/components/RollLogModal';
import { TorchTurnBar } from './src/components/TorchTurnBar';
import { Button, SegmentedTabs } from './src/components/ui';
import {
  DccDieSides,
  DiceRollResult,
  applyLuckBurnToRoll,
  rollDieExpression,
  rollLuckCheck,
  shiftDieOnChain,
} from './src/diceUtils';
import {
  InitiativeEntry,
  advanceInitiativeTurn,
  rollPartyInitiative,
  sortInitiativeEntries,
} from './src/initiativeUtils';
import {
  TorchTrackerState,
  advanceDungeonTurn,
  createInitialTorchState,
  lightNewTorch,
  resetTorchTracker,
} from './src/torchTrackerUtils';

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
  const [rollHistory, setRollHistory] = useState<DiceRollResult[]>([]);
  const [isTrayOpen, setIsTrayOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => loadSoundPreference());
  const [dieShiftSteps, setDieShiftSteps] = useState(0);
  const [situationalMod, setSituationalMod] = useState(0);
  const [tablesModalTab, setTablesModalTab] = useState<'crit' | 'fumble' | null>(null);

  const [initiativeEntries, setInitiativeEntries] = useState<InitiativeEntry[]>([]);
  const [activeTurnIndex, setActiveTurnIndex] = useState(0);
  const [initiativeRound, setInitiativeRound] = useState(1);
  const [isInitOpen, setIsInitOpen] = useState(false);
  const [torchState, setTorchState] = useState<TorchTrackerState>(() => createInitialTorchState());

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

  const handleAddItem = (charId: string, itemName: string, quantity = 1) => {
    setParty((prev) =>
      prev.map((c) => (c.id === charId ? addInventoryItem(c, itemName, quantity) : c))
    );
  };

  const handleRemoveItem = (charId: string, index: number) => {
    setParty((prev) => prev.map((c) => (c.id === charId ? removeInventoryItem(c, index) : c)));
  };

  const handleSetCoins = (charId: string, gp: number, sp: number, cp: number) => {
    setParty((prev) =>
      prev.map((c) => (c.id === charId ? setCoinsFromDenominations(c, gp, sp, cp) : c))
    );
  };

  const handleAdjustAbility = (charId: string, stat: AbilityKey, delta: number) => {
    setParty((prev) =>
      prev.map((c) => (c.id === charId ? adjustAbilityScore(c, stat, delta) : c))
    );
  };

  const handleResetAbilities = (charId: string) => {
    setParty((prev) =>
      prev.map((c) => (c.id === charId ? resetAbilityOverrides(c) : c))
    );
  };

  const handleAdjustXp = (charId: string, deltaXp: number) => {
    setParty((prev) =>
      prev.map((c) => (c.id === charId ? adjustXp(c, deltaXp) : c))
    );
  };

  const handleToggleCondition = (charId: string, condition: string) => {
    setParty((prev) =>
      prev.map((c) => (c.id === charId ? toggleCharacterCondition(c, condition) : c))
    );
  };

  const handleAddCondition = (charId: string, condition: string) => {
    setParty((prev) =>
      prev.map((c) => (c.id === charId ? addCharacterCondition(c, condition) : c))
    );
  };

  const pushRoll = (result: DiceRollResult) => {
    if (soundEnabled) {
      playDiceSound({ isNat20: result.isNat20, isNat1: result.isNat1 });
    }
    setRollHistory((prev) => [result, ...prev].slice(0, 30));
    setIsTrayOpen(true);
  };

  const handleToggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      saveSoundPreference(next);
      return next;
    });
  };

  useEffect(() => {
    setInitiativeEntries((prev) => {
      if (prev.length === 0) return prev;
      let changed = false;
      const next = prev
        .map((entry) => {
          if (!entry.characterId) return entry;
          const char = party.find((c) => c.id === entry.characterId);
          if (!char) {
            changed = true;
            return null;
          }
          if (char.isDead !== entry.isDead || char.name !== entry.name) {
            changed = true;
            return { ...entry, isDead: char.isDead, name: char.name };
          }
          return entry;
        })
        .filter((e): e is InitiativeEntry => e !== null);
      return changed ? next : prev;
    });
  }, [party]);

  const applyDieChainShift = (expr: string, steps: number): string => {
    if (steps === 0) return expr;
    const match = expr.trim().match(/^(\d*)d(\d+)([+-]\d+)?$/i);
    if (!match) return expr;
    const count = match[1] || '1';
    const shiftedSides = shiftDieOnChain(Number.parseInt(match[2], 10), steps);
    const suffix = match[3] || '';
    return `${count}d${shiftedSides}${suffix}`;
  };

  const handleCharacterRoll = (char: Character, req: CharacterRollRequest) => {
    const result =
      req.kind === 'luckCheck'
        ? rollLuckCheck(char)
        : rollDieExpression(
            applyDieChainShift(req.expr, dieShiftSteps),
            req.modifier + situationalMod,
            {
              characterId: char.id,
              characterName: char.name,
              label: req.label,
              isAttack: req.isAttack,
            }
          );
    pushRoll(result);

    if (req.kind !== 'luckCheck' && req.label.toLowerCase().includes('init')) {
      setInitiativeEntries((prev) => {
        const entry: InitiativeEntry = {
          id: `char-${char.id}`,
          characterId: char.id,
          name: char.name,
          initiative: result.total,
          isEnemy: false,
          isDead: char.isDead,
          initDie: char.initDie,
          initMod: char.initMod,
        };
        const filtered = prev.filter((e) => e.characterId !== char.id);
        return sortInitiativeEntries([...filtered, entry]);
      });
    }
  };

  const handleFreeformRoll = (sides: DccDieSides) => {
    const shiftedSides = shiftDieOnChain(sides, dieShiftSteps);
    pushRoll(
      rollDieExpression(`1d${shiftedSides}`, situationalMod, {
        label: `d${shiftedSides}`,
      })
    );
  };

  const handleFollowUpRoll = (roll: DiceRollResult) => {
    const char = roll.characterId ? party.find((c) => c.id === roll.characterId) : undefined;
    if (roll.followUpType === 'crit') {
      const result = rollDieExpression(char?.critDie ?? '1d4', char?.critBonus ?? 0, {
        characterId: char?.id,
        characterName: char?.name ?? roll.characterName,
        label: `Crit Table ${char?.critTable ?? 'I'}`,
        tableKind: 'crit',
      });
      pushRoll(result);
    } else if (roll.followUpType === 'fumble') {
      const result = rollDieExpression(char?.fumbleDie ?? '1d4', char?.fumbleMod ?? 0, {
        characterId: char?.id,
        characterName: char?.name ?? roll.characterName,
        label: 'Fumble',
        tableKind: 'fumble',
      });
      pushRoll(result);
    }
  };

  const handleRollPartyInit = () => {
    const rolledParty = rollPartyInitiative(party);
    setInitiativeEntries((prev) => {
      const enemies = prev.filter((e) => e.isEnemy);
      return sortInitiativeEntries([...rolledParty, ...enemies]);
    });
    setActiveTurnIndex(0);
    setInitiativeRound(1);
    setIsInitOpen(true);
  };

  const handleNextInitTurn = () => {
    const { nextIndex, nextRound } = advanceInitiativeTurn(
      initiativeEntries,
      activeTurnIndex,
      initiativeRound
    );
    setActiveTurnIndex(nextIndex);
    setInitiativeRound(nextRound);
  };

  const handleAddEnemyInit = (name: string, manualInit?: number) => {
    const initiative =
      manualInit !== undefined ? manualInit : rollDieExpression('1d20').total;
    const entry: InitiativeEntry = {
      id: `enemy-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      initiative,
      isEnemy: true,
      isDead: false,
      initDie: '1d20',
      initMod: 0,
    };
    setInitiativeEntries((prev) => sortInitiativeEntries([...prev, entry]));
    setIsInitOpen(true);
  };

  const handleAdjustInit = (id: string, delta: number) => {
    setInitiativeEntries((prev) =>
      sortInitiativeEntries(
        prev.map((e) => (e.id === id ? { ...e, initiative: e.initiative + delta } : e))
      )
    );
  };

  const handleRemoveInitEntry = (id: string) => {
    setInitiativeEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      if (activeTurnIndex >= next.length) {
        setActiveTurnIndex(0);
      }
      return next;
    });
  };

  const handleClearInit = () => {
    setInitiativeEntries([]);
    setActiveTurnIndex(0);
    setInitiativeRound(1);
  };

  const handleBurnLuck = (rollId: string) => {
    const targetRoll = rollHistory.find((r) => r.id === rollId);
    if (!targetRoll?.characterId) return;
    const char = party.find((c) => c.id === targetRoll.characterId);
    if (!char || char.abilities.lck <= 0) return;

    const isHalfling = char.race === 'Halfling';
    setParty((prev) =>
      prev.map((c) => (c.id === char.id ? adjustAbilityScore(c, 'lck', -1) : c))
    );
    setRollHistory((prev) =>
      prev.map((r) => (r.id === rollId ? applyLuckBurnToRoll(r, isHalfling) : r))
    );
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
  const latestTableRoll = rollHistory.find((r) => r.tableKind) ?? null;

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
        <TorchTurnBar
          state={torchState}
          onAdvanceTurn={() => setTorchState((prev) => advanceDungeonTurn(prev))}
          onLightTorch={() => setTorchState((prev) => lightNewTorch(prev))}
          onReset={() => setTorchState(resetTorchTracker())}
        />

        <InitiativeTracker
          entries={initiativeEntries}
          activeTurnIndex={activeTurnIndex}
          round={initiativeRound}
          isOpen={isInitOpen}
          hasLivingParty={party.some((c) => !c.isDead)}
          onToggleOpen={() => setIsInitOpen((prev) => !prev)}
          onRollParty={handleRollPartyInit}
          onNextTurn={handleNextInitTurn}
          onAddEnemy={handleAddEnemyInit}
          onAdjustInit={handleAdjustInit}
          onRemoveEntry={handleRemoveInitEntry}
          onClear={handleClearInit}
        />

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
              onAddItem={(itemName, quantity) => handleAddItem(char.id, itemName, quantity)}
              onRemoveItem={(idx) => handleRemoveItem(char.id, idx)}
              onSetCoins={(gp, sp, cp) => handleSetCoins(char.id, gp, sp, cp)}
              onAdjustAbility={(stat, delta) => handleAdjustAbility(char.id, stat, delta)}
              onResetAbilities={() => handleResetAbilities(char.id)}
              onAdjustXp={(delta) => handleAdjustXp(char.id, delta)}
              onToggleCondition={(cond) => handleToggleCondition(char.id, cond)}
              onAddCondition={(cond) => handleAddCondition(char.id, cond)}
              onRoll={(req) => handleCharacterRoll(char, req)}
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
          onAddItem={(itemName, quantity) => handleAddItem(activeShopChar.id, itemName, quantity)}
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

      {/* CRIT & FUMBLE REFERENCE MODAL */}
      {tablesModalTab && (
        <CritFumbleModal
          initialTab={tablesModalTab}
          highlightedRoll={
            latestTableRoll?.tableKind
              ? { kind: latestTableRoll.tableKind, total: latestTableRoll.total }
              : null
          }
          onClose={() => setTablesModalTab(null)}
        />
      )}

      {/* COLLAPSIBLE DCC DICE TRAY */}
      <DiceTray
        history={rollHistory}
        isOpen={isTrayOpen}
        soundEnabled={soundEnabled}
        party={party}
        dieShiftSteps={dieShiftSteps}
        situationalMod={situationalMod}
        onToggleOpen={() => setIsTrayOpen((prev) => !prev)}
        onToggleSound={handleToggleSound}
        onRollDie={handleFreeformRoll}
        onBurnLuck={handleBurnLuck}
        onFollowUpRoll={handleFollowUpRoll}
        onClearHistory={() => setRollHistory([])}
        onChangeDieShift={(delta) =>
          setDieShiftSteps((prev) => Math.max(-6, Math.min(6, prev + delta)))
        }
        onChangeSituationalMod={(delta) => setSituationalMod((prev) => prev + delta)}
        onResetRollMods={() => {
          setDieShiftSteps(0);
          setSituationalMod(0);
        }}
        onOpenTables={(tab) => setTablesModalTab(tab ?? 'crit')}
      />
    </div>
  );
}
