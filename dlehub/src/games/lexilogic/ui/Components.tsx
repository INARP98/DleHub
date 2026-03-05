import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Share2, RotateCcw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../../core/utils';
import { getLetterStatuses, getDiscoveryStatuses, LetterStatus, normalizeWord } from '../engine/logic';

interface KeyboardProps {
  onKey: (key: string) => void;
  usedLetters: Record<string, LetterStatus>;
}

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

export const Keyboard: React.FC<KeyboardProps> = ({ onKey, usedLetters }) => {
  return (
    <div className="w-full max-w-2xl mx-auto p-1 select-none">
      {ROWS.map((row, i) => (
        <div key={i} className="flex justify-center gap-0.5 mb-1">
          {row.map((key) => {
            const status = usedLetters[key];
            const isSpecial = key === 'ENTER' || key === 'BACKSPACE';
            
            return (
              <button
                key={key}
                onClick={() => onKey(key)}
                className={cn(
                  "keyboard-key",
                  isSpecial ? "keyboard-key-large" : "keyboard-key-small",
                  !status && "bg-neutral-200 hover:bg-neutral-300 text-neutral-800",
                  status === 'absent' && "bg-neutral-400 text-white",
                  status === 'correct' && "bg-green-600 text-white",
                  status === 'present' && "bg-green-600 text-white" // In phrase mode, present is also green as it means "exists in phrase"
                )}
              >
                {key === 'BACKSPACE' ? '⌫' : key === 'ENTER' ? '✓' : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

interface BoardProps {
  attempts: string[];
  currentAttempt: string;
  solution: string;
  maxAttempts: number;
  wordLength: number;
  cursorIndex: number;
  onCursorChange: (index: number) => void;
  isPhrase?: boolean;
  discoveredLetters?: Set<string>;
}

export const Board: React.FC<BoardProps> = ({
  attempts,
  currentAttempt,
  solution,
  maxAttempts,
  wordLength,
  cursorIndex,
  onCursorChange,
  isPhrase = false,
  discoveredLetters = new Set()
}) => {
  // Calculate sizes to fit viewport
  const historyCellSize = "clamp(1.5rem, 5vh, 2.5rem)";
  const phraseCellSize = "clamp(1.4rem, 5.5vw, 2.8rem)";
  
  const renderHistoryRow = (attempt: string, rowIndex: number, isCurrent: boolean) => {
    const statuses = !isCurrent ? (isPhrase ? getDiscoveryStatuses(attempt, solution) : getLetterStatuses(attempt, solution)) : [];
    
    return (
      <div key={rowIndex} className="flex justify-center gap-1 mb-1">
        {Array(wordLength).fill(null).map((_, colIndex) => {
          const char = attempt[colIndex] || "";
          const status = statuses[colIndex];
          const isCursor = isCurrent && cursorIndex === colIndex;

          return (
            <motion.div
              key={colIndex}
              onClick={() => isCurrent && onCursorChange(colIndex)}
              initial={false}
              animate={status ? { rotateX: [0, 90, 0] } : {}}
              transition={{ duration: 0.4, delay: colIndex * 0.1 }}
              style={{ width: historyCellSize, height: historyCellSize }}
              className={cn(
                "border-2 flex items-center justify-center font-bold rounded-md transition-all cursor-default select-none text-lg",
                !status && "border-neutral-300",
                isCurrent && "border-neutral-400 bg-white",
                isCursor && "cell-cursor border-indigo-500 ring-2 ring-indigo-200",
                status === 'absent' && "bg-neutral-400 border-neutral-400 text-white",
                status === 'correct' && "bg-green-600 border-green-600 text-white",
                status === 'present' && "bg-yellow-500 border-yellow-500 text-white",
                char && !status && "animate-pop border-neutral-500"
              )}
            >
              {char}
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderPhrase = () => {
    const words = solution.split(' ');
    return (
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-3 w-full max-w-4xl mx-auto py-6 px-2">
        {words.map((word, wordIdx) => (
          <div key={wordIdx} className="flex gap-1 mb-1">
            {word.split('').map((letter, letterIdx) => {
              const isDiscovered = discoveredLetters.has(normalizeWord(letter));
              return (
                <motion.div
                  key={letterIdx}
                  initial={false}
                  animate={isDiscovered ? { scale: [1, 1.1, 1], rotateY: [0, 180, 360] } : {}}
                  transition={{ duration: 0.5 }}
                  style={{ width: phraseCellSize, height: phraseCellSize }}
                  className={cn(
                    "border-2 flex items-center justify-center font-bold rounded-md transition-all select-none text-lg sm:text-xl md:text-2xl shadow-sm",
                    isDiscovered 
                      ? "bg-white border-indigo-500 text-indigo-900 shadow-indigo-100" 
                      : "bg-neutral-200/50 border-neutral-300 text-transparent"
                  )}
                >
                  {isDiscovered ? letter : ""}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-start p-2 overflow-y-auto scrollbar-hide min-h-0">
      {/* History Section */}
      <div className="w-full mb-2 shrink-0">
        <div className="text-[9px] text-center uppercase tracking-widest text-neutral-400 font-bold mb-1">
          Intentos
        </div>
        <div className="flex flex-col">
          {attempts.map((attempt, i) => renderHistoryRow(attempt, i, false))}
          {attempts.length < maxAttempts && renderHistoryRow(currentAttempt, attempts.length, true)}
          {/* Fill remaining rows for visual consistency */}
          {Array(Math.max(0, maxAttempts - attempts.length - 1)).fill(null).map((_, i) => 
            renderHistoryRow("", attempts.length + 1 + i, false)
          )}
        </div>
      </div>

      {/* Phrase Section */}
      {isPhrase && (
        <div className="w-full border-t border-neutral-100 mt-auto pt-2 shrink-0">
          <div className="text-[9px] text-center uppercase tracking-widest text-neutral-400 font-bold mb-1">
            Frase a descubrir
          </div>
          {renderPhrase()}
        </div>
      )}

      {/* Standard Board View for non-phrase modes */}
      {!isPhrase && (
          <div className="flex-1" />
      )}
    </div>
  );
};

export const Toast: React.FC<{ message: string | null; onClose: () => void }> = ({ message, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 bg-neutral-800 text-white px-6 py-3 rounded-full shadow-xl font-medium"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
