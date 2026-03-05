import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Play, Clock, Calendar, Type, ChevronRight, Info } from 'lucide-react';
import { cn, getDailyKey } from '../core/utils';
import { getDailyState } from '../core/storage';

interface GameCardProps {
  title: string;
  description: string;
  status: 'available' | 'upcoming';
  icon: React.ReactNode;
  modes?: { id: string; name: string; path: string; icon: React.ReactNode }[];
}

const GameCard: React.FC<GameCardProps> = ({ title, description, status, icon, modes }) => {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState(modes?.[0]?.id);

  const handlePlay = () => {
    const mode = modes?.find(m => m.id === selectedMode);
    if (mode) {
      // Check daily status
      if (mode.id === 'daily-word' || mode.id === 'daily-phrase') {
          const key = mode.id === 'daily-word' ? `daily_word_${getDailyKey()}` : `daily_phrase_${getDailyKey()}`;
          const state = getDailyState(key);
          if (state && state.completed) {
              alert(mode.id === 'daily-word' 
                ? "La palabra ya fue realizada, espere a que se reinicie la palabra del día."
                : "La frase ya fue realizada, espere a que se reinicie la frase del día."
              );
              navigate(mode.path); // Still navigate to see results
              return;
          }
      }
      navigate(mode.path);
    }
  };

  const isCompleted = (modeId: string) => {
      if (modeId === 'daily-word' || modeId === 'daily-phrase') {
          const key = modeId === 'daily-word' ? `daily_word_${getDailyKey()}` : `daily_phrase_${getDailyKey()}`;
          const state = getDailyState(key);
          return state && state.completed;
      }
      return false;
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 flex flex-col h-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
          {icon}
        </div>
        <span className={cn(
          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
          status === 'available' ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"
        )}>
          {status === 'available' ? 'Disponible' : 'Próximamente'}
        </span>
      </div>
      
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-neutral-500 text-sm mb-6 flex-1">{description}</p>

      {status === 'available' && modes && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-2">
            {modes.map(mode => {
                const completed = isCompleted(mode.id);
                return (
                    <button
                        key={mode.id}
                        onClick={() => setSelectedMode(mode.id)}
                        className={cn(
                            "flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left",
                            selectedMode === mode.id 
                                ? "border-indigo-600 bg-indigo-50/50" 
                                : "border-neutral-100 hover:border-neutral-200"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className={cn("p-1.5 rounded-lg", selectedMode === mode.id ? "bg-indigo-100 text-indigo-600" : "bg-neutral-100 text-neutral-500")}>
                                {mode.icon}
                            </div>
                            <div>
                                <p className="text-sm font-bold">{mode.name}</p>
                                {completed && <p className="text-[10px] text-green-600 font-bold uppercase">Completado</p>}
                            </div>
                        </div>
                        <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                            selectedMode === mode.id ? "border-indigo-600 bg-indigo-600" : "border-neutral-200"
                        )}>
                            {selectedMode === mode.id && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                    </button>
                );
            })}
          </div>
          
          <button 
            onClick={handlePlay}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            {isCompleted(selectedMode!) ? 'Ver resultados' : 'Jugar ahora'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {status === 'upcoming' && (
        <div className="mt-auto">
          <button disabled className="w-full bg-neutral-100 text-neutral-400 py-4 rounded-2xl font-bold cursor-not-allowed">
            Próximamente
          </button>
        </div>
      )}
    </motion.div>
  );
};

export const Home: React.FC = () => {
  return (
    <div className="bg-neutral-50 pb-20">
      <header className="bg-white border-b px-6 py-8 mb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-2xl">D</div>
            <h1 className="text-3xl font-black tracking-tighter text-neutral-900">DleHub</h1>
          </div>
          <p className="text-neutral-500 font-medium">Tu centro de desafíos diarios en español.</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GameCard 
            title="LexiLogic"
            description="El clásico juego de palabras con un giro lógico. Adivina la palabra o frase oculta."
            status="available"
            icon={<Type className="w-6 h-6" />}
            modes={[
              { id: 'daily-word', name: 'Palabra del día', path: '/juegos/lexilogic/palabra-del-dia', icon: <Calendar className="w-4 h-4" /> },
              { id: 'daily-phrase', name: 'Frase del día', path: '/juegos/lexilogic/frase-del-dia', icon: <Type className="w-4 h-4" /> },
              { id: 'time-attack', name: 'Contrarreloj', path: '/juegos/lexilogic/contrarreloj', icon: <Clock className="w-4 h-4" /> },
            ]}
          />
          
          <GameCard 
            title="Colorle"
            description="Adivina el código de colores secreto. Próximamente en DleHub."
            status="upcoming"
            icon={<div className="w-6 h-6 rounded-full bg-gradient-to-tr from-red-500 via-green-500 to-blue-500" />}
          />

          <GameCard 
            title="Sudokudle"
            description="El desafío numérico definitivo. Resuelve el sudoku diario."
            status="upcoming"
            icon={<div className="grid grid-cols-2 gap-0.5 w-6 h-6"><div className="bg-current opacity-20" /><div className="bg-current" /><div className="bg-current" /><div className="bg-current opacity-20" /></div>}
          />
        </div>
      </main>
    </div>
  );
};
