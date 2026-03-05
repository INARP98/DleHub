import { describe, it, expect } from 'vitest';
import { normalizeWord } from '../src/core/utils';
import { getLetterStatuses } from '../src/games/lexilogic/engine/logic';

describe('LexiLogic Engine', () => {
  describe('normalizeWord', () => {
    it('should remove accents but keep Ñ', () => {
      expect(normalizeWord('TENÍA')).toBe('TENIA');
      expect(normalizeWord('SALÓN')).toBe('SALON');
      expect(normalizeWord('PINGÜE')).toBe('PINGUE');
      expect(normalizeWord('NIÑO')).toBe('NIÑO');
    });

    it('should handle lowercase and spaces', () => {
      expect(normalizeWord('  hola  ')).toBe('HOLA');
    });
  });

  describe('getLetterStatuses', () => {
    it('should identify correct letters', () => {
      const statuses = getLetterStatuses('HOLA', 'HOLA');
      expect(statuses).toEqual(['correct', 'correct', 'correct', 'correct']);
    });

    it('should identify present letters', () => {
      const statuses = getLetterStatuses('ALOH', 'HOLA');
      expect(statuses).toEqual(['present', 'present', 'present', 'present']);
    });

    it('should identify absent letters', () => {
      const statuses = getLetterStatuses('XYZW', 'HOLA');
      expect(statuses).toEqual(['absent', 'absent', 'absent', 'absent']);
    });

    it('should handle repeated letters correctly', () => {
      // Guess: ABBA, Solution: BABA
      // A: present (1st), B: correct (2nd), B: present (3rd), A: correct (4th)
      const statuses = getLetterStatuses('ABBA', 'BABA');
      expect(statuses).toEqual(['present', 'correct', 'present', 'correct']);
    });
    
    it('should not mark extra repeated letters as present', () => {
        // Guess: AAAAB, Solution: BXXXX
        const statuses = getLetterStatuses('AAAAB', 'BXXXX');
        expect(statuses[0]).toBe('absent');
        expect(statuses[4]).toBe('present');
    });
  });
});
