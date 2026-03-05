import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeWord(word: string): string {
  return word
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, (match) => {
      // Preserve Ñ (N + \u0303)
      return match === '\u0303' ? match : '';
    })
    .normalize('NFC')
    .toUpperCase()
    .replace(/[^A-ZÑ]/g, '');
}

export function normalizePhrase(phrase: string): string {
  return phrase
    .trim()
    .toUpperCase()
    .replace(/[^A-ZÑÁÉÍÓÚÜ\s]/g, '')
    .replace(/\s+/g, ' ');
}

export function getDailyKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const STORAGE_KEYS = {
  STATS: 'dlehub_stats',
  DAILY_WORD: 'dlehub_daily_word',
  DAILY_PHRASE: 'dlehub_daily_phrase',
  TIME_ATTACK_HS: 'dlehub_time_attack_hs',
};
