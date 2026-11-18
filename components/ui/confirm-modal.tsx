'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, HelpCircle, Loader2 } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmModal({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'default',
  loading = false,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94vw] max-w-md p-6 rounded-2xl bg-white border border-[#e7e4dd] shadow-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {variant === 'danger' ? (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-100">
                <AlertTriangle className="h-5 w-5" />
              </div>
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#173f22] border border-emerald-100">
                <HelpCircle className="h-5 w-5" />
              </div>
            )}
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 font-sans">
                {title}
              </DialogTitle>
              {typeof description === 'string' ? (
                <DialogDescription className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {description}
                </DialogDescription>
              ) : (
                <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {description}
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="mt-5 gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => onOpenChange(false)}
            className="border-gray-200 text-xs"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={loading}
            className={
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700 text-white text-xs gap-1.5'
                : 'bg-[#173f22] hover:bg-[#122e19] text-white text-xs gap-1.5'
            }
            onClick={async () => {
              await onConfirm();
            }}
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { ConfirmModal as AdminConfirmModal };
export type { ConfirmModalProps as AdminConfirmModalProps };

