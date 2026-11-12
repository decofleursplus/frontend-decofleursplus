'use client';

import React, { useRef } from 'react';

export const OTP_LENGTH = 6;

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  /** Préfixe des id des cases (plusieurs saisies peuvent coexister sur une page) */
  idPrefix?: string;
  ariaLabel?: string;
}

/** Saisie d'un code à 6 chiffres : une case par chiffre, collage et retour arrière gérés. */
export function OtpInput({
  value,
  onChange,
  disabled = false,
  autoFocus = false,
  idPrefix = 'otp',
  ariaLabel = 'Code de vérification à 6 chiffres',
}: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? '');

  function focusCell(index: number) {
    const cell = inputsRef.current[Math.max(0, Math.min(OTP_LENGTH - 1, index))];
    cell?.focus();
    cell?.select();
  }

  function writeFrom(index: number, raw: string) {
    const incoming = raw.replace(/\D/g, '');
    if (!incoming) return;
    const next = (value.slice(0, index) + incoming + value.slice(index + incoming.length)).slice(0, OTP_LENGTH);
    onChange(next);
    focusCell(index + incoming.length);
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[index]) {
        onChange(value.slice(0, index) + value.slice(index + 1));
      } else if (index > 0) {
        onChange(value.slice(0, index - 1) + value.slice(index));
        focusCell(index - 1);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusCell(index - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusCell(index + 1);
    }
  }

  return (
    <div className="auth-otp-row" role="group" aria-label={ariaLabel}>
      {digits.map((digit, index) => (
        <input
          key={index}
          id={`${idPrefix}-${index}`}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          className="auth-otp-cell"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={OTP_LENGTH}
          value={digit}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          aria-label={`Chiffre ${index + 1} sur ${OTP_LENGTH}`}
          onChange={(e) => writeFrom(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={(e) => {
            e.preventDefault();
            writeFrom(0, e.clipboardData.getData('text'));
          }}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}
