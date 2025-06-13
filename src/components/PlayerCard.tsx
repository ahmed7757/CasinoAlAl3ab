import React from 'react';
import { Player } from '../context/GameContext';
import { useGame } from '../context/GameContext';
import { Check, X, Zap } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
  const { updatePlayerScore, applyPenaltyCard, players } = useGame();

  const handleScoreUpdate = (increment: boolean) => {
    updatePlayerScore(player.id, increment);
  };

  const handlePenaltyCard = (cardType: 'yellow' | 'red') => {
    applyPenaltyCard(player.id, cardType);
  };

  const getSuddenDeathStatus = () => {
    if (!player.isInSuddenDeath) return null;
    
    const suddenDeathPlayers = players.filter(p => p.isInSuddenDeath);
    if (suddenDeathPlayers.length < 2) return null;
    
    const scores = suddenDeathPlayers.map(p => p.score).sort((a, b) => b - a);
    const maxScore = scores[0];
    const minScore = scores[scores.length - 1];
    
    // Check if we're in the final phase (race to 14)
    if (minScore >= 12) {
      return `مرحلة الحسم النهائية - مطلوب الوصول لـ 14`;
    }
    
    // Otherwise, we're in the 2-point difference phase
    const difference = maxScore - (scores[1] || 0);
    return `مطلوب فارق نقطتين - الفارق الحالي: ${difference}/2`;
  };

  const getProgressBarColor = () => {
    if (player.isInSuddenDeath) {
      const suddenDeathPlayers = players.filter(p => p.isInSuddenDeath);
      const minScore = Math.min(...suddenDeathPlayers.map(p => p.score));
      
      // Final phase (race to 14) - red glow
      if (minScore >= 12) {
        return 'bg-gradient-to-r from-red-400 to-red-600';
      }
      // Regular sudden death - yellow glow
      return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    } else if (player.score >= 8) {
      return 'bg-gradient-to-r from-orange-400 to-red-500';
    } else if (player.score < 0) {
      return 'bg-gradient-to-r from-red-600 to-red-800';
    } else {
      return 'bg-gradient-to-r from-blue-400 to-blue-600';
    }
  };

  const getProgressBarWidth = () => {
    if (player.score < 0) {
      return 0;
    }
    // Extend progress bar for sudden death scenarios
    if (player.isInSuddenDeath && player.score > 10) {
      return Math.min(((player.score - 10) / 4) * 100 + 100, 200); // Extended range for 11-14
    }
    return Math.min((player.score / 10) * 100, 100);
  };

  const getCardGlow = () => {
    if (!player.isInSuddenDeath) return '';
    
    const suddenDeathPlayers = players.filter(p => p.isInSuddenDeath);
    const minScore = Math.min(...suddenDeathPlayers.map(p => p.score));
    
    // Final phase gets red glow
    if (minScore >= 12) {
      return 'border-red-500 shadow-red-500/50';
    }
    // Regular sudden death gets yellow glow
    return 'border-yellow-500 shadow-yellow-500/50';
  };

  return (
    <div className={`
      bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border transition-all duration-300
      ${player.isInSuddenDeath 
        ? `sudden-death-glow ${getCardGlow()}` 
        : 'border-slate-700 hover:border-slate-600'
      }
    `}>
      {/* Player Name & Sudden Death Indicator */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">
          {player.name}
        </h3>
        {player.isInSuddenDeath && (
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
            players.filter(p => p.isInSuddenDeath).some(p => p.score >= 12)
              ? 'bg-red-500/20 border-red-500'
              : 'bg-yellow-500/20 border-yellow-500'
          }`}>
            <Zap className={`w-4 h-4 ${
              players.filter(p => p.isInSuddenDeath).some(p => p.score >= 12)
                ? 'text-red-400'
                : 'text-yellow-400'
            }`} />
            <span className={`text-xs font-bold ${
              players.filter(p => p.isInSuddenDeath).some(p => p.score >= 12)
                ? 'text-red-400'
                : 'text-yellow-400'
            }`}>
              {players.filter(p => p.isInSuddenDeath).some(p => p.score >= 12) ? 'نهائية' : 'حاسمة'}
            </span>
          </div>
        )}
      </div>

      {/* Score Display */}
      <div className="text-center mb-6">
        <div className={`text-6xl font-bold mb-2 ${
          player.score < 0 ? 'text-red-400' : 'text-white'
        }`}>
          {player.score}
        </div>
        {player.isInSuddenDeath && (
          <div className={`text-sm font-bold ${
            players.filter(p => p.isInSuddenDeath).some(p => p.score >= 12)
              ? 'text-red-400'
              : 'text-yellow-400'
          }`}>
            {getSuddenDeathStatus()}
          </div>
        )}
      </div>

      {/* Action Buttons Grid */}
      <div className="space-y-3">
        {/* Score Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleScoreUpdate(true)}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Check className="w-5 h-5" />
            +1
          </button>
          <button
            onClick={() => handleScoreUpdate(false)}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <X className="w-5 h-5" />
            -1
          </button>
        </div>

        {/* Penalty Cards */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handlePenaltyCard('yellow')}
            className="flex items-center justify-center gap-2 py-2 px-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 text-sm"
          >
            <img src="/yellow-card.png" alt="Yellow Card" className="w-8 h-auto drop-shadow-lg" />
            بطاقة صفراء
          </button>
          <button
            onClick={() => handlePenaltyCard('red')}
            className="flex items-center justify-center gap-2 py-2 px-3 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 text-sm"
          >
            <img src="/red-card.png" alt="Red Card" className="w-8 h-auto drop-shadow-lg" />
            بطاقة حمراء
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor()}`}
            style={{ width: `${Math.min(getProgressBarWidth(), 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>{player.score}</span>
          <span>{player.isInSuddenDeath && player.score > 10 ? '14' : '10'}</span>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;