import React, { useState } from 'react';
import { Category, GameSettings } from '../types';
import { Button } from './Button';

interface SetupScreenProps {
  onStartGame: (names: string[], settings: GameSettings) => void;
  initialSettings: GameSettings;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onStartGame, initialSettings }) => {
  const [playerNames, setPlayerNames] = useState<string[]>(['', '', '', '', '']);
  const [settings, setSettings] = useState<GameSettings>(initialSettings);
  const [activeTab, setActiveTab] = useState<'players' | 'settings'>('players');

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...playerNames];
    newNames[index] = value;
    setPlayerNames(newNames);
  };

  const addPlayer = () => {
    setPlayerNames([...playerNames, '']);
  };

  const removePlayer = (index: number) => {
    if (playerNames.length <= 3) return; // Minimum limit
    const newNames = playerNames.filter((_, i) => i !== index);
    setPlayerNames(newNames);
  };

  const toggleCategory = (cat: Category) => {
    setSettings(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [cat]: !prev.categories[cat]
      }
    }));
  };

  const validPlayerCount = playerNames.filter(n => n.trim().length > 0).length;
  const canStart = validPlayerCount >= 3;

  return (
    <div className="max-w-2xl mx-auto w-full p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">
          IMPOSTER
        </h1>
        <p className="text-slate-400">Find the spy among us</p>
      </div>

      <div className="flex bg-slate-800/50 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab('players')}
          className={`flex-1 py-2 rounded-md font-semibold transition-all ${activeTab === 'players' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
        >
          Players
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-2 rounded-md font-semibold transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
        >
          Settings
        </button>
      </div>

      <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700">
        {activeTab === 'players' ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">Who's Playing?</h2>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
              {playerNames.map((name, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    placeholder={`Player ${index + 1}`}
                    value={name}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  {playerNames.length > 3 && (
                    <button 
                      onClick={() => removePlayer(index)}
                      className="p-3 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Remove Player"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <Button 
              variant="secondary" 
              fullWidth 
              onClick={addPlayer}
              className="border-dashed"
            >
              + Add Player
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-bold text-white">Game Configuration</h3>
              
              <div className="flex justify-between items-center bg-slate-900 p-4 rounded-lg">
                <span>Number of Imposters</span>
                <div className="flex gap-2">
                  {[1, 2, 3].map(num => (
                    <button
                      key={num}
                      onClick={() => setSettings(s => ({ ...s, numImposters: num }))}
                      className={`w-10 h-10 rounded-lg font-bold border ${
                        settings.numImposters === num 
                          ? 'bg-indigo-600 border-indigo-500 text-white' 
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-lg space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-200">Show Category to Imposter</span>
                  <div 
                    className={`w-12 h-7 rounded-full relative transition-colors ${settings.showCategoryToImposter ? 'bg-indigo-500' : 'bg-slate-600'}`}
                    onClick={() => setSettings(s => ({ ...s, showCategoryToImposter: !s.showCategoryToImposter }))}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${settings.showCategoryToImposter ? 'left-6' : 'left-1'}`} />
                  </div>
                </label>
                
                <div className="border-t border-slate-800 pt-3">
                  <label className="flex items-center justify-between cursor-pointer mb-2">
                    <span className="text-slate-200">Show Hint to Imposter</span>
                    <div 
                      className={`w-12 h-7 rounded-full relative transition-colors ${settings.showHintToImposter ? 'bg-indigo-500' : 'bg-slate-600'}`}
                      onClick={() => setSettings(s => ({ ...s, showHintToImposter: !s.showHintToImposter }))}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${settings.showHintToImposter ? 'left-6' : 'left-1'}`} />
                    </div>
                  </label>
                  
                  {settings.showHintToImposter && (
                    <div className="bg-slate-800/50 p-3 rounded-lg animate-in fade-in slide-in-from-top-2">
                      <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                        <span>Easy</span>
                        <span className="text-indigo-400">Difficulty: {settings.hintDifficulty}</span>
                        <span>Hard</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        value={settings.hintDifficulty} 
                        onChange={(e) => setSettings(s => ({ ...s, hintDifficulty: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-white mb-3">Categories</h3>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {Object.values(Category).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-2 rounded text-sm font-medium text-left transition-colors border ${
                      settings.categories[cat]
                        ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-200'
                        : 'bg-slate-900 border-slate-700 text-slate-500'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8">
        <Button 
          fullWidth 
          onClick={() => onStartGame(playerNames.filter(n => n.trim()), settings)}
          disabled={!canStart}
        >
          START GAME ({validPlayerCount} Players)
        </Button>
        {!canStart && (
          <p className="text-center text-sm text-red-400 mt-2">Need at least 3 players to start.</p>
        )}
      </div>
    </div>
  );
};