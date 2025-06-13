import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Users } from 'lucide-react';

const SetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { setPlayers, setGameMode, gameMode } = useGame();
  const [playerNames, setPlayerNames] = useState(['', '']);
  const [thirdPlayerName, setThirdPlayerName] = useState('');

  const handleGameModeChange = (mode: '2' | '3') => {
    setGameMode(mode);
    if (mode === '2') {
      setThirdPlayerName('');
    }
  };

  const handleStartGame = () => {
    const names = gameMode === '3' ? [...playerNames, thirdPlayerName] : playerNames;
    
    if (names.some(name => !name.trim())) {
      alert('الرجاء إدخال أسماء جميع اللاعبين');
      return;
    }

    const players = names.map((name, index) => ({
      id: index + 1,
      name: name.trim(),
      score: 0,
      isInSuddenDeath: false,
      consecutiveCorrect: 0
    }));

    setPlayers(players);
    navigate('/game');
  };

  return (
    <div className="min-h-screen flex flex-col gap-4 items-center justify-center p-4">
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mb-6">
            <img 
              src="/bf072f3f-e318-4730-aa99-d4d96743b1ff.png" 
              alt="كازينو الألعاب" 
              className="mx-auto h-20 w-auto golden-glow"
              style={{
                filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.5))'
              }}
            />
          </div>
          <div className="flex items-center justify-center text-slate-300 mb-6">
            <Users className="w-5 h-5 ml-2" />
            <span>اختر عدد اللاعبين</span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Game Mode Selection */}
          <div className="flex gap-3">
            <button
              onClick={() => handleGameModeChange('2')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                gameMode === '2'
                  ? 'golden-glow-button text-slate-900'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              لاعبان
            </button>
            <button
              onClick={() => handleGameModeChange('3')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                gameMode === '3'
                  ? 'golden-glow-button text-slate-900'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              ٣ لاعبين
            </button>
          </div>

          {/* Player Name Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                اسم اللاعب الأول
              </label>
              <input
                type="text"
                value={playerNames[0]}
                onChange={(e) => setPlayerNames([e.target.value, playerNames[1]])}
                placeholder="أدخل اسم اللاعب الأول"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                اسم اللاعب الثاني
              </label>
              <input
                type="text"
                value={playerNames[1]}
                onChange={(e) => setPlayerNames([playerNames[0], e.target.value])}
                placeholder="أدخل اسم اللاعب الثاني"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
              />
            </div>

            {gameMode === '3' && (
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  اسم اللاعب الثالث
                </label>
                <input
                  type="text"
                  value={thirdPlayerName}
                  onChange={(e) => setThirdPlayerName(e.target.value)}
                  placeholder="أدخل اسم اللاعب الثالث"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                />
              </div>
            )}
          </div>

          <button
            onClick={handleStartGame}
            className="w-full py-4 golden-glow-button text-slate-900 font-bold text-lg rounded-xl transition-all duration-300 hover:scale-105"
          >
            ابدأ اللعبة
          </button>
        </div>
      </div>
      <footer className="text-slate-300 ltr:ml-3">Copyright© 2025 All rights reserved | Developed by Ahmed Gomaa</footer>
    </div>
  );
};

export default SetupPage;