import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Manages a native `<dialog>` element with top-layer `showModal()`,
 * `closedby="any"` light-dismiss + Safari pointer fallback, and React StrictMode safety.
 */
export function useModalDialog(onClose: () => void) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (!dialog.open) {
      dialog.showModal();
    }

    const handleClose = () => {
      // Ignore stale queued 'close' events (e.g. React StrictMode double-invoke) if dialog is open again
      if (dialog.open) return;
      onCloseRef.current();
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
  }, []);

  return dialogRef;
}

export type ButtonVariant = 'wood' | 'crimson' | 'forest' | 'slate' | 'parchment' | 'gold' | 'disabled';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'icon';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  wood: 'bg-[#3d2817] hover:bg-[#523620] text-[#f3d37a] border border-[#7c5828] shadow-sm',
  crimson: 'bg-[#8b1a1a] hover:bg-[#6e1313] text-[#fef2f2] border border-[#fca5a5]/30 shadow-sm',
  forest: 'bg-[#2d4a1e] hover:bg-[#1f3514] text-[#d9f99d] border border-[#bef264]/30 shadow-sm',
  slate: 'bg-[#29221c] hover:bg-[#3d332a] text-[#e7dec8] border border-[#786a58] shadow-sm',
  parchment: 'bg-[#eadbb8] hover:bg-[#dcc594] text-[#1a1410] border border-[#5c3d1e]',
  gold: 'bg-[#7c5828] hover:bg-[#5c3d1e] text-[#fef3c7] shadow-sm',
  disabled: 'bg-[#a89f91] text-[#e7dec8] border border-transparent',
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1 text-xs',
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-3 py-2 text-xs md:text-sm',
  icon: 'p-1.5 text-xs',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = 'wood',
  size = 'sm',
  disabled,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const resolvedVariant = disabled ? 'disabled' : variant;
  return (
    <button
      type={type}
      disabled={disabled}
      className={`rounded-sm font-bold inline-flex items-center justify-center gap-1.5 transition shrink-0 ${
        disabled ? 'cursor-not-allowed' : 'cursor-pointer'
      } ${BUTTON_VARIANTS[resolvedVariant]} ${BUTTON_SIZES[size]} ${className}`}
      {...props}
    />
  );
}

export interface TabOption<T extends string> {
  id: T;
  label: React.ReactNode;
}

export interface SegmentedTabsProps<T extends string> {
  options: ReadonlyArray<TabOption<T>>;
  value: T;
  onChange: (value: T) => void;
  theme?: 'parchment' | 'dark';
  ariaLabel?: string;
  className?: string;
}

export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  theme = 'parchment',
  ariaLabel,
  className = '',
}: SegmentedTabsProps<T>) {
  const containerClass =
    theme === 'parchment'
      ? 'flex gap-1 bg-[#eadbb8] p-1 rounded-sm border border-[#5c3d1e]'
      : 'flex bg-[#14110f] p-1 rounded border border-[#5c3d1e]';

  return (
    <div className={`${containerClass} ${className}`} role="group" aria-label={ariaLabel}>
      {options.map((opt) => {
        const isActive = opt.id === value;
        const activeClass =
          theme === 'parchment'
            ? isActive
              ? 'bg-[#3d2817] text-[#fef3c7] shadow'
              : 'text-[#3d2817] hover:bg-[#f4ebd0]'
            : isActive
            ? 'bg-[#7c5828] text-[#fef3c7] shadow'
            : 'text-[#c2b293] hover:text-white';

        return (
          <button
            key={opt.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(opt.id)}
            className={`flex-1 px-3 py-1.5 text-xs font-bold rounded-sm inline-flex items-center justify-center gap-1.5 transition cursor-pointer ${activeClass}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export interface ModalDialogProps {
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  closeLabel: string;
  theme?: 'parchment' | 'dark';
  maxWidthClass?: string;
  footer?: (close: () => void) => React.ReactNode;
  children: React.ReactNode;
}

export function ModalDialog({
  onClose,
  title,
  subtitle,
  icon,
  closeLabel,
  theme = 'parchment',
  maxWidthClass = 'max-w-lg',
  footer,
  children,
}: ModalDialogProps) {
  const titleId = useId();
  const dialogRef = useModalDialog(onClose);
  const closeDialog = () => dialogRef.current?.close();

  const surfaceClass =
    theme === 'parchment'
      ? 'dcc-sheet rounded-md p-4 max-h-[88dvh] flex flex-col'
      : 'dcc-panel rounded-md p-4 max-h-[85dvh] flex flex-col font-mono-stats text-xs';

  const headerBorderClass =
    theme === 'parchment' ? 'border-b-2 border-[#3d2817]' : 'border-b border-[#4a3728]';

  const titleClass =
    theme === 'parchment'
      ? 'font-display text-lg font-black text-[#1a1410] uppercase flex items-center gap-2'
      : 'font-display text-base font-bold text-[#f3d37a] flex items-center gap-2';

  const closeBtnClass =
    theme === 'parchment'
      ? 'p-1.5 hover:bg-[#eadbb8] rounded-sm text-[#3d2817] cursor-pointer'
      : 'p-1 text-[#c2b293] hover:text-white cursor-pointer';

  const footerBorderClass =
    theme === 'parchment' ? 'mt-3 pt-3 border-t border-[#5c3d1e]' : 'mt-3 pt-2 border-t border-[#4a3728]';

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      {...({ closedby: 'any' } as Record<string, string>)}
      className={`w-[calc(100vw-2rem)] ${maxWidthClass} rounded-md shadow-2xl`}
    >
      <div className={surfaceClass}>
        <div className={`flex items-center justify-between ${headerBorderClass} pb-2 mb-3 gap-2`}>
          <div className="min-w-0">
            <h3 id={titleId} className={titleClass}>
              {icon}
              <span className="truncate">{title}</span>
            </h3>
            {subtitle && <div className="mt-0.5">{subtitle}</div>}
          </div>
          <button
            type="button"
            onClick={closeDialog}
            aria-label={closeLabel}
            className={closeBtnClass}
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {children}

        {footer && <div className={footerBorderClass}>{footer(closeDialog)}</div>}
      </div>
    </dialog>
  );
}

export interface StatusBannerProps {
  tone?: 'success' | 'error';
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function StatusBanner({
  tone = 'success',
  icon,
  children,
  className = '',
}: StatusBannerProps) {
  const toneClass =
    tone === 'success'
      ? 'bg-[#2d4a1e]/15 border-[#2d4a1e] text-[#1f3514]'
      : 'bg-[#f8e7e2] border-[#8b1a1a] text-[#6e1313]';

  return (
    <div
      role="status"
      className={`px-3 py-1.5 border rounded-sm text-xs font-bold flex items-center gap-1.5 ${toneClass} ${className}`}
    >
      {icon}
      <span>{children}</span>
    </div>
  );
}

export interface ConfirmDialogProps {
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Remove',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <ModalDialog
      onClose={onCancel}
      title={title}
      closeLabel={`Close ${title}`}
      maxWidthClass="max-w-sm"
      footer={(close) => (
        <div className="flex justify-end gap-2">
          <Button variant="parchment" size="sm" onClick={close}>
            {cancelLabel}
          </Button>
          <Button
            variant="crimson"
            size="sm"
            onClick={() => {
              onConfirm();
              close();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      )}
    >
      <p className="text-sm text-[#1a1410] font-medium">{message}</p>
    </ModalDialog>
  );
}
