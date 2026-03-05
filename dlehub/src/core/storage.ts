export interface GameStats {
  played: number;
  won: number;
  streak: number;
  maxStreak: number;
  distribution: Record<number, number>;
}

export interface DailyState {
  completed: boolean;
  date: string;
  outcome: 'win' | 'lose' | null;
  attempts: string[];
  solution: string;
}

export function getStats(gameId: string): GameStats {
  const stored = localStorage.getItem(`stats_${gameId}`);
  if (stored) return JSON.parse(stored);
  return {
    played: 0,
    won: 0,
    streak: 0,
    maxStreak: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
  };
}

export function saveStats(gameId: string, stats: GameStats) {
  localStorage.setItem(`stats_${gameId}`, JSON.stringify(stats));
}

export function updateStats(gameId: string, won: boolean, attemptCount: number) {
  const stats = getStats(gameId);
  stats.played += 1;
  if (won) {
    stats.won += 1;
    stats.streak += 1;
    stats.maxStreak = Math.max(stats.streak, stats.maxStreak);
    stats.distribution[attemptCount] = (stats.distribution[attemptCount] || 0) + 1;
  } else {
    stats.streak = 0;
  }
  saveStats(gameId, stats);
}

export function getDailyState(key: string): DailyState | null {
  const stored = localStorage.getItem(key);
  if (stored) {
    const state = JSON.parse(stored);
    // Only return if it's from today
    const today = new Date().toISOString().split('T')[0];
    if (state.date === today) return state;
  }
  return null;
}

export function saveDailyState(key: string, state: DailyState) {
  localStorage.setItem(key, JSON.stringify(state));
}
