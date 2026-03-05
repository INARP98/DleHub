import React, { useState, useEffect } from 'react';
import { GameContainer } from '../ui/GameContainer';
import { loadWordLists } from '../engine/loader';

export const TimeAttackMode: React.FC = () => {
    const [solution, setSolution] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(120);
    const [score, setScore] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);

    useEffect(() => {
        loadWordLists().then(lists => {
            const randomSol = lists.solutions[Math.floor(Math.random() * lists.solutions.length)];
            setSolution(randomSol);
        });
    }, []);

    useEffect(() => {
        if (timeLeft > 0 && !isGameOver) {
            const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0) {
            setIsGameOver(true);
        }
    }, [timeLeft, isGameOver]);

    const handleComplete = (won: boolean) => {
        if (won) {
            setScore(s => s + 1);
            // Load next word
            loadWordLists().then(lists => {
                const randomSol = lists.solutions[Math.floor(Math.random() * lists.solutions.length)];
                setSolution(randomSol);
            });
        }
    };

    if (!solution) return null;

    const timerContent = (
        <div className="flex gap-8 bg-white/90 backdrop-blur px-6 py-2 rounded-full shadow-md border border-indigo-100 mb-4 shrink-0">
            <div className="text-center">
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Tiempo</p>
                <p className={cn("text-xl font-mono font-bold", timeLeft < 20 ? "text-red-500 animate-pulse" : "text-neutral-800")}>
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </p>
            </div>
            <div className="text-center">
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Puntos</p>
                <p className="text-xl font-mono font-bold text-indigo-600">{score}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col">
            <GameContainer 
                key={score} // Reset game for each new word
                mode="time-attack"
                solution={solution}
                onComplete={handleComplete}
                topContent={timerContent}
            />
            {isGameOver && (
                <div className="fixed inset-0 bg-neutral-900/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center text-white p-6">
                    <h2 className="text-5xl font-black mb-4 tracking-tighter">¡TIEMPO AGOTADO!</h2>
                    <p className="text-2xl mb-8 opacity-80">Has conseguido <span className="text-indigo-400 font-bold">{score}</span> puntos</p>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => window.location.reload()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all"
                        >
                            Reintentar
                        </button>
                        <Link 
                            to="/"
                            className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all"
                        >
                            Volver al HUB
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

import { cn } from '../../../core/utils';
import { Link } from 'react-router-dom';
