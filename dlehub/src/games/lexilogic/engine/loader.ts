import { normalizeWord, normalizePhrase } from './logic';

export type LetterStatus = 'correct' | 'present' | 'absent' | 'empty';

export interface GameState {
  status: 'idle' | 'loading' | 'ready' | 'completed' | 'error';
  attempts: string[];
  currentAttempt: string;
  cursorIndex: number;
  solution: string;
  message: string | null;
  error: string | null;
}

export interface WordLists {
  solutions: string[];
  validGuesses: Set<string>;
}

let cachedWordLists: WordLists | null = null;

export async function loadWordLists(retries = 2): Promise<WordLists> {
  if (cachedWordLists) return cachedWordLists;

  const fetchWithTimeout = async (url: string, timeout = 5000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (e) {
      clearTimeout(id);
      throw e;
    }
  };

  try {
    const [solutionsRes, validRes] = await Promise.all([
      fetchWithTimeout('/lexilogic/solutions.txt'),
      fetchWithTimeout('/lexilogic/valid-guesses.txt')
    ]);

    if (!solutionsRes.ok || !validRes.ok) throw new Error('Error al cargar diccionarios');

    const solutionsText = await solutionsRes.text();
    const validText = await validRes.text();

    const solutions = solutionsText.split('\n')
      .map(normalizeWord)
      .filter(w => w.length === 5 && w.trim() !== '');
    
    const validGuesses = new Set(validText.split('\n')
      .map(normalizeWord)
      .filter(w => w.length === 5 && w.trim() !== ''));

    // Ensure solutions are also in valid guesses
    solutions.forEach(s => validGuesses.add(s));

    console.log(`Valid-guesses cargadas: ${validGuesses.size}, Solutions cargadas: ${solutions.length}`);

    cachedWordLists = { solutions, validGuesses };
    return cachedWordLists;
  } catch (error) {
    if (retries > 0) {
      console.log(`Reintentando carga de diccionarios... (${retries} intentos restantes)`);
      return loadWordLists(retries - 1);
    }
    console.error('Failed to load word lists after retries:', error);
    throw error;
  }
}

export async function loadDailyPhrases(): Promise<string[]> {
    const res = await fetch('/lexilogic/daily-phrases.txt');
    if (!res.ok) throw new Error('Error al cargar frases');
    const text = await res.text();
    return text.split('\n')
        .map(line => normalizePhrase(line))
        .filter(line => line.length >= 10 && line.length <= 50);
}
