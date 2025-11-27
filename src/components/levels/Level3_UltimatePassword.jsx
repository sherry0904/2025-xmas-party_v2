import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../store/gameStore';
import { ref, set, onValue, update } from 'firebase/database';
import { db } from '../../firebase';
import { LEVEL3_CONFIG } from '../../config/gameConfig';
import { Bomb, Skull, PartyPopper } from 'lucide-react';

const { TITLE, RULES, ROUNDS } = LEVEL3_CONFIG;

const Level3 = () => {
  const { user, isAdmin, players } = useGame();
  const [currentRound, setCurrentRound] = useState(0); // 0, 1, 2
  const [status, setStatus] = useState('intro'); // 'intro' | 'playing' | 'boom' | 'round_complete' | 'game_complete'
  
  // Game State
  const [targetNumber, setTargetNumber] = useState(null);
  const [range, setRange] = useState({ min: 1, max: 100 });
  const [turnPlayerId, setTurnPlayerId] = useState(null);
  const [turnOrder, setTurnOrder] = useState([]); // Array of player IDs
  const [guessHistory, setGuessHistory] = useState([]);
  const [boomPlayerId, setBoomPlayerId] = useState(null);

  // Local Input
  const [myInput, setMyInput] = useState('');

  // --- Firebase Listeners ---
  useEffect(() => {
    const refs = {
      round: ref(db, 'level3/round'),
      status: ref(db, 'level3/status'),
      range: ref(db, 'level3/range'),
      turn: ref(db, 'level3/turn'),
      turnOrder: ref(db, 'level3/turnOrder'),
      history: ref(db, 'level3/history'),
      boom: ref(db, 'level3/boom'),
      target: ref(db, 'level3/target') 
    };

    const unsubscribes = [
      onValue(refs.round, s => setCurrentRound(s.val() || 0)),
      onValue(refs.status, s => setStatus(s.val() || 'intro')),
      onValue(refs.range, s => setRange(s.val() || { min: 1, max: 100 })),
      onValue(refs.turn, s => setTurnPlayerId(s.val())),
      onValue(refs.turnOrder, s => setTurnOrder(s.val() || [])),
      onValue(refs.history, s => setGuessHistory(s.val() || [])),
      onValue(refs.boom, s => setBoomPlayerId(s.val())),
      onValue(refs.target, s => setTargetNumber(s.val()))
    ];

    return () => unsubscribes.forEach(u => u());
  }, []);

  // --- Logic ---

  const config = ROUNDS[currentRound] || ROUNDS[0];

  const handleStartRound = async () => {
    // Init Round
    const newTarget = Math.floor(Math.random() * (config.range - 2)) + 2; // 2 to max-1
    
    // Determine Turn Order: Lowest Score First
    const sortedPlayerIds = Object.values(players)
      .sort((a, b) => (a.score || 0) - (b.score || 0))
      .map(p => p.id);

    await update(ref(db, 'level3'), {
      status: 'playing',
      target: newTarget,
      range: { min: 1, max: config.range },
      turn: sortedPlayerIds[0],
      turnOrder: sortedPlayerIds,
      history: null,
      boom: null
    });
  };

  const handleGuess = async () => {
    if (!myInput) return;
    const guess = parseInt(myInput);
    
    // Validation
    if (isNaN(guess) || guess <= range.min || guess >= range.max) {
      alert(`Please enter a number between ${range.min} and ${range.max}`);
      return;
    }

    // Check Boom
    if (guess === targetNumber) {
      // BOOM!
      await update(ref(db, 'level3'), {
        status: 'boom',
        boom: user.id
      });
      
      // Calculate Scores
      const updates = {};
      const penalty = config.penalty;
      const reward = config.reward;

      Object.keys(players).forEach(pid => {
        const currentScore = players[pid].score || 0;
        if (pid === user.id) {
          updates[`players/${pid}/score`] = currentScore + penalty;
        } else {
          updates[`players/${pid}/score`] = currentScore + reward;
        }
      });
      await update(ref(db), updates);

    } else {
      // Safe -> Update Range & Turn
      const newRange = { ...range };
      if (guess > targetNumber) newRange.max = guess;
      else newRange.min = guess;

      // Next Player based on Turn Order
      const currentIndex = turnOrder.indexOf(user.id);
      const nextIndex = (currentIndex + 1) % turnOrder.length;
      const nextPlayerId = turnOrder[nextIndex];

      // Update History
      const newHistory = [...guessHistory, { name: user.name, guess }];

      await update(ref(db, 'level3'), {
        range: newRange,
        turn: nextPlayerId,
        history: newHistory
      });
    }
    setMyInput('');
  };

  const handleNextRound = async () => {
    if (currentRound < ROUNDS.length - 1) {
      await update(ref(db, 'level3'), {
        round: currentRound + 1,
        status: 'intro'
      });
    } else {
      await set(ref(db, 'level3/status'), 'game_complete');
    }
  };

  const handleFinishGame = async () => {
     await update(ref(db), { gameState: 'result' });
  };

  // --- Render ---

  // 1. Intro / Round Start
  if (status === 'intro') {
    return (
      <div className="w-full max-w-md mx-auto space-y-8 text-center animate-fade-in">
        <div className="glass-card p-10 flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30 animate-pulse">
            <Bomb className="w-10 h-10 text-red-500" />
          </div>
          <div>
            <h2 className="text-3xl font-serif text-christmas-accent mb-2">Round {currentRound + 1}</h2>
            <div className="text-sm font-bold text-christmas-text/60 uppercase tracking-widest mb-4">
              Range: 1 ~ {config.range}
            </div>
            <div className="flex justify-center gap-4 text-sm">
              <span className="text-red-600 bg-red-100 px-3 py-1 rounded-full border border-red-200">
                Boom: {config.penalty} pts
              </span>
              <span className="text-green-600 bg-green-100 px-3 py-1 rounded-full border border-green-200">
                Survive: +{config.reward} pts
              </span>
            </div>
          </div>

          {isAdmin ? (
            <button 
              onClick={handleStartRound}
              className="mt-4 px-8 py-3 bg-christmas-accent text-white font-serif rounded-full shadow-lg hover:bg-christmas-accent/90"
            >
              Start Round {currentRound + 1}
            </button>
          ) : (
            <p className="text-sm text-christmas-text/40 animate-pulse mt-4">Waiting for host...</p>
          )}
        </div>
      </div>
    );
  }

  // 2. Boom / Round End
  if (status === 'boom') {
    const boomPlayer = players[boomPlayerId];
    return (
      <div className="w-full max-w-md mx-auto space-y-8 text-center animate-fade-in">
        <div className="glass-card p-10 bg-red-50/90 border-red-200">
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} 
            className="text-8xl mb-6 flex justify-center"
          >
            💥
          </motion.div>
          
          <h2 className="text-4xl font-serif text-red-600 mb-2">BOOM!</h2>
          <p className="text-xl text-christmas-text mb-6">
            <span className="font-bold">{boomPlayer?.name}</span> hit the number <span className="font-bold text-red-600">{targetNumber}</span>!
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
             <div className="bg-red-100 p-4 rounded-xl border border-red-200">
               <div className="text-xs uppercase text-red-500 font-bold">Loser</div>
               <div className="text-2xl font-bold text-red-700">{config.penalty} pts</div>
             </div>
             <div className="bg-green-100 p-4 rounded-xl border border-green-200">
               <div className="text-xs uppercase text-green-500 font-bold">Survivors</div>
               <div className="text-2xl font-bold text-green-700">+{config.reward} pts</div>
             </div>
          </div>

          {isAdmin && (
            <button 
              onClick={handleNextRound}
              className="w-full bg-christmas-accent text-white font-serif py-3 rounded-xl shadow-lg hover:bg-christmas-accent/90"
            >
              {currentRound < ROUNDS.length - 1 ? 'Next Round →' : 'Finish Game →'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. Game Complete
  if (status === 'game_complete') {
     return (
       <div className="w-full max-w-md mx-auto text-center">
         <div className="glass-card p-10">
           <h2 className="text-3xl font-serif text-christmas-accent mb-6">All Rounds Complete!</h2>
           {isAdmin && (
             <button 
               onClick={handleFinishGame}
               className="w-full bg-christmas-accent text-white font-serif py-3 rounded-xl shadow-lg hover:bg-christmas-accent/90"
             >
               See Final Results 🏆
             </button>
           )}
         </div>
       </div>
     );
  }

  // 4. Playing
  const isMyTurn = turnPlayerId === user.id;
  const turnPlayer = players[turnPlayerId];

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Header Info */}
      <div className="text-center space-y-1">
        <h2 className="text-christmas-accent font-serif text-xl">Round {currentRound + 1} / 3</h2>
        <div className="flex justify-center gap-4 text-xs font-bold text-christmas-text/50 uppercase tracking-widest">
           <span>Range: 1 ~ {config.range}</span>
           <span>Target: ???</span>
        </div>
      </div>

      {/* Main Display */}
      <div className="glass-card p-8 text-center relative overflow-hidden">
        <div className="text-6xl font-serif text-christmas-text font-bold tracking-tighter mb-2">
          {range.min} ~ {range.max}
        </div>
        <p className="text-sm text-christmas-text/40 uppercase tracking-widest">Current Range</p>
        
        {/* Turn Indicator */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 shadow-lg transition-all
            ${isMyTurn ? 'border-christmas-accent bg-white scale-110' : 'border-transparent bg-white/50 grayscale'}
          `}>
             <span className="text-2xl font-bold text-christmas-text">{turnPlayer?.name.charAt(0)}</span>
          </div>
          <div className="text-center">
            {isMyTurn ? (
              <span className="text-christmas-accent font-bold animate-pulse">It's your turn!</span>
            ) : (
              <span className="text-christmas-text/60">Waiting for {turnPlayer?.name}...</span>
            )}
          </div>
        </div>
      </div>

      {/* Input Area (Only if my turn) */}
      <AnimatePresence>
        {isMyTurn && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="glass-card p-4"
          >
            <div className="flex gap-2">
              <input 
                type="number" 
                value={myInput}
                onChange={e => setMyInput(e.target.value)}
                placeholder={`${range.min + 1} ... ${range.max - 1}`}
                className="flex-1 bg-white/80 border border-christmas-gold/30 rounded-xl px-4 text-center text-xl font-bold text-christmas-text focus:outline-none focus:ring-2 focus:ring-christmas-accent"
                autoFocus
              />
              <button 
                onClick={handleGuess}
                disabled={!myInput}
                className="bg-christmas-accent text-white px-6 rounded-xl font-bold shadow-lg hover:bg-christmas-accent/90 disabled:opacity-50"
              >
                Go
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      <div className="space-y-2 max-h-[200px] overflow-y-auto px-2">
        {guessHistory.slice().reverse().map((h, i) => (
          <div key={i} className="flex justify-between text-sm text-christmas-text/60 border-b border-christmas-text/5 pb-1">
            <span>{h.name}</span>
            <span className="font-mono font-bold">{h.guess}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Level3;
