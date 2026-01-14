import React, { useState } from 'react';
import { Player, RoundData, GameSettings } from '../types';
import { Button } from './Button';

interface DistributionScreenProps {
  players: Player[];
  roundData: RoundData;
  settings: GameSettings;
  onPlayerViewed: (playerId: string) => void;
  onAllViewed: () => void;
}

export const DistributionScreen: React.FC<DistributionScreenProps> = ({
  players,
  roundData,
  settings,
  onPlayerViewed,
  onAllViewed
}) => {
  const [viewingPlayerId, setViewingPlayerId] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  const viewingPlayer = players.find(p => p.id === viewingPlayerId);
  const allViewed = players.every(p => p.hasViewed);

  // If we just finished viewing, check if we should auto-advance
  React.useEffect(() => {
    if (allViewed && !viewingPlayerId) {
      onAllViewed();
    }
  }, [allViewed, viewingPlayerId, onAllViewed]);

  const handleCardClick = (player: Player) => {
    if (player.hasViewed) return;
    setViewingPlayerId(player.id);
    setIsRevealed(false);
  };

  const handleReturn = () => {
    if (viewingPlayerId) {
      onPlayerViewed(viewingPlayerId);
      setViewingPlayerId(null);
      setIsRevealed(false);
    }
  };

  if (viewingPlayerId && viewingPlayer) {
    // Individual Reveal View
    return (
      <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
        <div className="max-w-md w-full bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">{viewingPlayer.name}</h2>
          <p className="text-slate-400 mb-8">Tap below to reveal your secret identity</p>
          
          <div 
            onClick={() => setIsRevealed(true)}
            className={`cursor-pointer min-h-[200px] flex flex-col items-center justify-center rounded-xl border-2 transition-all duration-500 mb-8 p-6 ${
              isRevealed 
                ? viewingPlayer.isImposter ? 'bg-red-900/20 border-red-500' : 'bg-indigo-900/20 border-indigo-500'
                : 'bg-slate-700 border-slate-600 hover:border-slate-500'
            }`}
          >
            {!isRevealed ? (
              <div className="text-6xl">🙈</div>
            ) : (
              <div className="animate-in zoom-in duration-300 space-y-4">
                {viewingPlayer.isImposter ? (
                  <>
                    <h3 className="text-3xl font-black text-red-500 uppercase tracking-widest">IMPOSTER</h3>
                    <div className="text-slate-300 space-y-2">
                      <p>Try to blend in!</p>
                      {(settings.showCategoryToImposter) && (
                         <p className="text-sm bg-slate-900/50 p-2 rounded">Category: <span className="font-bold text-white">{roundData.category}</span></p>
                      )}
                      {(settings.showHintToImposter) && (
                         <p className="text-sm bg-slate-900/50 p-2 rounded">Hint: <span className="font-bold text-white">{roundData.hint}</span></p>
                      )}
                      {(!settings.showCategoryToImposter && !settings.showHintToImposter) && (
                        <p className="text-sm italic opacity-75">You know nothing.</p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                     <h3 className="text-lg font-bold text-indigo-300 uppercase tracking-widest">INNOCENT</h3>
                     <div className="space-y-4">
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-bold">Secret Word</p>
                          <p className="text-3xl font-black text-white">{roundData.secretWord}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-bold">Category</p>
                          <p className="text-xl text-indigo-200">{roundData.category}</p>
                        </div>
                     </div>
                  </>
                )}
              </div>
            )}
          </div>

          <Button 
            onClick={handleReturn}
            disabled={!isRevealed}
            fullWidth
            variant={viewingPlayer.isImposter && isRevealed ? 'danger' : 'primary'}
          >
            RETURN
          </Button>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="max-w-4xl mx-auto w-full p-4 flex flex-col h-full">
       <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white">Pass the Device</h2>
        <p className="text-slate-400">Click your name to see your role</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-fr">
        {players.map((player) => (
          <button
            key={player.id}
            onClick={() => handleCardClick(player)}
            disabled={player.hasViewed}
            className={`
              relative p-6 rounded-xl text-center font-bold text-lg transition-all transform duration-200
              ${player.hasViewed 
                ? 'bg-slate-800/50 text-slate-600 border border-slate-800 cursor-not-allowed' 
                : 'bg-slate-700 text-white border-2 border-indigo-500/30 hover:border-indigo-500 hover:shadow-lg hover:-translate-y-1 hover:shadow-indigo-500/20'
              }
            `}
          >
            {player.name}
            {player.hasViewed && (
              <span className="absolute top-2 right-2 text-green-500 text-xs">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};