import React from 'react';

function PlayerSelection({ onStartGame, onBack }) {
  return (
    <div className="player-selection fade-in">
      <button 
        className="pixel-button secondary"
        onClick={onBack}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          fontSize: '10px',
          padding: '10px 15px'
        }}
      >
        ← BACK
      </button>
      <h2>SELECT NUMBER OF PLAYERS</h2>
      <p style={{ 
        fontSize: '12px', 
        color: '#ccc', 
        marginBottom: '40px',
        letterSpacing: '1px'
      }}>
        Choose between 3 to 5 players for the game
      </p>
      <div className="player-buttons">
        {[3, 4, 5].map(count => (
          <button
            key={count}
            className="pixel-button"
            onClick={() => onStartGame(count)}
            style={{
              fontSize: '14px',
              padding: '25px 35px',
              margin: '0 10px'
            }}
          >
            {count} PLAYERS
          </button>
        ))}
      </div>
      <div style={{
        marginTop: '40px',
        fontSize: '10px',
        color: '#888',
        textAlign: 'center'
      }}>
        <p>Each player gets a unique ticket with 15 numbers</p>
        <p>Numbers are arranged in 3 sections with specific ranges</p>
      </div>
    </div>
  );
}

export default PlayerSelection;
