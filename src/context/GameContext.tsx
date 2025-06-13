import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Player {
  id: number;
  name: string;
  score: number;
  isInSuddenDeath: boolean;
  consecutiveCorrect: number;
  tieRounds: number;
}

export interface GameEvent {
  id: string;
  timestamp: Date;
  type: 'correct' | 'incorrect' | 'yellow_card' | 'red_card';
  playerId: number;
  playerName: string;
  scoreChange: number;
  newScore: number;
}

interface GameContextType {
  players: Player[];
  gameMode: '2' | '3';
  winner: Player | null;
  isGameActive: boolean;
  gameEvents: GameEvent[];
  setPlayers: (players: Player[]) => void;
  setGameMode: (mode: '2' | '3') => void;
  updatePlayerScore: (playerId: number, increment: boolean) => void;
  applyPenaltyCard: (playerId: number, cardType: 'yellow' | 'red') => void;
  resetGame: () => void;
  startNewGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [players, setPlayersState] = useState<Player[]>([]);
  const [gameMode, setGameMode] = useState<'2' | '3'>('2');
  const [winner, setWinner] = useState<Player | null>(null);
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameEvents, setGameEvents] = useState<GameEvent[]>([]);

  const addGameEvent = (type: GameEvent['type'], playerId: number, scoreChange: number, newScore: number) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    const event: GameEvent = {
      id: `${Date.now()}-${playerId}`,
      timestamp: new Date(),
      type,
      playerId,
      playerName: player.name,
      scoreChange,
      newScore
    };

    setGameEvents(prev => [event, ...prev].slice(0, 50)); // Keep last 50 events
  };

  const setPlayers = (newPlayers: Player[]) => {
    setPlayersState(newPlayers);
    setIsGameActive(true);
    setGameEvents([]);
  };

  const applyPenaltyCard = (playerId: number, cardType: 'yellow' | 'red') => {
    if (winner) return;

    const penalty = cardType === 'yellow' ? -1 : -3;

    setPlayersState(prevPlayers => {
      const updatedPlayers = prevPlayers.map(player => {
        if (player.id === playerId) {
          const newScore = player.score + penalty; // Allow negative scores
          
          // Add event after state update
          setTimeout(() => {
            addGameEvent(cardType === 'yellow' ? 'yellow_card' : 'red_card', playerId, penalty, newScore);
          }, 0);

          return {
            ...player,
            score: newScore,
            consecutiveCorrect: 0, // Reset consecutive correct on penalty
            isInSuddenDeath: newScore >= 9 ? player.isInSuddenDeath : false, // Only remove from sudden death if score drops below 9
            tieRounds: newScore >= 9 ? player.tieRounds : 0
          };
        }
        return player;
      });

      // Recalculate sudden death status after penalty
      const playersAt9Plus = updatedPlayers.filter(p => p.score >= 9);
      const shouldActivateSuddenDeath = playersAt9Plus.length >= 2;

      return updatedPlayers.map(player => ({
        ...player,
        isInSuddenDeath: shouldActivateSuddenDeath && player.score >= 9
      }));
    });
  };

// Replace the entire updatePlayerScore function in your GameContext.tsx

const updatePlayerScore = (playerId: number, increment: boolean) => {
    if (winner) return;

    setPlayersState(prevPlayers => {
      // --- Stage 1: Calculate the next state of players based on the answer ---
      const updatedPlayers = prevPlayers.map(player => {
        if (player.id === playerId) {
          // We don't need consecutiveCorrect for the win logic anymore,
          // but we can leave the property on the Player object if you use it for display.
          const newScore = player.score + (increment ? 1 : -1);

          // Add game event
          setTimeout(() => {
            addGameEvent(increment ? 'correct' : 'incorrect', playerId, increment ? 1 : -1, newScore);
          }, 0);

          return { ...player, score: newScore };
        }
        return player;
      });

      // --- Stage 2: Determine if Sudden Death should be active ---
      const playersAt9Plus = updatedPlayers.filter(p => p.score >= 9);
      const shouldActivateSuddenDeath = playersAt9Plus.length >= 2;

      // --- Stage 3: Finalize player properties (isInSuddenDeath) ---
      const finalPlayers = updatedPlayers.map(player => ({
        ...player,
        isInSuddenDeath: shouldActivateSuddenDeath && player.score >= 9,
      }));

      // --- Stage 4: Check for a winner based on the new state ---
      let potentialWinner: Player | null = null;

      if (shouldActivateSuddenDeath) {
        // --- SUDDEN DEATH LOGIC ---
        const sdPlayers = finalPlayers.filter(p => p.isInSuddenDeath);

        // This check is important. We only apply SD rules if there are actually 2+ players in it.
        if (sdPlayers.length >= 2) {
          const sdScores = sdPlayers.map(p => p.score).sort((a, b) => b - a); // Sort scores: [11, 9]
          const maxScore = sdScores[0];
          const minScore = sdScores[sdScores.length - 1];

          // Check for "Phase 2: Race to 14" first. This is the ultimate tie-breaker.
          if (minScore >= 12) {
            // In this phase, the first to 14 wins, even if the other is at 13.
            if (maxScore >= 14) {
              potentialWinner = finalPlayers.find(p => p.score === maxScore) || null;
            }
          } else {
            // Otherwise, we are in "Phase 1: Win by 2 points".
            const secondHighestScore = sdScores[1];
            if (maxScore - secondHighestScore >= 2) {
              potentialWinner = finalPlayers.find(p => p.score === maxScore) || null;
            }
          }
        }
      }

      // If no Sudden Death winner was found, check for a normal win.
      // This is important for when a player drops out of SD, leaving only one player above 9.
      if (!potentialWinner) {
        const winnerCandidate = finalPlayers.find(p => p.score >= 10);
        // We re-check the SD condition here to prevent a win if someone else just hit 9.
        const someoneElseAt9OrMore = finalPlayers.some(p => p.id !== winnerCandidate?.id && p.score >= 9);
        
        if (winnerCandidate && !someoneElseAt9OrMore) {
          potentialWinner = winnerCandidate;
        }
      }

      if (potentialWinner) {
        setWinner(potentialWinner);
        setIsGameActive(false);
      }

      return finalPlayers; // Return the final, updated state
    });
  };

  const resetGame = () => {
    setPlayersState([]);
    setWinner(null);
    setIsGameActive(false);
    setGameEvents([]);
  };

  const startNewGame = () => {
    setPlayersState(prev => prev.map(player => ({
      ...player,
      score: 0,
      isInSuddenDeath: false,
      consecutiveCorrect: 0,
      tieRounds: 0
    })));
    setWinner(null);
    setIsGameActive(true);
    setGameEvents([]);
  };

  return (
    <GameContext.Provider value={{
      players,
      gameMode,
      winner,
      isGameActive,
      gameEvents,
      setPlayers,
      setGameMode,
      updatePlayerScore,
      applyPenaltyCard,
      resetGame,
      startNewGame
    }}>
      {children}
    </GameContext.Provider>
  );
};