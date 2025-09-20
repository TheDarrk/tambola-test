import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import PlayerSelection from './components/PlayerSelection';
import GameScreen from './components/GameScreen';
import WinnerScreen from './components/WinnerScreen';

const API_BASE = process.env.NODE_ENV === 'production' 
  ? '/api'
  : 'http://localhost:8000/api';

function App() {
  const [gameState, setGameState] = useState('landing');
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const startNewGame = async (playerCount) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/start-game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_count: playerCount }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setGameData(data);
      setGameState('game');
    } catch (err) {
      console.error('Error starting game:', err);
      setError('Failed to start game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetGame = () => {
    setGameData(null);
    setGameState('landing');
    setError('');
  };

  const goToPlayerSelection = () => {
    setGameState('playerSelection');
  };

  const goToWinner = (winnerData) => {
    setGameData(prev => ({ ...prev, ...winnerData }));
    setGameState('winner');
  };

  if (loading) {
    return (
      <div className="pixel-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Starting Game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pixel-container">
      {error && (
        <div style={{
          background: '#ff6b6b',
          color: '#fff',
          padding: '15px',
          textAlign: 'center',
          marginBottom: '20px',
          border: '2px solid #fff'
        }}>
          {error}
          <button 
            onClick={() => setError('')}
            style={{
              background: 'transparent',
              border: '1px solid #fff',
              color: '#fff',
              marginLeft: '10px',
              padding: '5px 10px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {gameState === 'landing' && (
        <LandingPage onLaunchGame={goToPlayerSelection} />
      )}
      {gameState === 'playerSelection' && (
        <PlayerSelection 
          onStartGame={startNewGame}
          onBack={resetGame}
        />
      )}
      {gameState === 'game' && gameData && (
        <GameScreen 
          gameData={gameData}
          apiBase={API_BASE}
          onGameEnd={goToWinner}
          onReset={resetGame}
        />
      )}
      {gameState === 'winner' && gameData && (
        <WinnerScreen 
          gameData={gameData}
          onPlayAgain={resetGame}
        />
      )}
    </div>
  );
}

export default App;
