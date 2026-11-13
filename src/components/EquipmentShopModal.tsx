import React, { useState } from 'react';
import { Check, ShoppingBag, X } from 'lucide-react';
import {
  Character,
  SHOP_ITEMS,
  ShopItem,
  formatCoins,
  getShieldRestrictionReason,
} from '../dccData';
import { Button, ModalDialog, SegmentedTabs, StatusBanner } from './ui';

type ShopCategory = 'All' | 'Adventuring Gear' | 'Weapons' | 'Armor';

const SHOP_CATEGORY_TABS: ReadonlyArray<{ id: ShopCategory; label: string }> = [
  { id: 'All', label: 'All' },
  { id: 'Adventuring Gear', label: 'Adventuring Gear' },
  { id: 'Weapons', label: 'Weapons' },
  { id: 'Armor', label: 'Armor' },
];

export interface EquipmentShopModalProps {
  character: Character;
  onClose: () => void;
  onBuy: (item: ShopItem) => void;
  onRemoveItem: (index: number) => void;
}

export function EquipmentShopModal({
  character,
  onClose,
  onBuy,
  onRemoveItem,
}: EquipmentShopModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory>('All');
  const [lastPurchased, setLastPurchased] = useState<string | null>(null);

  const filteredItems = SHOP_ITEMS.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  const shieldRestriction = getShieldRestrictionReason(character);

  const handlePurchase = (item: ShopItem) => {
    onBuy(item);
    setLastPurchased(`Purchased ${item.name} (${formatCoins(item.cost)})`);
  };

  const handleRemove = (itemName: string, index: number) => {
    onRemoveItem(index);
    setLastPurchased(`Removed ${itemName} from pack`);
  };

  return (
    <ModalDialog
      onClose={onClose}
      title="Village Outfitter"
      icon={<ShoppingBag className="w-5 h-5 text-[#8b1a1a] shrink-0" aria-hidden="true" />}
      closeLabel="Close equipment shop"
      maxWidthClass="max-w-lg"
      subtitle={
        <p className="text-xs text-[#4a3728] font-bold">
          Buyer: {character.name} &bull; Purse:{' '}
          <span className="font-mono-stats text-[#6e2c14]">{formatCoins(character.coins)}</span>
          {' '}&bull; AC: <span className="font-mono-stats text-[#1a1410]">{character.ac}</span>
          {' '}&bull; Pack:{' '}
          <span className="font-mono-stats text-[#1a1410]">{character.inventory.length} items</span>
        </p>
      }
      footer={(close) => (
        <div className="flex justify-end">
          <Button variant="wood" size="sm" onClick={close}>
            Done Shopping
          </Button>
        </div>
      )}
    >
      {lastPurchased && (
        <StatusBanner
          tone="success"
          icon={<Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
          className="mb-2.5"
        >
          {lastPurchased}
        </StatusBanner>
      )}

      <SegmentedTabs<ShopCategory>
        options={SHOP_CATEGORY_TABS}
        value={selectedCategory}
        onChange={setSelectedCategory}
        ariaLabel="Equipment categories"
        className="mb-3"
      />

      <div className="mb-3 p-2 dcc-rule-box rounded-sm">
        <div className="text-[11px] font-bold text-[#4a3728] uppercase tracking-wider mb-1">
          In Pack ({character.inventory.length})
        </div>
        {character.inventory.length === 0 ? (
          <p className="text-xs italic text-[#5c4938]">Pack is empty.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
            {character.inventory.map((invItem, idx) => (
              <span
                key={`${invItem}-${idx}`}
                className="inline-flex items-center gap-1 bg-[#eadbb8] border border-[#5c3d1e]/60 rounded-sm px-1.5 py-0.5 text-[11px] font-semibold text-[#1a1410]"
              >
                <span>{invItem}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(invItem, idx)}
                  aria-label={`Remove ${invItem}`}
                  className="text-[#6e2c14] hover:text-[#8b1a1a] cursor-pointer leading-none"
                >
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filteredItems.map((item) => {
          const canAfford = character.coins >= item.cost;
          const shieldBlocked = item.type === 'shield' ? shieldRestriction : null;
          const disabled = !canAfford || Boolean(shieldBlocked);
          const ownedCount = character.inventory.filter((inv) => inv === item.name).length;

          return (
            <div
              key={item.name}
              className="flex items-center justify-between p-2 dcc-rule-box rounded-sm gap-2"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#1a1410]">{item.name}</h4>
                  {ownedCount > 0 && (
                    <span className="text-[10px] font-mono-stats font-bold px-1.5 py-0.5 bg-[#3d2817]/10 border border-[#5c3d1e]/40 rounded-sm text-[#3d2817]">
                      Owned: {ownedCount}
                    </span>
                  )}
                </div>
                <span className="font-mono-stats text-[11px] font-semibold text-[#6e2c14]">
                  Cost: {formatCoins(item.cost)}
                </span>
                {!canAfford && (
                  <span className="ml-2 text-[10px] text-[#8b1a1a] font-semibold">
                    (Insufficient coin)
                  </span>
                )}
                {shieldBlocked && (
                  <p className="text-[10px] text-[#8b1a1a] font-semibold mt-0.5">
                    {shieldBlocked}
                  </p>
                )}
              </div>

              <Button
                variant="forest"
                size="sm"
                onClick={() => handlePurchase(item)}
                disabled={disabled}
              >
                Buy
              </Button>
            </div>
          );
        })}
      </div>
    </ModalDialog>
  );
}
