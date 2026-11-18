'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, MessageSquare } from 'lucide-react';

export interface PromptModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  inputType?: 'text' | 'email' | 'textarea';
  variant?: 'danger' | 'default';
  loading?: boolean;
  validate?: (value: string) => string | null;
  onSubmit: (value: string) => void | Promise<void>;
}

export function PromptModal({
  isOpen,
  onOpenChange,
  title,
  description,
  label,
  placeholder,
  defaultValue = '',
  confirmLabel = 'Valider',
  cancelLabel = 'Annuler',
  inputType = 'text',
  variant = 'default',
  loading = false,
  validate,
  onSubmit,
}: PromptModalProps) {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
      setError(null);
    }
  }, [isOpen, defaultValue]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (validate) {
      const err = validate(value);
      if (err) {
        setError(err);
        return;
      }
    }
    setError(null);
    await onSubmit(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94vw] max-w-md p-6 rounded-2xl bg-white border border-[#e7e4dd] shadow-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#173f22] border border-emerald-100">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-gray-900 font-sans">
                  {title}
                </DialogTitle>
                {description && (
                  <DialogDescription className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {description}
                  </DialogDescription>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="mt-4 space-y-1.5">
            {label && (
              <label className="block text-xs font-semibold text-gray-700">
                {label}
              </label>
            )}
            {inputType === 'textarea' ? (
              <textarea
                autoFocus
                rows={3}
                placeholder={placeholder}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full rounded-xl border border-[#e7e4dd] p-3 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#173f22] resize-none"
              />
            ) : (
              <Input
                autoFocus
                type={inputType}
                placeholder={placeholder}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full h-10 rounded-xl border border-[#e7e4dd] px-3 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#173f22]"
              />
            )}
            {error && (
              <p className="text-xs text-red-600 font-medium">{error}</p>
            )}
          </div>

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
              type="submit"
              size="sm"
              disabled={loading}
              className={
                variant === 'danger'
                  ? 'bg-red-600 hover:bg-red-700 text-white text-xs gap-1.5'
                  : 'bg-[#173f22] hover:bg-[#122e19] text-white text-xs gap-1.5'
              }
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { PromptModal as AdminPromptModal };
export type { PromptModalProps as AdminPromptModalProps };

