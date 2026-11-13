import React, { useId, useRef, useState } from 'react';
import { Check, Copy, Download, Upload } from 'lucide-react';
import { Character } from '../dccData';
import {
  copyTextReliable,
  downloadFileReliable,
  formatPartyCSV,
  formatPartyJSON,
  formatPartyMarkdown,
  formatPartyPrintableHTML,
} from '../exportUtils';
import { parseImportedPartyJSON } from '../storageUtils';
import { Button, ModalDialog, SegmentedTabs, StatusBanner } from './ui';

type ExportFormat = 'text' | 'json' | 'csv';

const EXPORT_FORMAT_TABS: ReadonlyArray<{ id: ExportFormat; label: string }> = [
  { id: 'text', label: 'Text / Markdown' },
  { id: 'json', label: 'JSON' },
  { id: 'csv', label: 'CSV' },
];

export interface ExportModalProps {
  party: Character[];
  onImportParty: (imported: Character[]) => void;
  onClose: () => void;
}

export function ExportModal({ party, onImportParty, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('text');
  const [modalCopyState, setModalCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [importStatus, setImportStatus] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const previewId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const imported = parseImportedPartyJSON(text);
      if (!imported) {
        setImportStatus({ tone: 'error', text: 'Invalid DCC character JSON file.' });
        return;
      }
      onImportParty(imported);
      setImportStatus({
        tone: 'success',
        text: `Loaded ${imported.length} character${imported.length === 1 ? '' : 's'} from ${file.name}.`,
      });
    } catch {
      setImportStatus({ tone: 'error', text: 'Could not read the selected file.' });
    }
  };

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
    <ModalDialog
      onClose={onClose}
      maxWidthClass="max-w-2xl"
      title="Export Character Sheets"
      icon={<Download className="w-5 h-5 text-[#8b1a1a] shrink-0" aria-hidden="true" />}
      closeLabel="Close export dialog"
      subtitle={
        <p className="text-xs text-[#4a3728]">
          Works locally and inside embedded iframes (Google Sites).
        </p>
      }
      footer={(close) => (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <Button
              variant="parchment"
              size="sm"
              onClick={() =>
                downloadFileReliable(formatPartyMarkdown(party), 'dcc-level0-party.txt', 'text/plain;charset=utf-8')
              }
            >
              Download .TXT
            </Button>
            <Button
              variant="parchment"
              size="sm"
              onClick={() =>
                downloadFileReliable(formatPartyJSON(party), 'dcc-level0-party.json', 'application/json;charset=utf-8')
              }
            >
              Download .JSON
            </Button>
            <Button
              variant="parchment"
              size="sm"
              onClick={() =>
                downloadFileReliable(formatPartyCSV(party), 'dcc-level0-party.csv', 'text/csv;charset=utf-8')
              }
            >
              Download .CSV
            </Button>
            <Button
              variant="parchment"
              size="sm"
              onClick={() =>
                downloadFileReliable(
                  formatPartyPrintableHTML(party),
                  'dcc-level0-sheets.html',
                  'text/html;charset=utf-8'
                )
              }
            >
              Printable .HTML
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileImport}
              className="hidden"
              aria-label="Import character JSON file"
            />
            <Button
              variant="parchment"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-3.5 h-3.5" aria-hidden="true" /> Import .JSON
            </Button>
            <Button variant="forest" size="sm" onClick={handleCopyFromModal}>
              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
              {modalCopyState === 'copied'
                ? 'Copied!'
                : modalCopyState === 'failed'
                ? 'Selected — Press Ctrl/Cmd+C'
                : 'Copy'}
            </Button>
            <Button variant="wood" size="sm" onClick={close}>
              Close
            </Button>
          </div>
        </div>
      )}
    >
      {importStatus && (
        <StatusBanner
          tone={importStatus.tone}
          icon={importStatus.tone === 'success' ? <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" /> : undefined}
          className="mb-2.5"
        >
          {importStatus.text}
        </StatusBanner>
      )}

      <SegmentedTabs<ExportFormat>
        options={EXPORT_FORMAT_TABS}
        value={format}
        onChange={setFormat}
        ariaLabel="Export format"
        className="mb-2.5"
      />

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
    </ModalDialog>
  );
}
