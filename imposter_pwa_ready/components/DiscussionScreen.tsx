import React, { useState, useEffect } from 'react';
import { Button } from './Button';

interface DiscussionScreenProps {
  onReveal: () => void;
  startTime: number;
}

export const DiscussionScreen: React.FC<DiscussionScreenProps> = ({ onReveal, startTime }) => {
  // Simple elapsed time ticker for visual feedback, actual calc happens in parent
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 space-y-12">
      <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500">
        <div className="inline-block px-4 py-1 rounded-full bg-indigo-900/50 border border-indigo-500/30 text-indigo-300 text-sm font-bold uppercase tracking-wider mb-4">
          Discussion Phase
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white">Find the Imposter</h2>
        <p className="text-slate-400 max-w-md mx-auto">
          Ask questions, describe the word, but be careful not to reveal too much!
        </p>
      </div>

      <div className="text-6xl font-mono font-bold text-slate-700 tabular-nums select-none">
        {formatTime(elapsed)}
      </div>

      <div className="w-full max-w-xs">
        <button
          onClick={onReveal}
          className="w-full aspect-square rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-[0_0_60px_-15px_rgba(239,68,68,0.5)] border-4 border-red-400 text-white font-black text-2xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform duration-200 flex flex-col items-center justify-center gap-2 group"
        >
          <span>Reveal</span>
          <span className="text-xs font-normal opacity-70 group-hover:opacity-100 transition-opacity">Stop Timer</span>
        </button>
      </div>
    </div>
  );
};