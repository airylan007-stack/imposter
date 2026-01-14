import React, { useEffect, useState } from 'react';
import { Player, RoundData, GameStats } from '../types';
import { Button } from './Button';

interface RevealScreenProps {
  players: Player[];
  roundData: RoundData;
  stats: GameStats;
  onPlayAgain: () => void;
  onNewSettings: () => void;
}

export const RevealScreen: React.FC<RevealScreenProps> = ({
  players,
  roundData,
  stats,
  onPlayAgain,
  onNewSettings
}) => {
  const [revealStep, setRevealStep] = useState(0);

  const imposters = players.filter(p => p.isImposter);

  useEffect(() => {
    // Step 0: Initial Load
    // Step 1: Reveal Imposter Name (Reduced to 250ms)
    // Step 2: Reveal Word Details (Reduced to 1250ms)
    const t1 = setTimeout(() => setRevealStep(1), 250);
    const t2 = setTimeout(() => setRevealStep(2), 1250);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="max-w-2xl mx-auto w-full p-4 flex flex-col gap-8">
      
      {/* Imposter Reveal Section */}
      <div className="text-center space-y-4 min-h-[200px] flex flex-col justify-center">
        <h2 className="text-slate-400 font-bold uppercase tracking-widest">The Imposter Was</h2>
        
        <div className={`transition-all duration-1000 transform ${revealStep >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-90 blur-sm'}`}>
          {imposters.map((imp) => (
             <div key={imp.id} className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500 mb-2">
               {imp.name}
             </div>
          ))}
        </div>
        
        {revealStep < 1 && <div className="animate-pulse text-2xl">...</div>}
      </div>

      {/* Secret Word Section */}
      <div className={`bg-slate-800 rounded-2xl p-6 border border-slate-700 transition-all duration-1000 delay-500 ${revealStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Secret Word</p>
            <p className="text-3xl font-bold text-white">{roundData.secretWord}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Category</p>
            <p className="text-2xl text-indigo-300">{roundData.category}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs text-slate-500 uppercase font-bold mb-1">The Hint</p>
            <p className="text-lg text-slate-300 italic">"{roundData.hint}"</p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className={`bg-slate-900/50 rounded-xl p-4 transition-all duration-1000 delay-700 ${revealStep >= 2 ? 'opacity-100' : 'opacity-0'}`}>
        <h3 className="text-slate-400 font-bold text-sm uppercase mb-2">Game Stats</h3>
        <div className="flex justify-between items-center">
          <span>Discussion Time</span>
          <span className="font-mono text-xl text-indigo-400">{formatTime(stats.discussionDurationSeconds)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className={`flex flex-col gap-3 pt-4 transition-all duration-500 delay-1000 ${revealStep >= 2 ? 'opacity-100' : 'opacity-0'}`}>
        <Button onClick={onPlayAgain} fullWidth>
          Play Again (Same Settings)
        </Button>
        <Button onClick={onNewSettings} variant="ghost" fullWidth>
          Change Settings / Players
        </Button>
      </div>

    </div>
  );
};