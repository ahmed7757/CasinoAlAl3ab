import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import SetupPage from './pages/SetupPage';
import GamePage from './pages/GamePage';
import WinnerPage from './pages/WinnerPage';
import './App.css';

function App() {
  return (
    <GameProvider>
      <Router>
        <div className="min-h-screen bg-game-bg">
          <Routes>
            <Route path="/" element={<SetupPage />} />
            <Route path="/game" element={<GamePage />} />
            <Route path="/winner" element={<WinnerPage />} />
          </Routes>
        </div>
      </Router>
    </GameProvider>
  );
}

export default App;