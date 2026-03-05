import { normalizeWord, normalizePhrase } from '../../../core/utils';

export { normalizeWord, normalizePhrase };

export type LetterStatus = 'correct' | 'present' | 'absent' | 'empty';

export function getLetterStatuses(guess: string, solution: string): LetterStatus[] {
  const statuses: LetterStatus[] = Array(guess.length).fill('absent');
  const solutionChars = solution.split('');
  const guessChars = guess.split('');

  // Handle spaces: they are always "empty" or ignored in scoring
  for (let i = 0; i < guess.length; i++) {
    if (solutionChars[i] === ' ') {
      statuses[i] = 'empty';
      solutionChars[i] = ''; // Mark as used
      guessChars[i] = '';
    }
  }

  // First pass: correct matches
  for (let i = 0; i < guess.length; i++) {
    if (guessChars[i] !== '' && guessChars[i] === solutionChars[i]) {
      statuses[i] = 'correct';
      solutionChars[i] = ''; // Mark as used
      guessChars[i] = '';
    }
  }

  // Second pass: present matches
  for (let i = 0; i < guess.length; i++) {
    if (guessChars[i] !== '') {
      const index = solutionChars.indexOf(guessChars[i]);
      if (index !== -1) {
        statuses[i] = 'present';
        solutionChars[index] = ''; // Mark as used
      }
    }
  }

  return statuses;
}

export function getDailySolution(solutions: string[], seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % solutions.length;
  return solutions[index];
}

export function getDailyPhrase(phrases: string[], seed: string): string {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % phrases.length;
    return phrases[index];
}

export function getDiscoveryStatuses(guess: string, phrase: string): LetterStatus[] {
  const statuses: LetterStatus[] = Array(guess.length).fill('absent');
  const phraseChars = phrase.replace(/\s/g, '').split('').map(l => normalizeWord(l));
  const guessChars = guess.split('');

  // Count occurrences of each letter in the phrase
  const phraseCounts: Record<string, number> = {};
  phraseChars.forEach(char => {
    phraseCounts[char] = (phraseCounts[char] || 0) + 1;
  });

  // Mark letters as 'correct' (meaning they exist in the phrase)
  // following the repeated letters rule
  for (let i = 0; i < guess.length; i++) {
    const char = guessChars[i];
    if (phraseCounts[char] > 0) {
      statuses[i] = 'correct';
      phraseCounts[char]--;
    }
  }

  return statuses;
}
