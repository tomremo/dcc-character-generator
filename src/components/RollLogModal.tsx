import React from 'react';
import { FileText } from 'lucide-react';
import { Character } from '../dccData';
import { Button, ModalDialog } from './ui';

export interface RollLogModalProps {
  character: Character;
  onClose: () => void;
}

export function RollLogModal({ character, onClose }: RollLogModalProps) {
  return (
    <ModalDialog
      onClose={onClose}
      theme="dark"
      maxWidthClass="max-w-md"
      title={`Dice Log: ${character.name}`}
      icon={<FileText className="w-5 h-5 text-[#f3d37a] shrink-0" aria-hidden="true" />}
      closeLabel="Close dice log"
      footer={(close) => (
        <div className="flex justify-end">
          <Button variant="gold" size="sm" onClick={close}>
            Close Log
          </Button>
        </div>
      )}
    >
      <div className="flex-1 overflow-y-auto space-y-1.5 bg-[#110e0c] p-3 rounded-sm border border-[#3d2817]">
        {character.diceLog.map((entry, idx) => (
          <div key={idx} className="text-[#bef264] border-b border-[#1f1914] pb-1">
            &gt; {entry}
          </div>
        ))}
      </div>
    </ModalDialog>
  );
}
