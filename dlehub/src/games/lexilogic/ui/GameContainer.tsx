import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Share2, RotateCcw, BarChart2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { cn, normalizeWord } from '../../../core/utils';
import { Board, Keyboard, Toast } from './Components';
import { getLetterStatuses, getDiscoveryStatuses, LetterStatus } from '../engine/logic';
import { loadWordLists, WordLists } from '../engine/loader';
import { updateStats, saveDailyState, getDailyState, DailyState } from '../../../core/storage';
import { Footer } from '../../../components/Footer';

interface GameContainerProps {
  mode: 'daily' | 'phrase' | 'time-attack';
  solution: string;
  maxAttempts?: number;
  wordLength?: number;
  onComplete?: (won: boolean, attempts: string[]) => void;
  isDaily?: boolean;
  dailyKey?: string;
  topContent?: React.ReactNode;
}

export const GameContainer: React.FC<GameContainerProps> = ({
  mode,
  solution,
  maxAttempts = 6,
  wordLength = 5,
  onComplete,
  isDaily = false,
  dailyKey,
  topContent
}) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'ready' | 'completed' | 'error'>('loading');
  const [attempts, setAttempts] = useState<string[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState("");
  const [cursorIndex, setCursorIndex] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [wordLists, setWordLists] = useState<WordLists | null>(null);
  // ...
  const [usedLetters, setUsedLetters] = useState<Record<string, LetterStatus>>({});
  const [discoveredLetters, setDiscoveredLetters] = useState<Set<string>>(new Set());

  // Set initial cursor position
  useEffect(() => {
    if (status === 'ready' && solution) {
      setCursorIndex(0);
    }
  }, [status, solution]);

  // Check daily state
  useEffect(() => {
    if (isDaily && dailyKey) {
      const saved = getDailyState(dailyKey);
      if (saved && saved.completed) {
        setAttempts(saved.attempts);
        setStatus('completed');
        setAlreadyCompleted(true);
        if (mode === 'phrase') {
            setMessage('La frase ya fue realizada, espere a que se reinicie la frase del día.');
        }
        
        // Reconstruct state
        const used: Record<string, LetterStatus> = {};
        const discovered = new Set<string>();
        
        saved.attempts.forEach(att => {
            const statuses = mode === 'phrase' ? getDiscoveryStatuses(att, solution) : getLetterStatuses(att, solution);
            att.split('').forEach((char, i) => {
                const s = statuses[i];
                if (mode === 'phrase') {
                    if (s === 'correct') {
                        discovered.add(char);
                        used[char] = 'correct';
                    } else if (!used[char]) {
                        used[char] = 'absent';
                    }
                } else {
                    if (!used[char] || (used[char] === 'present' && s === 'correct') || (used[char] === 'absent' && s !== 'absent')) {
                        used[char] = s;
                    }
                }
            });
        });
        setUsedLetters(used);
        setDiscoveredLetters(discovered);
      }
    }
  }, [isDaily, dailyKey, solution, mode]);

  useEffect(() => {
    loadWordLists()
      .then(lists => {
        setWordLists(lists);
        if (status === 'loading') setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  const onKey = useCallback((key: string) => {
    if (status !== 'ready') return;

    if (key === 'ENTER') {
      if (currentAttempt.length !== wordLength) {
        setMessage('Palabra incompleta');
        return;
      }

      // Always validate against 5-letter dictionary
      if (!wordLists?.validGuesses.has(currentAttempt)) {
        setMessage('Palabra no válida');
        return;
      }

      const newAttempts = [...attempts, currentAttempt];
      setAttempts(newAttempts);

      // Update state based on mode
      const newUsed = { ...usedLetters };
      const newDiscovered = new Set(discoveredLetters);

      if (mode === 'phrase') {
        const statuses = getDiscoveryStatuses(currentAttempt, solution);
        currentAttempt.split('').forEach((char, i) => {
          if (statuses[i] === 'correct') {
            newDiscovered.add(char);
            newUsed[char] = 'correct';
          } else if (!newUsed[char]) {
            newUsed[char] = 'absent';
          }
        });
        setDiscoveredLetters(newDiscovered);
        setUsedLetters(newUsed);

        // Check if phrase is completed
        const phraseLetters = new Set(solution.replace(/\s/g, '').split('').map(l => normalizeWord(l)));
        const allDiscovered = Array.from(phraseLetters).every(l => newDiscovered.has(l));

        if (allDiscovered) {
          setStatus('completed');
          confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
          if (onComplete) onComplete(true, newAttempts);
          if (isDaily && dailyKey) {
              saveDailyState(dailyKey, {
                  completed: true,
                  date: new Date().toISOString().split('T')[0],
                  outcome: 'win',
                  attempts: newAttempts,
                  solution
              });
              updateStats('lexilogic', true, newAttempts.length);
          }
        } else if (newAttempts.length >= maxAttempts) {
          setStatus('completed');
          if (onComplete) onComplete(false, newAttempts);
          if (isDaily && dailyKey) {
              saveDailyState(dailyKey, {
                  completed: true,
                  date: new Date().toISOString().split('T')[0],
                  outcome: 'lose',
                  attempts: newAttempts,
                  solution
              });
              updateStats('lexilogic', false, newAttempts.length);
          }
        } else {
          setCurrentAttempt("");
          setCursorIndex(0);
        }
      } else {
        // Standard Wordle logic
        const newStatuses = getLetterStatuses(currentAttempt, solution);
        currentAttempt.split('').forEach((char, i) => {
          const s = newStatuses[i];
          if (!newUsed[char] || (newUsed[char] === 'present' && s === 'correct') || (newUsed[char] === 'absent' && s !== 'absent')) {
            newUsed[char] = s;
          }
        });
        setUsedLetters(newUsed);

        if (currentAttempt === solution) {
          setStatus('completed');
          confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
          if (onComplete) onComplete(true, newAttempts);
          if (isDaily && dailyKey) {
              saveDailyState(dailyKey, {
                  completed: true,
                  date: new Date().toISOString().split('T')[0],
                  outcome: 'win',
                  attempts: newAttempts,
                  solution
              });
              updateStats('lexilogic', true, newAttempts.length);
          }
        } else if (newAttempts.length >= maxAttempts) {
          setStatus('completed');
          if (onComplete) onComplete(false, newAttempts);
          if (isDaily && dailyKey) {
              saveDailyState(dailyKey, {
                  completed: true,
                  date: new Date().toISOString().split('T')[0],
                  outcome: 'lose',
                  attempts: newAttempts,
                  solution
              });
              updateStats('lexilogic', false, newAttempts.length);
          }
        } else {
          setCurrentAttempt("");
          setCursorIndex(0);
        }
      }
    } else if (key === 'BACKSPACE') {
      if (currentAttempt.length > 0) {
        const newAttempt = currentAttempt.slice(0, -1);
        setCurrentAttempt(newAttempt);
        setCursorIndex(Math.max(0, newAttempt.length - 1));
      }
    } else if (/^[A-ZÑ]$/.test(key)) {
      if (currentAttempt.length < wordLength) {
        const newAttempt = currentAttempt + key;
        setCurrentAttempt(newAttempt);
        setCursorIndex(newAttempt.length);
      }
    }
  }, [status, currentAttempt, cursorIndex, attempts, solution, wordLists, usedLetters, discoveredLetters, mode, wordLength, maxAttempts, isDaily, dailyKey, onComplete]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const key = e.key.toUpperCase();
      if (key === 'ENTER') onKey('ENTER');
      else if (key === 'BACKSPACE') onKey('BACKSPACE');
      else if (/^[A-ZÑ]$/.test(key)) onKey(key);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKey]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh]">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-neutral-500 font-medium">Cargando LexiLogic...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] p-6 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-2">¡Ups! Algo salió mal</h2>
        <p className="text-neutral-600 mb-6">No pudimos cargar el contenido. Por favor, comprueba tu conexión.</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <header className="flex items-center justify-between p-4 border-b bg-white shrink-0 h-16 sticky top-0 z-50">
        <Link to="/" className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
          <Home className="w-6 h-6 text-neutral-600" />
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-indigo-600">
            {mode === 'phrase' ? 'La Frase del Día' : 'LexiLogic'}
        </h1>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <BarChart2 className="w-6 h-6 text-neutral-600" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start relative min-h-0 py-4">
        {topContent}
        <Board
          attempts={attempts}
          currentAttempt={currentAttempt}
          solution={solution}
          maxAttempts={maxAttempts}
          wordLength={wordLength}
          cursorIndex={cursorIndex}
          onCursorChange={setCursorIndex}
          isPhrase={mode === 'phrase'}
          discoveredLetters={discoveredLetters}
        />
        
        {status === 'completed' && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-white/80 backdrop-blur-sm z-40 flex flex-col items-center justify-center p-6 text-center"
            >
                <h2 className="text-3xl font-bold mb-2">
                    {mode === 'phrase' ? (discoveredLetters.size >= new Set(solution.replace(/\s/g, '').split('')).size ? '¡Frase Descubierta!' : 'Fin del juego') : (attempts[attempts.length - 1] === solution ? '¡Excelente!' : 'Fin del juego')}
                </h2>
                <p className="text-neutral-600 mb-6">
                    {mode === 'phrase' ? 'Has completado el refrán de hoy.' : `La solución era `}
                    {mode !== 'phrase' && <span className="font-bold text-indigo-600">{solution}</span>}
                </p>
                
                {mode === 'phrase' && (
                    <div className="mb-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100 max-w-sm mx-auto">
                        <p className="text-indigo-900 font-medium italic">"{solution}"</p>
                    </div>
                )}
                
                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <button 
                        onClick={() => {
                            let text = `DleHub - LexiLogic\nModo: ${mode === 'phrase' ? 'Frase del Día' : mode}\nIntentos: ${attempts.length}/${maxAttempts}\n`;
                            if (mode === 'phrase') {
                                text += `Frase: ${solution.split(' ').map(w => w.split('').map(l => discoveredLetters.has(l) ? '🟩' : '⬜').join('')).join(' ')}`;
                            } else {
                                text += attempts.map(a => getLetterStatuses(a, solution).map(s => s === 'correct' ? '🟩' : s === 'present' ? '🟨' : '⬛').join('')).join('\n');
                            }
                            navigator.clipboard.writeText(text);
                            setMessage('¡Resultado copiado!');
                        }}
                        className="flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                    >
                        <Share2 className="w-5 h-5" /> Compartir
                    </button>
                    {mode === 'time-attack' && (
                        <button 
                            onClick={() => window.location.reload()}
                            className="flex items-center justify-center gap-2 bg-neutral-200 text-neutral-800 py-3 rounded-xl font-bold hover:bg-neutral-300 transition-colors"
                        >
                            <RotateCcw className="w-5 h-5" /> Jugar de nuevo
                        </button>
                    )}
                    <Link 
                        to="/"
                        className="flex items-center justify-center gap-2 bg-neutral-800 text-white py-3 rounded-xl font-bold hover:bg-neutral-900 transition-colors"
                    >
                        Volver al inicio
                    </Link>
                </div>
            </motion.div>
        )}
      </main>

      <footer className="shrink-0 bg-white border-t pb-safe">
        <Keyboard onKey={onKey} usedLetters={usedLetters} />
      </footer>

      <div className="shrink-0">
        <Footer />
      </div>

      <Toast message={message} onClose={() => setMessage(null)} />
    </div>
  );
};
