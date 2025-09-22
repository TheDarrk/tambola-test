import React, { useState, useEffect, useRef } from 'react';

function GameScreen({ gameData, apiBase, onGameEnd, onReset }) {
  const [currentNumber, setCurrentNumber] = useState(null);
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [gameStatus, setGameStatus] = useState('waiting');
  const [playerTickets, setPlayerTickets] = useState(gameData.tickets || []);
  const [markedNumbers, setMarkedNumbers] = useState({});
  const [numbersPosition, setNumbersPosition] = useState(0);
  const [totalNumbers, setTotalNumbers] = useState(90); // Changed to 90 since game continues
  const [isAutoMode, setIsAutoMode] = useState(false);
  const intervalRef = useRef(null);
  
  const NUMBER_CALLS = {
    1: "Kelly's eye",
    2: "One little duck 🦆",
    3: "Cup of tea ☕",
    4: "Knock at the door 🚪",
    5: "Man alive",
    6: "Half a dozen",
    7: "Lucky seven 🍀",
    8: "Garden gate",
    9: "Doctor's time",
    10: "Perfect ten",
    11: "Legs eleven 🦵🦵",
    12: "One dozen",
    13: "Unlucky for some 😈",
    14: "Valentine's Day ❤️",
    15: "Young and keen",
    16: "Sweet sixteen 💕",
    17: "Dancing queen",
    18: "Voting age 🗳️",
    19: "Goodbye teens",
    20: "One score",
    21: "Key of the door",
    22: "Two little ducks 🦆🦆",
    23: "Thee and me",
    24: "Two dozen",
    25: "Quarter century",
    26: "Pick and mix 🍬",
    27: "Gateway to heaven",
    28: "Overweight 😅",
    29: "Rise and shine ☀️",
    30: "Dirty thirty",
    31: "Get up and run",
    32: "Buckle my shoe 👞",
    33: "All the threes",
    34: "Ask for more",
    35: "Jump and jive",
    36: "Three dozen",
    37: "More than eleven",
    38: "Christmas cake 🎂",
    39: "Steps",
    40: "Naughty forty 😏",
    41: "Time for fun",
    42: "Winnie the Pooh 🐻",
    43: "Down on your knees",
    44: "Droopy drawers",
    45: "Halfway there",
    46: "Up to tricks",
    47: "Four and seven",
    48: "Four dozen",
    49: "Rise and shine",
    50: "Half a century 🏏",
    51: "Tweak of the thumb",
    52: "Danny La Rue",
    53: "Stuck in the tree 🌳",
    54: "Clean the floor",
    55: "Snakes alive 🐍",
    56: "Was she worth it?",
    57: "Heinz varieties",
    58: "Make them wait",
    59: "Brighton line 🚂",
    60: "Five dozen",
    61: "Baker's bun",
    62: "Turn the screw 🔩",
    63: "Tickle me",
    64: "Red raw",
    65: "Old age pension",
    66: "Clickety click",
    67: "Heaven's gate",
    68: "Saving grace",
    69: "Any way up 😉",
    70: "Three score and ten",
    71: "Bang on the drum",
    72: "Six dozen",
    73: "Queen bee 🐝",
    74: "Candy store",
    75: "Strive and strive",
    76: "Trombones 🎺",
    77: "Sunset strip 🌇",
    78: "Heaven's gate",
    79: "One more time",
    80: "Gandhi's breakfast",
    81: "Fat lady with a walking stick",
    82: "Straight on through",
    83: "Time for tea ☕",
    84: "Seven dozen",
    85: "Staying alive 🎶",
    86: "Between the sticks",
    87: "Torquay in Devon",
    88: "Two fat ladies 👯",
    89: "Nearly there",
    90: "Top of the shop 🎩"
  };
  
  const [currentNumberCall, setCurrentNumberCall] = useState("");
  
  // New state for achievements system
  const [achievements, setAchievements] = useState({
    first_five: [],
    early_seven: [],
    full_house: []
  });
  const [playerPoints, setPlayerPoints] = useState(Array(gameData.player_count).fill(0));
  const [rankings, setRankings] = useState([]);
  const [recentAchievements, setRecentAchievements] = useState([]);

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
        
        // Set the call phrase
        setCurrentNumberCall(NUMBER_CALLS[data.number] || "");
        
        // Check achievements after each number is called
        setTimeout(checkAchievements, 500);
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

  const checkAchievements = async () => {
    try {
      // Convert markedNumbers Set to array for each player
      const playerMarked = {};
      Object.keys(markedNumbers).forEach(playerIdx => {
        playerMarked[parseInt(playerIdx)] = Array.from(markedNumbers[playerIdx]);
      });

      const response = await fetch(`${apiBase}/game/${gameData.game_id}/check-achievements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerMarked)
      });

      if (response.ok) {
        const data = await response.json();

        if (data.new_achievements && data.new_achievements.length > 0) {
          // Show achievement notifications
          const achievementNames = {
            first_five: "First Five 🏆",
            early_seven: "Early Seven 🎯",
            full_house: "Full House 🏠"
          };

          data.new_achievements.forEach(achievement => {
            const message = `Player ${achievement.player + 1} achieved ${achievementNames[achievement.type]}! (+${achievement.points} points)`;
            setRecentAchievements(prev => [...prev.slice(-2), message]);
            
            setTimeout(() => {
              setRecentAchievements(prev => prev.filter(msg => msg !== message));
            }, 5000);
          });
        }

        setAchievements(data.achievements || achievements);
        setPlayerPoints(data.player_points || playerPoints);
        setRankings(data.rankings || []);

        // Check if game ended due to Full House
        if (data.game_ended) {
          setGameStatus('finished');
          stopAutoNumberCalling();
          
          // Show final results after a short delay
          setTimeout(() => {
            onGameEnd({
              winner: data.winner,
              finalRankings: data.rankings,
              playerPoints: data.player_points,
              achievements: data.achievements,
              allCalledNumbers: calledNumbers,
              gameStatus: 'finished',
              reason: 'full_house'
            });
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  const toggleNumber = (playerIndex, number) => {
    setMarkedNumbers(prev => {
      const newMarked = { ...prev };
      const playerSet = new Set(newMarked[playerIndex]);
      if (playerSet.has(number)) playerSet.delete(number);
      else playerSet.add(number);
      newMarked[playerIndex] = playerSet;
      return newMarked;
    });

    // Check achievements after marking
    setTimeout(checkAchievements, 100);
  };

  const getAllNumbers = async () => {
    try {
      const response = await fetch(`${apiBase}/game/${gameData.game_id}/all-numbers`);
      const data = await response.json();
      onGameEnd({ 
        winner: null, 
        allCalledNumbers: data.called_numbers, 
        gameStatus: data.game_status,
        finalRankings: rankings,
        playerPoints: playerPoints,
        achievements: achievements,
        reason: 'manual'
      });
    } catch (error) {
      console.error('Error getting all numbers:', error);
    }
  };

  const getPlayerAchievements = (playerIndex) => {
    const playerAchievements = [];
    if (achievements.first_five.includes(playerIndex)) playerAchievements.push("🏆");
    if (achievements.early_seven.includes(playerIndex)) playerAchievements.push("🎯");
    if (achievements.full_house.includes(playerIndex)) playerAchievements.push("🏠");
    return playerAchievements;
  };

  const getValidMarkedCount = (playerIndex) => {
    const marked = markedNumbers[playerIndex] || new Set();
    const called = new Set(calledNumbers);
    const validMarked = [...marked].filter(num => called.has(num));
    return validMarked.length;
  };

  useEffect(() => { 
    return () => { 
      clearInterval(intervalRef.current); 
    }; 
  }, []);

  const renderTicketSection = (row, rowIndex, playerIndex) => {
    return (
      <div
        key={rowIndex}
        className="ticket-section"
        style={{ marginBottom: (rowIndex + 1) % 3 === 0 ? '20px' : '5px' }}
      >
        {row.map((number, colIndex) => {
          const isMarked = markedNumbers[playerIndex]?.has(number);
          const isCalled = calledNumbers.includes(number);
          const isValidMark = isMarked && isCalled;
          
          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`number-cell ${isMarked ? 'marked' : ''}`}
              onClick={() => number != null && toggleNumber(playerIndex, number)}
              style={{
                backgroundColor: isValidMark ? '#4ecdc4' : // Valid mark (green)
                              isMarked ? '#ff6b6b' : // Invalid mark (red)
                              isCalled ? 'rgba(255, 255, 0, 0.3)' : // Called but not marked (yellow)
                              'rgba(255, 255, 255, 0.1)', // Default
                border: number != null ? '1px solid #666' : '1px solid transparent',
                cursor: number != null ? 'pointer' : 'default'
              }}
            >
              {number != null ? number : ''}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="game-screen fade-in">
      {/* Achievement Notifications */}
      {recentAchievements.length > 0 && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          background: 'rgba(0, 255, 0, 0.9)',
          color: 'white',
          padding: '10px',
          borderRadius: '8px',
          maxWidth: '300px'
        }}>
          {recentAchievements.map((achievement, index) => (
            <div key={index} style={{ marginBottom: '5px', fontSize: '12px' }}>
              🎉 {achievement}
            </div>
          ))}
        </div>
      )}

      <div className="game-header">
        <div className="current-number">{currentNumber || '--'}</div>
        
        {/* NUMBER CALLS DISPLAY */}
        {currentNumber && currentNumberCall && (
          <div style={{
            fontSize: '18px',
            color: '#ffd700',
            fontStyle: 'italic',
            marginTop: '15px',
            textAlign: 'center',
            fontWeight: 'bold',
            background: 'rgba(255, 215, 0, 0.1)',
            padding: '10px',
            border: '2px solid #ffd700',
            borderRadius: '8px',
            boxShadow: '0 0 15px rgba(255, 215, 0, 0.3)'
          }}>
            🎯 "{currentNumberCall} – {currentNumber}" 🎯
          </div>
        )}
        
        <div className="game-status">
          {gameStatus === 'waiting' && 'Waiting to start...'}
          {gameStatus === 'active' && `Number ${numbersPosition} of ${totalNumbers}`}
          {gameStatus === 'finished' && 'Game Finished!'}
        </div>
        {gameStatus === 'active' && (
          <div style={{ fontSize: '10px', color: '#888', marginTop: '10px' }}>
            Called: {calledNumbers.slice(-10).join(', ')}
            {calledNumbers.length > 10 && '...'}
          </div>
        )}
      </div>

      <div className="game-controls">
        {gameStatus === 'waiting' && (
          <button className="pixel-button" onClick={startGame}>🎯 START GAME</button>
        )}
        {gameStatus === 'active' && (
          <>
            <button className="pixel-button" onClick={getNextNumber} disabled={isAutoMode}>
              📢 NEXT NUMBER
            </button>
            <button className={`pixel-button ${isAutoMode ? 'secondary' : ''}`} onClick={toggleAutoMode}>
              {isAutoMode ? '⏸️ STOP AUTO' : '▶️ AUTO MODE'}
            </button>
          </>
        )}
        {(gameStatus === 'finished' || gameStatus === 'active') && (
          <button className="pixel-button secondary" onClick={getAllNumbers}>
            📊 SHOW RESULTS
          </button>
        )}
        <button className="pixel-button" onClick={onReset}>🔄 NEW GAME</button>
      </div>

      {/* Current Rankings */}
      {rankings.length > 0 && (
        <div style={{
          background: 'rgba(255, 215, 0, 0.1)',
          padding: '10px',
          margin: '10px 0',
          border: '1px solid #ffd700',
          borderRadius: '5px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#ffd700' }}>🏆 Current Rankings:</h4>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {rankings.slice(0, 3).map((rank, index) => (
              <div key={index} style={{
                fontSize: '12px',
                color: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : '#cd7f32',
                textAlign: 'center'
              }}>
                <div>{index + 1}. Player {rank.player + 1}</div>
                <div>{rank.points} points</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="players-grid">
        {playerTickets.map((ticket, playerIndex) => (
          <div key={playerIndex} className="player-card">
            <div className="player-title">
              PLAYER {playerIndex + 1}
              <span style={{
                marginLeft: '10px',
                fontSize: '8px',
                color: playerPoints[playerIndex] > 0 ? '#4ecdc4' : '#888'
              }}>
                ({getValidMarkedCount(playerIndex)}/15 valid) - {playerPoints[playerIndex]} pts
              </span>
            </div>

            {/* Show achievements */}
            <div style={{
              fontSize: '12px',
              color: '#ffaa00',
              marginBottom: '5px',
              minHeight: '15px'
            }}>
              {getPlayerAchievements(playerIndex).join(' ')}
            </div>

            <div className="ticket">
              {ticket.map((section, sectionIndex) =>
                renderTicketSection(section, sectionIndex, playerIndex)
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        padding: 15,
        marginTop: 20,
        border: '1px solid #555',
        textAlign: 'center',
        fontSize: 10,
        color: '#ccc'
      }}>
        <p>💡 <strong>HOW TO PLAY:</strong></p>
        <p>1. Click numbers on your ticket to mark them</p>
        <p>2. Mark numbers as they are called</p>
        <p>3. Achievements: 🏆 First 5 (50pts), 🎯 Early 7 (100pts), 🏠 Full House (200pts)</p>
        <p>4. Green = valid mark, Red = your mark, Yellow = called number</p>
      </div>
    </div>
  );
}

export default GameScreen;
