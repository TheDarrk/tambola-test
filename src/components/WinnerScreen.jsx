import React from 'react';

function WinnerScreen({ gameData, onPlayAgain }) {
  const { winner, allCalledNumbers, winnerNumbers } = gameData;

  return (
    <div className="fade-in">
      <div className="winner-screen">
        {winner !== null ? (
          <>
            <div className="winner-title">🏆 PLAYER {winner + 1} WINS! 🏆</div>
            <p style={{ fontSize: '14px', color: '#4CAF50', marginBottom: '20px', letterSpacing: '2px' }}>
              CONGRATULATIONS! PERFECT MATCH!
            </p>
          </>
        ) : (
          <>
            <div className="winner-title" style={{ color: '#ff6b6b' }}>🏠 HOUSE WINS! 🏠</div>
            <p style={{ fontSize: '14px', color: '#ff6b6b', marginBottom: '20px', letterSpacing: '2px' }}>
              NO PLAYER MATCHED ALL NUMBERS
            </p>
          </>
        )}
        <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '20px', margin: '20px 0', border: '1px solid #555', textAlign: 'left' }}>
          <h3 style={{ color: '#4ecdc4', marginBottom: '15px', textAlign: 'center' }}>📊 GAME STATISTICS</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', fontSize: '12px' }}>
            <div><strong style={{ color: '#4ecdc4' }}>Players:</strong><br />{gameData.player_count} participants</div>
            <div><strong style={{ color: '#4ecdc4' }}>Numbers Called:</strong><br />{(allCalledNumbers?.length) || 15} total</div>
            <div><strong style={{ color: '#4ecdc4' }}>Game Mode:</strong><br />Classic Tombola</div>
            <div><strong style={{ color: '#4ecdc4' }}>Winner Type:</strong><br />{winner !== null ? 'Full House' : 'No Winner'}</div>
          </div>
        </div>
        <div className="called-numbers">
          <h3>🎲 ALL CALLED NUMBERS</h3>
          <div className="numbers-grid">
            {allCalledNumbers?.map((number, index) => (
              <div key={index} className="called-number" style={{ backgroundColor: winnerNumbers?.includes(number) ? 'rgba(76, 175, 80, 0.5)' : 'rgba(255, 107, 107, 0.3)', borderColor: winnerNumbers?.includes(number) ? '#4CAF50' : '#ff6b6b' }}>
                {number}
              </div>
            ))}
          </div>
          {winner !== null && (<p style={{ fontSize: '10px', color: '#4CAF50', marginTop: '15px', textAlign: 'center' }}>✅ Green numbers were correctly marked by the winner</p>)}
        </div>
        <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '15px', margin: '20px 0', border: '1px solid #555', fontSize: '10px' }}>
          <h4 style={{ color: '#4ecdc4', marginBottom: '10px' }}>📋 NUMBERS BY RANGE</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
            {[{ range: '1-30', section: 'Top Section' }, { range: '31-60', section: 'Middle Section' }, { range: '61-90', section: 'Bottom Section' }].map((item, index) => {
              const sectionNumbers = allCalledNumbers?.filter(num => {
                const ranges = [[1,30], [31,60], [61,90]];
                return num >= ranges[index][0] && num <= ranges[index][1];
              }) || [];
              return <div key={index}><strong style={{ color: '#4ecdc4' }}>{item.section}</strong><br /><span style={{ color: '#ccc' }}>{item.range}</span><br /><span style={{ color: '#fff' }}>{sectionNumbers.length} numbers called</span></div>;
            })}
          </div>
        </div>
        <div style={{ marginTop: '30px' }}>
          <button className="pixel-button" onClick={onPlayAgain} style={{ fontSize: '14px', padding: '20px 30px', marginRight: '15px' }}>🎮 PLAY AGAIN</button>
          <button className="pixel-button secondary" onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'Aloha X Tombola Game',
                text: winner !== null ? `Player ${winner + 1} won the Tombola game!` : 'Just played an exciting Tombola game!',
              });
            } else {
              const text = winner !== null ? `Player ${winner + 1} won the Tombola game! 🏆` : 'Just played an exciting Tombola game! 🎲';
              navigator.clipboard.writeText(text);
              alert('Game result copied to clipboard!');
            }
          }} style={{ fontSize: '12px', padding: '15px 25px' }}>📤 SHARE RESULT</button>
        </div>
        <div style={{ marginTop: '30px', fontSize: '10px', color: '#888', textAlign: 'center', borderTop: '1px solid #333', paddingTop: '20px' }}>
          <p>🎯 <strong>Did you know?</strong></p>
          <p>Tombola is also known as Housie or Bingo in different regions!</p>
          <p>The odds of winning depend on the number of players and calling strategy.</p>
          <p style={{ marginTop: '10px', color: '#4ecdc4' }}>Thanks for playing <strong>ALOHA X TOMBOLA</strong>! 🌺</p>
        </div>
      </div>
    </div>
  );
}

export default WinnerScreen;
