import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import PlayerCard from '../components/PlayerCard';
import { RotateCcw, Home, Clock, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

const GamePage: React.FC = () => {
  const navigate = useNavigate();
  const { players, winner, resetGame, startNewGame, gameEvents } = useGame();
  const [showHistory, setShowHistory] = useState(false);

  React.useEffect(() => {
    if (players.length === 0) {
      navigate('/');
    }
  }, [players, navigate]);

  React.useEffect(() => {
    if (winner) {
      const timer = setTimeout(() => {
        navigate('/winner');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [winner, navigate]);

  const handleReset = () => {
    resetGame();
    navigate('/');
  };

  const hasSuddenDeathPlayers = players.some(player => player.isInSuddenDeath);
  const suddenDeathPlayers = players.filter(player => player.isInSuddenDeath);
  
  const getSuddenDeathInfo = () => {
    if (!hasSuddenDeathPlayers || suddenDeathPlayers.length < 2) return null;
    
    const scores = suddenDeathPlayers.map(p => p.score).sort((a, b) => b - a);
    const maxScore = scores[0];
    const minScore = scores[scores.length - 1];
    
    // Phase 2: Race to 14 (after everyone reaches 12)
    if (minScore >= 12) {
      return {
        phase: 'final',
        message: 'مرحلة الحسم النهائية - أول من يصل للنقطة 14 يفوز!',
        details: `أعلى نقاط: ${maxScore} | مطلوب: 14`
      };
    }
    
    // Phase 1: 2-point difference rule
    const difference = maxScore - (scores[1] || 0);
    return {
      phase: 'difference',
      message: 'الجولة الحاسمة - مطلوب فارق نقطتين للفوز',
      details: `أعلى نقاط: ${maxScore} | الفارق الحالي: ${difference}/2`
    };
  };

  const suddenDeathInfo = getSuddenDeathInfo();

  if (players.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex gap-4">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-all"
          >
            <Home className="w-4 h-4" />
            العودة
          </button>
          
          {gameEvents.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-all"
            >
              <Clock className="w-4 h-4" />
              سجل الأحداث
              {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
        
        <div className="text-center">
          <img 
            src="/bf072f3f-e318-4730-aa99-d4d96743b1ff.png" 
            alt="كازينو الألعاب" 
            className="mx-auto h-12 w-auto golden-glow"
            style={{
              filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.5))'
            }}
          />
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={() => startNewGame()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            تحديث
          </button>
        </div>
      </div>

      {/* Sudden Death Indicator */}
      {suddenDeathInfo && (
        <div className="text-center mb-6">
          <div className={`inline-block px-6 py-4 rounded-xl border-2 ${
            suddenDeathInfo.phase === 'final' 
              ? 'bg-red-500/20 border-red-500' 
              : 'bg-yellow-500/20 border-yellow-500'
          }`}>
            <div className={`font-bold text-lg mb-1 ${
              suddenDeathInfo.phase === 'final' ? 'text-red-400 golden-glow' : 'text-yellow-400 golden-glow'
            }`}>
              🔥 {suddenDeathInfo.message} 🔥
            </div>
            <div className={`text-sm ${
              suddenDeathInfo.phase === 'final' ? 'text-red-300' : 'text-yellow-300'
            }`}>
              {suddenDeathInfo.details}
            </div>
          </div>
        </div>
      )}

      {/* Game Events Log - Collapsible */}
      {showHistory && gameEvents.length > 0 && (
        <div className="mb-6 max-w-4xl mx-auto bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            سجل الأحداث
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {gameEvents.slice(0, 20).map((event) => (
              <div key={event.id} className="flex items-center justify-between text-sm bg-slate-700/50 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  {event.type === 'correct' && <span className="text-green-400 text-lg">✓</span>}
                  {event.type === 'incorrect' && <span className="text-red-400 text-lg">✗</span>}
                  {event.type === 'yellow_card' && <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                  {event.type === 'red_card' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                  <span className="text-slate-300 font-medium">{event.playerName}</span>
                  <span className="text-slate-400 text-xs">
                    {event.timestamp.toLocaleTimeString('ar-SA', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-lg ${
                    event.scoreChange > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {event.scoreChange > 0 ? '+' : ''}{event.scoreChange}
                  </span>
                  <span className="text-slate-400">→</span>
                  <span className={`font-bold ${
                    event.newScore < 0 ? 'text-red-400' : 'text-white'
                  }`}>
                    {event.newScore}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Players Grid */}
      <div className={`grid gap-6 ${
        players.length === 2 
          ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' 
          : 'grid-cols-1 lg:grid-cols-3 max-w-6xl mx-auto'
      }`}>
        {players.map((player) => (
          <PlayerCard key={player.id} player={player} />
        ))}
      </div>

      {/* Game Rules */}
      <div className="mt-8 max-w-5xl mx-auto bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-yellow-400 mb-4 text-center">قواعد اللعبة المحدثة</h3>
        <div className="grid md:grid-cols-3 gap-6 text-slate-300 text-sm">
          <div>
            <h4 className="font-bold text-yellow-300 mb-2">النقاط الأساسية:</h4>
            <p className="mb-2">• إجابة صحيحة: +1 نقطة</p>
            <p className="mb-2">• إجابة خاطئة: -1 نقطة</p>
            <p className="mb-2">• بطاقة صفراء: -1 نقطة</p>
            <p className="mb-2">• بطاقة حمراء: -3 نقاط</p>
            <p>• النقاط يمكن أن تصبح سالبة</p>
          </div>
          <div>
            <h4 className="font-bold text-yellow-300 mb-2">الفوز العادي:</h4>
            <p className="mb-2">• الوصول لـ 10 نقاط</p>
            <p className="mb-2">• بشرط عدم وجود لاعب آخر عند 9+ نقاط</p>
            <p>• إذا وصل لاعبان لـ 9+ تبدأ الجولة الحاسمة</p>
          </div>
          <div>
            <h4 className="font-bold text-yellow-300 mb-2">الجولة الحاسمة:</h4>
            <p className="mb-2">• المرحلة الأولى: فوز بفارق نقطتين</p>
            <p className="mb-2">• المرحلة النهائية: بعد وصول الجميع لـ 12</p>
            <p>• في المرحلة النهائية: أول من يصل لـ 14 يفوز</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;