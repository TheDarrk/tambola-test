import React from 'react';

function LandingPage({ onLaunchGame }) {
  return (
    <div className="landing-page">
      <div className="fade-in">
        <h1 className="game-title">ALOHA X</h1>
        <p className="game-subtitle">PIXELATED TOMBOLA GAMING EXPERIENCE</p>
        <div style={{ marginTop: '60px' }}>
          <button 
            className="pixel-button"
            onClick={onLaunchGame}
            style={{ fontSize: '16px', padding: '20px 40px', animation: 'pulse 2s infinite' }}
          >
            🎮 LAUNCH GAME
          </button>
        </div>
        <div style={{
          marginTop: '40px',
          fontSize: '10px',
          color: '#888',
          letterSpacing: '1px'
        }}>
          <p>🎯 UP TO 5 PLAYERS</p>
          <p>🎲 RANDOM NUMBER GENERATION</p>
          <p>🏆 CLASSIC TOMBOLA RULES</p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
