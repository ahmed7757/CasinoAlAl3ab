import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Trophy, RotateCcw, Home, Clock } from 'lucide-react';

const WinnerPage: React.FC = () => {
  const navigate = useNavigate();
  const { winner, startNewGame, resetGame, gameEvents } = useGame();

  React.useEffect(() => {
    if (!winner) {
      navigate('/');
    }
  }, [winner, navigate]);

  const handlePlayAgain = () => {
    startNewGame();
    navigate('/game');
  };

  const handleNewGame = () => {
    resetGame();
    navigate('/');
  };

  const getWinType = () => {
    if (!winner) return '';
    
    if (winner.isInSuddenDeath && winner.score >= 12) {
      return 'فوز في الجولة الحاسمة النهائية! 🔥';
    } else if (winner.isInSuddenDeath) {
      return 'فوز في الجولة الحاسمة! 🔥';
    } else {
      return 'فوز عادي! 🎯';
    }
  };

  if (!winner) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Confetti Animation */}
      <div className="confetti"></div>
      <div className="confetti" style={{ animationDelay: '0.5s', left: '10%' }}></div>
      <div className="confetti" style={{ animationDelay: '1s', left: '20%' }}></div>
      <div className="confetti" style={{ animationDelay: '1.5s', left: '30%' }}></div>
      <div className="confetti" style={{ animationDelay: '0.3s', left: '40%' }}></div>
      <div className="confetti" style={{ animationDelay: '0.8s', left: '50%' }}></div>
      <div className="confetti" style={{ animationDelay: '1.2s', left: '60%' }}></div>
      <div className="confetti" style={{ animationDelay: '0.7s', left: '70%' }}></div>
      <div className="confetti" style={{ animationDelay: '1.7s', left: '80%' }}></div>
      <div className="confetti" style={{ animationDelay: '0.2s', left: '90%' }}></div>

      <div className="text-center winner-celebration relative z-10">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="/bf072f3f-e318-4730-aa99-d4d96743b1ff.png" 
            alt="كازينو الألعاب" 
            className="mx-auto h-16 w-auto golden-glow mb-6"
            style={{
              filter: 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.7))'
            }}
          />
        </div>

        {/* Winner Title */}
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold golden-glow mb-4">
            الفائز
          </h1>
          <Trophy className="w-20 h-20 mx-auto text-yellow-400 golden-glow" />
        </div>

        {/* Winner Name */}
        <div className="mb-8">
          <h2 className="text-4xl md:text-6xl font-bold golden-glow mb-2">
            {winner.name}
          </h2>
          <div className="text-2xl md:text-3xl font-bold text-white">
            النقاط النهائية: {winner.score}
          </div>
        </div>

        {/* Celebration Message */}
        <div className="mb-12">
          <p className="text-xl md:text-2xl text-yellow-300 font-semibold">
            🎉 مبروك! لقد فزت بـ كازينو الألعاب! 🎉
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <button
            onClick={handlePlayAgain}
            className="flex items-center justify-center gap-3 py-4 px-8 golden-glow-button text-slate-900 font-bold text-lg rounded-xl transition-all duration-300 hover:scale-105"
          >
            <RotateCcw className="w-5 h-5" />
            العب مرة أخرى
          </button>
          
          <button
            onClick={handleNewGame}
            className="flex items-center justify-center gap-3 py-4 px-8 bg-slate-700 hover:bg-slate-600 text-white font-bold text-lg rounded-xl transition-all duration-300 hover:scale-105"
          >
            <Home className="w-5 h-5" />
            لعبة جديدة
          </button>
        </div>

        {/* Game Stats */}
        <div className="mt-12 bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700 max-w-md mx-auto">
          <h3 className="text-lg font-bold text-yellow-400 mb-4">إحصائيات اللعبة</h3>
          <div className="text-slate-300 space-y-2">
            <p>الفائز: {winner.name}</p>
            <p>النقاط النهائية: {winner.score}</p>
            <p className="text-yellow-400 font-bold">{getWinType()}</p>
            {winner.consecutiveCorrect > 0 && (
              <p className="text-green-400">إجابات صحيحة متتالية: {winner.consecutiveCorrect}</p>
            )}
          </div>
        </div>

        {/* Recent Game Events */}
        {gameEvents.length > 0 && (
          <div className="mt-8 bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2 justify-center">
              <Clock className="w-5 h-5" />
              آخر الأحداث
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {gameEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{event.playerName}</span>
                  <span className={`font-bold ${
                    event.scoreChange > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {event.scoreChange > 0 ? '+' : ''}{event.scoreChange}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WinnerPage;