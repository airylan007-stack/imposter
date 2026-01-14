import React, { useState, useCallback } from 'react';
import { GamePhase, GameSettings, Player, RoundData, Category, GameStats } from './types';
import { generateGameRound } from './services/geminiService';
import { SetupScreen } from './components/SetupScreen';
import { DistributionScreen } from './components/DistributionScreen';
import { DiscussionScreen } from './components/DiscussionScreen';
import { RevealScreen } from './components/RevealScreen';

// Default Settings
const INITIAL_SETTINGS: GameSettings = {
  categories: Object.values(Category).reduce((acc, cat) => ({ ...acc, [cat]: true }), {} as Record<Category, boolean>),
  numImposters: 1,
  showCategoryToImposter: false,
  showHintToImposter: false,
  hintDifficulty: 1,
};

const App: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.SETUP);
  const [players, setPlayers] = useState<Player[]>([]);
  const [settings, setSettings] = useState<GameSettings>(INITIAL_SETTINGS);
  const [roundData, setRoundData] = useState<RoundData | null>(null);
  
  // Track used words per category: Record<CategoryName, ListOfWords>
  const [usedWords, setUsedWords] = useState<Record<string, string[]>>({});
  
  // Timer Refs
  const [discussionStartTime, setDiscussionStartTime] = useState<number>(0);
  const [gameStats, setGameStats] = useState<GameStats>({ discussionDurationSeconds: 0 });

  // Error State
  const [error, setError] = useState<string | null>(null);

  const startGame = async (names: string[], newSettings: GameSettings) => {
    setSettings(newSettings);
    setPhase(GamePhase.LOADING);
    setError(null);

    try {
      // 1. Generate Content
      const enabledCategories = Object.entries(newSettings.categories)
        .filter(([_, enabled]) => enabled)
        .map(([cat]) => cat as Category);

      const data = await generateGameRound(enabledCategories, usedWords, newSettings.hintDifficulty);
      setRoundData(data);
      
      // Update history for the specific category
      setUsedWords(prev => {
        const catHistory = prev[data.category] || [];
        return {
          ...prev,
          [data.category]: [...catHistory, data.secretWord]
        };
      });

      // 2. Assign Roles
      const imposterCount = Math.min(newSettings.numImposters, names.length - 1);
      const shuffledIndices = Array.from({ length: names.length }, (_, i) => i)
        .sort(() => Math.random() - 0.5);
      
      const imposterIndices = new Set(shuffledIndices.slice(0, imposterCount));

      const newPlayers: Player[] = names.map((name, index) => ({
        id: `p-${index}-${Date.now()}`,
        name,
        isImposter: imposterIndices.has(index),
        hasViewed: false
      }));

      setPlayers(newPlayers);
      setPhase(GamePhase.DISTRIBUTION);

    } catch (e) {
      setError("Failed to generate game. Please try again. " + (e instanceof Error ? e.message : ""));
      setPhase(GamePhase.SETUP);
    }
  };

  const handlePlayerViewed = (id: string) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, hasViewed: true } : p));
  };

  const handleAllViewed = useCallback(() => {
    setDiscussionStartTime(Date.now());
    setPhase(GamePhase.DISCUSSION);
  }, []);

  const handleReveal = () => {
    const duration = Math.floor((Date.now() - discussionStartTime) / 1000);
    setGameStats({ discussionDurationSeconds: duration });
    setPhase(GamePhase.REVEAL);
  };

  const handlePlayAgain = () => {
    // Reuse names and settings
    startGame(players.map(p => p.name), settings);
  };

  const handleNewSettings = () => {
    setPhase(GamePhase.SETUP);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col">
      {/* Header / Top Bar (Optional, mostly for clean layout) */}
      <div className="w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      
      <main className="flex-1 flex flex-col">
        {phase === GamePhase.SETUP && (
          <div className="flex-1 flex items-center">
             <SetupScreen onStartGame={startGame} initialSettings={settings} />
          </div>
        )}

        {phase === GamePhase.LOADING && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xl font-bold animate-pulse">Generating Secret Word...</p>
          </div>
        )}

        {phase === GamePhase.DISTRIBUTION && roundData && (
          <div className="flex-1 py-8">
            <DistributionScreen 
              players={players} 
              roundData={roundData} 
              settings={settings}
              onPlayerViewed={handlePlayerViewed}
              onAllViewed={handleAllViewed}
            />
          </div>
        )}

        {phase === GamePhase.DISCUSSION && (
          <div className="flex-1 flex items-center justify-center">
            <DiscussionScreen onReveal={handleReveal} startTime={discussionStartTime} />
          </div>
        )}

        {phase === GamePhase.REVEAL && roundData && (
          <div className="flex-1 flex items-center">
            <RevealScreen 
              players={players} 
              roundData={roundData} 
              stats={gameStats}
              onPlayAgain={handlePlayAgain}
              onNewSettings={handleNewSettings}
            />
          </div>
        )}
      </main>

      {error && (
        <div className="fixed bottom-4 left-4 right-4 bg-red-900/90 border border-red-500 text-white p-4 rounded-lg shadow-lg z-50 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold px-3">✕</button>
        </div>
      )}
    </div>
  );
};

export default App;