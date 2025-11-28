import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../../store/gameStore';
import { ref, set, onValue, update } from 'firebase/database';
import { db } from '../../firebase';
import { LEVEL2_CONFIG } from '../../config/gameConfig';

const { TITLE, RULES, POINTS_PER_WIN } = LEVEL2_CONFIG;

const Level2 = () => {
  const { user, isAdmin, players } = useGame();
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [status, setStatus] = useState('intro'); // 'intro' | 'voting' | 'votes_revealed' | 'truth_revealed' | 'level_complete'
  const [myVote, setMyVote] = useState(null); 
  const [votes, setVotes] = useState({});
  const [showScoreAnim, setShowScoreAnim] = useState(false);

  // Initialize Questions (Admin Only) - Round Robin Logic
  useEffect(() => {
    if (isAdmin && status === 'intro' && questions.length === 0) {
      const playerList = Object.values(players);
      const round1 = [];
      const round2 = [];

      // Round 1: First Secret
      playerList.forEach(p => {
        if (p.secrets && p.secrets[0]) {
          round1.push({ q: p.secrets[0], ownerId: p.id, ownerName: p.name });
        }
      });
      // Shuffle Round 1
      for (let i = round1.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [round1[i], round1[j]] = [round1[j], round1[i]];
      }

      // Round 2: Second Secret
      playerList.forEach(p => {
        if (p.secrets && p.secrets[1]) {
          round2.push({ q: p.secrets[1], ownerId: p.id, ownerName: p.name });
        }
      });
      // Shuffle Round 2
      for (let i = round2.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [round2[i], round2[j]] = [round2[j], round2[i]];
      }

      const finalQuestions = [...round1, ...round2];
      set(ref(db, 'level2/questions'), finalQuestions);
    }
  }, [isAdmin, status, players]);

  // Listen to Firebase data
  useEffect(() => {
    const qRef = ref(db, 'level2/currentQ');
    const questionsRef = ref(db, 'level2/questions');
    const votesRef = ref(db, 'level2/votes');
    const statusRef = ref(db, 'level2/status');

    const unsubQ = onValue(qRef, (snap) => {
      setCurrentQIndex(snap.val() || 0);
      setMyVote(null); 
      setShowScoreAnim(false);
    });

    const unsubQuestions = onValue(questionsRef, (snap) => {
      setQuestions(snap.val() || []);
    });

    const unsubVotes = onValue(votesRef, (snap) => {
      setVotes(snap.val() || {});
    });

    const unsubStatus = onValue(statusRef, (snap) => {
      const newStatus = snap.val() || 'intro';
      setStatus(newStatus);
      if (newStatus === 'truth_revealed') {
        setShowScoreAnim(true);
      }
    });

    return () => {
      unsubQ();
      unsubQuestions();
      unsubVotes();
      unsubStatus();
    };
  }, []);

  const handleStartLevel = async () => {
    await set(ref(db, 'level2/status'), 'voting');
  };

  const handleVote = async (playerId) => {
    if (status !== 'voting') return;
    setMyVote(playerId);
    await set(ref(db, `level2/votes/${user.id}`), playerId);
  };

  // Step 1: Show Votes (Discussion Phase)
  const handleShowVotes = async () => {
    await set(ref(db, 'level2/status'), 'votes_revealed');
  };

  // Step 2: Reveal Truth (Scoring Phase)
  const handleRevealTruth = async () => {
    const currentQ = questions[currentQIndex];
    if (!currentQ) return;

    const updates = {};
    Object.entries(votes).forEach(([voterId, votedForId]) => {
      // Rule: Owner gets 0 points even if they voted correctly (Self-voting restriction)
      if (voterId === currentQ.ownerId) return;

      if (votedForId === currentQ.ownerId) {
        const currentPlayer = players[voterId];
        const currentScore = currentPlayer?.score || 0;
        updates[`players/${voterId}/score`] = currentScore + POINTS_PER_WIN;
      }
    });
    updates['level2/status'] = 'truth_revealed';
    
    if (Object.keys(updates).length > 0) {
      await update(ref(db), updates);
    } else {
      await set(ref(db, 'level2/status'), 'truth_revealed');
    }
  };

  const handleNextQuestion = async () => {
    if (currentQIndex < questions.length - 1) {
      await update(ref(db), {
        'level2/currentQ': currentQIndex + 1,
        'level2/votes': null,
        'level2/status': 'voting'
      });
    } else {
      await set(ref(db, 'level2/status'), 'level_complete');
    }
  };

  const handleStartLevel3 = async () => {
    await update(ref(db), { gameState: 'level3' });
  };

  // --- RENDER ---

  // 1. Intro Screen
  if (status === 'intro') {
    return (
      <div className="w-full max-w-md mx-auto space-y-8 text-center animate-fade-in">
        <div className="glass-card p-10 flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-christmas-accent/10 rounded-full flex items-center justify-center border border-christmas-accent/30">
            <span className="text-4xl">🕵️‍♀️</span>
          </div>
          <div>
            <h2 className="text-3xl font-serif text-christmas-accent mb-2">{TITLE}</h2>
            <div className="w-12 h-1 bg-christmas-accent/20 mx-auto mb-4" />
            <p className="text-christmas-text/80 leading-relaxed font-serif">{RULES}</p>
            <div className="inline-block bg-christmas-accent/10 px-4 py-1 rounded-full text-christmas-accent text-sm font-bold mt-2">
              獎勵: +{POINTS_PER_WIN} 分 / 猜對
            </div>
          </div>
          {isAdmin ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartLevel}
              className="mt-4 px-8 py-3 bg-christmas-accent text-white font-serif rounded-full shadow-lg hover:bg-christmas-accent/90"
            >
              開始 Level 2
            </motion.button>
          ) : (
            <p className="text-sm text-christmas-text/40 animate-pulse mt-4">等待主持人...</p>
          )}
        </div>
      </div>
    );
  }

  // 2. Level Complete Screen
  if (status === 'level_complete') {
    const sortedPlayers = Object.values(players).sort((a, b) => b.score - a.score);
    return (
      <div className="w-full max-w-md mx-auto space-y-8 text-center animate-fade-in">
        <div className="glass-card p-8">
          <h2 className="text-2xl font-serif text-christmas-accent mb-6">Level 2 完成！</h2>
          <div className="space-y-3 mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-christmas-text/50">目前排名</h3>
            {sortedPlayers.slice(0, 3).map((p, idx) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-white/40 rounded-xl border border-white/50">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${idx===0?'bg-yellow-400 text-white':idx===1?'bg-gray-300 text-white':idx===2?'bg-amber-600 text-white':'bg-transparent text-christmas-text/50'}`}>
                    {idx + 1}
                  </span>
                  <span className="font-serif">{p.name}</span>
                </div>
                <span className="font-bold text-christmas-accent">{p.score} 分</span>
              </div>
            ))}
          </div>
          {isAdmin ? (
            <button onClick={handleStartLevel3} className="w-full bg-christmas-accent text-white font-serif py-3 rounded-xl shadow-lg hover:bg-christmas-accent/90">
              前往 Level 3 →
            </button>
          ) : (
            <p className="text-sm text-christmas-text/40 animate-pulse">等待下一關...</p>
          )}
        </div>
      </div>
    );
  }

  // 3. Game Screen
  const currentQ = questions[currentQIndex];
  if (!currentQ) return <div className="text-center p-10">載入秘密中...</div>;

  const isWinner = status === 'truth_revealed' && myVote === currentQ.ownerId && user.id !== currentQ.ownerId;

  return (
    <div className="w-full max-w-md mx-auto space-y-6 relative">
      {/* Score Animation */}
      {status === 'truth_revealed' && isWinner && showScoreAnim && (
        <motion.div 
          initial={{ scale: 0.5, y: 0, opacity: 0 }}
          animate={{ scale: [0.5, 1.2, 1], y: [0, -50, -100], opacity: [0, 1, 0] }}
          transition={{ duration: 2, times: [0, 0.2, 1], ease: "easeOut" }}
          onAnimationComplete={() => setShowScoreAnim(false)}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
        >
          <div className="text-6xl font-bold text-yellow-400 drop-shadow-lg flex items-center gap-2 filter drop-shadow-md">
            <span>+{POINTS_PER_WIN}</span><span className="text-4xl">分!</span>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="text-center">
        <h2 className="text-christmas-accent font-serif text-xl">Level 2: Who Knows Me?</h2>
        <div className="flex items-center justify-center gap-3 text-xs uppercase tracking-widest text-christmas-text/60 mt-1">
          <span>秘密 {currentQIndex + 1} / {questions.length}</span>
          <span className="w-1 h-1 rounded-full bg-christmas-text/30" />
          <span className="text-christmas-accent font-bold">勝: +{POINTS_PER_WIN} 分</span>
        </div>
      </div>

      {/* Secret Card */}
      <motion.div 
        key={currentQIndex}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 text-center min-h-[200px] flex flex-col items-center justify-center relative overflow-hidden"
      >
        <span className="text-6xl mb-4 opacity-20">❝</span>
        <h3 className="text-2xl font-serif text-christmas-text leading-relaxed italic relative z-10">
          {currentQ.q}
        </h3>
        <span className="text-6xl mt-4 opacity-20">❞</span>
        
        {/* Revealed Owner Overlay */}
        {status === 'truth_revealed' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 bg-christmas-accent/90 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20"
          >
            <p className="text-sm uppercase tracking-widest mb-2 opacity-80">這個秘密屬於</p>
            <h2 className="text-4xl font-serif font-bold">{currentQ.ownerName}</h2>
          </motion.div>
        )}
      </motion.div>

      {/* Options (Players) */}
      <div className="grid grid-cols-2 gap-3">
        {Object.values(players).map((p) => {
          const isSelected = myVote === p.id;
          const isCorrect = status === 'truth_revealed' && p.id === currentQ.ownerId;
          
          // Count votes for this player (Only show in 'votes_revealed' or 'truth_revealed')
          const votersForThisPlayer = Object.entries(votes)
            .filter(([_, votedId]) => votedId === p.id)
            .map(([voterId]) => players[voterId]?.name.charAt(0));

          const showVotes = status === 'votes_revealed' || status === 'truth_revealed';

          return (
            <motion.button
              key={p.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleVote(p.id)}
              disabled={status !== 'voting'}
              className={`
                p-4 rounded-xl text-sm font-serif transition-all border flex flex-col items-center gap-2 relative
                ${isSelected 
                  ? 'bg-christmas-accent text-white border-christmas-accent shadow-lg' 
                  : 'bg-white/40 border-white/40 text-christmas-text hover:bg-white/60'}
                ${status === 'truth_revealed' && !isCorrect ? 'opacity-50' : ''}
                ${isCorrect ? 'ring-4 ring-yellow-400 ring-offset-2 z-10' : ''}
              `}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-white/20' : 'bg-christmas-accent/10'}`}>
                {p.name.charAt(0).toUpperCase()}
              </div>
              <span>{p.name}</span>

              {/* Show Voters Avatars */}
              {showVotes && votersForThisPlayer.length > 0 && (
                <div className="absolute -top-2 -right-2 flex -space-x-1">
                  {votersForThisPlayer.map((initial, i) => (
                    <div key={i} className="w-5 h-5 rounded-full bg-white text-christmas-accent text-[10px] flex items-center justify-center border border-christmas-accent shadow-sm">
                      {initial}
                    </div>
                  ))}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Admin Controls */}
      {isAdmin && (
        <div className="pt-8 border-t border-christmas-text/10 flex flex-col items-center gap-2">
          <p className="text-xs font-serif text-christmas-text/60">
            已投票: {Object.keys(votes).length} / {Object.keys(players).length}
          </p>
          
          {status === 'voting' && (
            <button 
              onClick={handleShowVotes} 
              className="w-full bg-christmas-text text-white font-serif py-3 rounded-xl shadow-lg hover:bg-christmas-text/90"
            >
              結束投票 (顯示猜測)
            </button>
          )}
          
          {status === 'votes_revealed' && (
            <div className="flex flex-col gap-2 w-full">
              {Object.keys(votes).length === 0 && (
                <button 
                  onClick={() => set(ref(db, 'level2/status'), 'voting')}
                  className="w-full bg-gray-500 text-white font-serif py-3 rounded-xl shadow-lg hover:bg-gray-600"
                >
                  重新開放投票
                </button>
              )}
              <button onClick={handleRevealTruth} className="w-full bg-christmas-accent text-white font-serif py-3 rounded-xl shadow-lg hover:bg-christmas-accent/90">
                公佈真相
              </button>
            </div>
          )}

          {status === 'truth_revealed' && (
            <button onClick={handleNextQuestion} className="w-full bg-christmas-text text-white font-serif py-3 rounded-xl shadow-lg hover:bg-christmas-text/90">
              {currentQIndex < questions.length - 1 ? '下一個秘密 →' : '結束 Level 2 →'}
            </button>
          )}
        </div>
      )}

      {/* Waiting Indicator */}
      {status === 'voting' && myVote !== null && (
        <p className="text-center text-christmas-text/50 text-sm animate-pulse">等待其他人...</p>
      )}
    </div>
  );
};

export default Level2;
