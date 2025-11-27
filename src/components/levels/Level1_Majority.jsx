import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../../store/gameStore';
import { ref, set, onValue, update } from 'firebase/database';
import { db } from '../../firebase';
import { LEVEL1_CONFIG } from '../../config/gameConfig';

const { QUESTIONS, POINTS_PER_WIN, TITLE, RULES } = LEVEL1_CONFIG;

const Level1 = () => {
  const { user, isAdmin, gameState, players } = useGame();
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [status, setStatus] = useState('intro'); // 'intro' | 'voting' | 'revealed'
  const [myVote, setMyVote] = useState(null);
  const [votes, setVotes] = useState({});
  const [showScoreAnim, setShowScoreAnim] = useState(false);

  // Listen to Firebase data
  useEffect(() => {
    const qRef = ref(db, 'level1/currentQ');
    const votesRef = ref(db, 'level1/votes');
    const statusRef = ref(db, 'level1/status');

    const unsubQ = onValue(qRef, (snap) => {
      setCurrentQIndex(snap.val() || 0);
      setMyVote(null); 
      setShowScoreAnim(false);
    });

    const unsubVotes = onValue(votesRef, (snap) => {
      setVotes(snap.val() || {});
    });

    const unsubStatus = onValue(statusRef, (snap) => {
      const newStatus = snap.val() || 'intro';
      setStatus(newStatus);
      if (newStatus === 'revealed') {
        setShowScoreAnim(true);
      }
    });

    return () => {
      unsubQ();
      unsubVotes();
      unsubStatus();
    };
  }, []);

  const handleStartLevel = async () => {
    await set(ref(db, 'level1/status'), 'voting');
  };

  const handleVote = async (optionIndex) => {
    if (status === 'revealed' || status === 'intro') return; 
    setMyVote(optionIndex);
    await set(ref(db, `level1/votes/${user.id}`), optionIndex);
  };

  // ... (keep existing stats calculation) ...
  const voteCounts = {};
  Object.values(votes).forEach(v => {
    voteCounts[v] = (voteCounts[v] || 0) + 1;
  });
  
  let maxVotes = 0;
  const winningOptions = [];
  Object.entries(voteCounts).forEach(([opt, count]) => {
    if (count > maxVotes) maxVotes = count;
  });
  Object.entries(voteCounts).forEach(([opt, count]) => {
    if (count === maxVotes) winningOptions.push(parseInt(opt));
  });

  const isWinner = myVote !== null && winningOptions.includes(myVote);

  // ... (keep existing handleReveal and handleNextQuestion) ...
  const handleReveal = async () => {
    if (maxVotes > 0) {
      const updates = {};
      Object.entries(votes).forEach(([playerId, voteIndex]) => {
        if (winningOptions.includes(voteIndex)) {
          const currentPlayer = players[playerId];
          const currentScore = currentPlayer?.score || 0;
          updates[`players/${playerId}/score`] = currentScore + POINTS_PER_WIN;
        }
      });
      updates['level1/status'] = 'revealed';
      await update(ref(db), updates);
    } else {
      await set(ref(db, 'level1/status'), 'revealed');
    }
  };

  // Admin: Next Question or Finish Level
  const handleNextQuestion = async () => {
    if (currentQIndex < QUESTIONS.length - 1) {
      await update(ref(db), {
        'level1/currentQ': currentQIndex + 1,
        'level1/votes': null,
        'level1/status': 'voting'
      });
    } else {
      // End of Level 1 -> Show Summary
      await set(ref(db, 'level1/status'), 'level_complete');
    }
  };

  const handleStartLevel2 = async () => {
    await update(ref(db), { gameState: 'level2' });
  };

  const currentQ = QUESTIONS[currentQIndex];

  // Render Intro Screen
  if (status === 'intro') {
    return (
      <div className="w-full max-w-md mx-auto space-y-8 text-center animate-fade-in">
        <div className="glass-card p-10 flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-christmas-accent/10 rounded-full flex items-center justify-center border border-christmas-accent/30">
            <span className="text-4xl">☝️</span>
          </div>
          
          <div>
            <h2 className="text-3xl font-serif text-christmas-accent mb-2">{TITLE}</h2>
            <div className="w-12 h-1 bg-christmas-accent/20 mx-auto mb-4" />
            <p className="text-christmas-text/80 leading-relaxed font-serif">
              {RULES}
            </p>
            <div className="inline-block bg-christmas-accent/10 px-4 py-1 rounded-full text-christmas-accent text-sm font-bold mt-2">
              Reward: +{POINTS_PER_WIN} pts / win
            </div>
          </div>

          {isAdmin ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartLevel}
              className="mt-4 px-8 py-3 bg-christmas-accent text-white font-serif rounded-full shadow-lg hover:bg-christmas-accent/90"
            >
              Start Level 1
            </motion.button>
          ) : (
            <p className="text-sm text-christmas-text/40 animate-pulse mt-4">
              Waiting for host to start...
            </p>
          )}
        </div>
      </div>
    );
  }

  // Render Level Complete Screen
  if (status === 'level_complete') {
    const sortedPlayers = Object.values(players).sort((a, b) => b.score - a.score);
    
    return (
      <div className="w-full max-w-md mx-auto space-y-8 text-center animate-fade-in">
        <div className="glass-card p-8">
          <h2 className="text-2xl font-serif text-christmas-accent mb-6">Level 1 Complete!</h2>
          
          <div className="space-y-3 mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-christmas-text/50">Current Standings</h3>
            {sortedPlayers.slice(0, 3).map((p, idx) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-white/40 rounded-xl border border-white/50">
                <div className="flex items-center gap-3">
                  <span className={`
                    w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                    ${idx === 0 ? 'bg-yellow-400 text-white' : 
                      idx === 1 ? 'bg-gray-300 text-white' : 
                      idx === 2 ? 'bg-amber-600 text-white' : 'bg-transparent text-christmas-text/50'}
                  `}>
                    {idx + 1}
                  </span>
                  <span className="font-serif">{p.name}</span>
                </div>
                <span className="font-bold text-christmas-accent">{p.score} pts</span>
              </div>
            ))}
          </div>

          {isAdmin ? (
            <button 
              onClick={handleStartLevel2}
              className="w-full bg-christmas-accent text-white font-serif py-3 rounded-xl shadow-lg hover:bg-christmas-accent/90"
            >
              Go to Level 2 →
            </button>
          ) : (
            <p className="text-sm text-christmas-text/40 animate-pulse">
              Waiting for next level...
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6 relative">
      {/* Score Animation Popup */}
      {status === 'revealed' && isWinner && showScoreAnim && (
        <motion.div 
          initial={{ scale: 0.5, y: 0, opacity: 0 }}
          animate={{ 
            scale: [0.5, 1.2, 1],
            y: [0, -50, -100],
            opacity: [0, 1, 0]
          }}
          transition={{ 
            duration: 2,
            times: [0, 0.2, 1],
            ease: "easeOut"
          }}
          onAnimationComplete={() => setShowScoreAnim(false)}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
        >
          <div className="text-6xl font-bold text-yellow-400 drop-shadow-lg flex items-center gap-2 filter drop-shadow-md">
            <span>+{POINTS_PER_WIN}</span>
            <span className="text-4xl">pts!</span>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="text-center">
        <h2 className="text-christmas-accent font-serif text-xl">Level 1: Majority Rules</h2>
        <div className="flex items-center justify-center gap-3 text-xs uppercase tracking-widest text-christmas-text/60 mt-1">
          <span>Question {currentQIndex + 1} / {QUESTIONS.length}</span>
          <span className="w-1 h-1 rounded-full bg-christmas-text/30" />
          <span className="text-christmas-accent font-bold">Win: +{POINTS_PER_WIN} pts</span>
        </div>
      </div>

      {/* Question Card */}
      <motion.div 
        key={currentQIndex}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 text-center min-h-[200px] flex items-center justify-center"
      >
        <h3 className="text-2xl font-serif text-christmas-text leading-relaxed">
          {currentQ.q}
        </h3>
      </motion.div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-3">
        {currentQ.options.map((opt, idx) => {
          const count = voteCounts[idx] || 0;
          const isWinningOption = status === 'revealed' && winningOptions.includes(idx);
          
          return (
            <motion.button
              key={idx}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleVote(idx)}
              disabled={status === 'revealed'}
              className={`
                p-4 rounded-xl text-lg font-serif transition-all border relative overflow-hidden
                ${myVote === idx 
                  ? 'bg-christmas-accent text-white border-christmas-accent shadow-lg' 
                  : 'bg-white/40 border-white/40 text-christmas-text hover:bg-white/60'}
                ${status === 'revealed' && !isWinningOption ? 'opacity-50' : ''}
                ${isWinningOption ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}
              `}
            >
              {/* Progress Bar Background for Results */}
              {status === 'revealed' && (
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / Object.keys(votes).length) * 100}%` }}
                  className={`absolute left-0 top-0 bottom-0 opacity-20 ${isWinningOption ? 'bg-yellow-400' : 'bg-gray-400'}`}
                />
              )}
              
              <div className="relative flex justify-between items-center w-full px-2">
                <span>{opt}</span>
                {status === 'revealed' && (
                  <span className="font-bold text-sm">{count} votes</span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Admin Controls */}
      {isAdmin && (
        <div className="pt-8 border-t border-christmas-text/10 flex flex-col items-center gap-2">
          <p className="text-xs font-serif text-christmas-text/60">
            Votes: {Object.keys(votes).length} / {Object.keys(players).length}
          </p>
          
          {status === 'voting' ? (
            <button 
              onClick={handleReveal}
              className="w-full bg-christmas-text text-white font-serif py-3 rounded-xl shadow-lg hover:bg-christmas-text/90"
            >
              Reveal Results
            </button>
          ) : (
            <button 
              onClick={handleNextQuestion}
              className="w-full bg-christmas-accent text-white font-serif py-3 rounded-xl shadow-lg hover:bg-christmas-accent/90"
            >
              {currentQIndex < QUESTIONS.length - 1 ? 'Next Question →' : 'Finish Level 1 →'}
            </button>
          )}
        </div>
      )}
      
      {/* Waiting Indicator */}
      {status === 'voting' && myVote !== null && (
        <p className="text-center text-christmas-text/50 text-sm animate-pulse">
          Waiting for others...
        </p>
      )}
    </div>
  );
};

export default Level1;
