import React, { useState, useEffect, useRef } from 'react';

function GameScreen({ gameData, apiBase, onGameEnd, onReset }) {
  const [currentNumber, setCurrentNumber] = useState(null);
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [gameStatus, setGameStatus] = useState('waiting');
  const [playerTickets, setPlayerTickets] = useState(gameData.tickets || []);
  const [markedNumbers, setMarkedNumbers] = useState({});
  const [numbersPosition, setNumbersPosition] = useState(0);
  const [totalNumbers, setTotalNumbers] = useState(15);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const initialMarked = {};
    for (let i = 0; i < gameData.player_count; i++) {
      initialMarked[i] = new Set();
    }
    setMarkedNumbers(initialMarked);
  }, [gameData.player_count]);

  const startGame = async () => {
    try {
      const response = await fetch(`${apiBase}/game/${gameData.game_id}/start`, { method: 'POST' });
      if (response.ok) {
        setGameStatus('active');
        if (isAutoMode) startAutoNumberCalling();
      }
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const getNextNumber = async () => {
    try {
      const response = await fetch(`${apiBase}/game/${gameData.game_id}/next-number`);
      const data = await response.json();
      if (data.number) {
        setCurrentNumber(data.number);
        setCalledNumbers(prev => [...prev, data.number]);
        setNumbersPosition(data.position);
        setTotalNumbers(data.total);
      }
      if (data.is_finished) {
        setGameStatus('finished');
        clearInterval(intervalRef.current);
      }
    } catch (error) {
      console.error('Error getting next number:', error);
    }
  };

  const startAutoNumberCalling = () => {
    intervalRef.current = setInterval(getNextNumber, 3000);
  };

  const stopAutoNumberCalling = () => {
    clearInterval(intervalRef.current);
    setIsAutoMode(false);
  };

  const toggleAutoMode = () => {
    if (isAutoMode) stopAutoNumberCalling();
    else {
      setIsAutoMode(true);
      if (gameStatus === 'active') startAutoNumberCalling();
    }
  };

  const toggleNumber = (playerIndex, number) => {
    setMarkedNumbers(prev => {
      const newMarked = { ...prev };
      const playerSet = new Set(newMarked[playerIndex]);
      if (playerSet.has(number)) playerSet.delete(number);
      else playerSet.add(number);
      newMarked[playerIndex] = playerSet;
      checkWinner(newMarked[playerIndex], playerIndex);
      return newMarked;
    });
  };

  const checkWinner = (playerMarkedNumbers, playerIndex) => {
    const calledSet = new Set(calledNumbers);
    const markedSet = new Set(playerMarkedNumbers);
    const hasAllCalledNumbers = [...calledSet].every(num => markedSet.has(num));
    if (hasAllCalledNumbers && calledNumbers.length === totalNumbers && gameStatus === 'finished') {
      setTimeout(() => onGameEnd({ winner: playerIndex, winnerNumbers: [...markedSet], allCalledNumbers: calledNumbers }), 1000);
    }
  };

  const getAllNumbers = async () => {
    try {
      const response = await fetch(`${apiBase}/game/${gameData.game_id}/all-numbers`);
      const data = await response.json();
      onGameEnd({ winner: null, allCalledNumbers: data.called_numbers, gameStatus: data.game_status });
    } catch (error) {
      console.error('Error getting all numbers:', error);
    }
  };

  useEffect(() => { return () => { clearInterval(intervalRef.current); }; }, []);

  const renderTicketSection = (section, sectionIndex, playerIndex) => {
    // section is a flat array of 15 numbers, split into 3 columns of 5
    const columns = [section.slice(0, 5), section.slice(5, 10), section.slice(10, 15)];
    return (
      <div key={sectionIndex} className="ticket-section">
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="ticket-column">
            {column.map((number, numberIndex) => {
              const isMarked = markedNumbers[playerIndex]?.has(number);
              const isCalled = calledNumbers.includes(number);
              const isCorrect = isMarked && isCalled;
              return (
                <div
                  key={`${sectionIndex}-${columnIndex}-${numberIndex}`}
                  className={`number-cell ${isMarked ? 'marked' : ''} ${isCorrect ? 'correct' : ''}`}
                  onClick={() => toggleNumber(playerIndex, number)}
                  style={{
                    backgroundColor: isCorrect ? '#4ecdc4' :
                      isMarked ? '#ff6b6b' :
                      isCalled ? 'rgba(76, 175, 80, 0.3)' :
                      'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {number}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="game-screen fade-in">
      <div className="game-header">
        <div className="current-number">{currentNumber || '--'}</div>
        <div className="game-status">
          {gameStatus === 'waiting' && 'Waiting to start...'}
          {gameStatus === 'active' && `Number ${numbersPosition} of ${totalNumbers}`}
          {gameStatus === 'finished' && 'Game Finished!'}
        </div>
        {gameStatus === 'active' && (<div style={{ fontSize: '10px', color: '#888', marginTop: '10px' }}>Called: {calledNumbers.join(', ')}</div>)}
      </div>

      <div className="game-controls">
        {gameStatus === 'waiting' && (<button className="pixel-button" onClick={startGame}>🎯 START GAME</button>)}
        {gameStatus === 'active' && (
          <>
            <button className="pixel-button" onClick={getNextNumber} disabled={isAutoMode}>📢 NEXT NUMBER</button>
            <button className={`pixel-button ${isAutoMode ? 'secondary' : ''}`} onClick={toggleAutoMode}>{isAutoMode ? '⏸️ STOP AUTO' : '▶️ AUTO MODE'}</button>
          </>
        )}
        {gameStatus === 'finished' && (<button className="pixel-button secondary" onClick={getAllNumbers}>📊 SHOW RESULTS</button>)}
        <button className="pixel-button" onClick={onReset}>🔄 NEW GAME</button>
      </div>

      <div className="players-grid">
        {playerTickets.map((ticket, playerIndex) => (
          <div key={playerIndex} className="player-card">
            <div className="player-title">
              PLAYER {playerIndex + 1}
              <span style={{ marginLeft: '10px', fontSize: '8px', color: markedNumbers[playerIndex]?.size > 0 ? '#4ecdc4' : '#888' }}>
                ({markedNumbers[playerIndex]?.size || 0}/15 marked)
              </span>
            </div>
            <div className="ticket">
              {ticket.map((section, sectionIndex) => renderTicketSection(section, sectionIndex, playerIndex))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: 15, marginTop:20, border:'1px solid #555', textAlign:'center', fontSize:10, color:'#ccc' }}>
        <p>💡 <strong>HOW TO PLAY:</strong></p>
        <p>1. Click numbers on your ticket to mark them</p>
        <p>2. Mark numbers as they are called</p>
        <p>3. First player to mark all called numbers wins!</p>
        <p>4. Green = correct, Red = your mark, Light green = called</p>
      </div>
    </div>
  );
}

export default GameScreen;
