import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../store/gameStore';
import { ref, set, onValue } from 'firebase/database';
import { db } from '../firebase';
import { Star, Gift, CheckCircle } from 'lucide-react';

const GiftRating = () => {
  const { user, players, isAdmin, startLevel1 } = useGame();
  const [ratings, setRatings] = useState({}); // { targetId: 1-5 }
  const [submitted, setSubmitted] = useState(false);
  const [finishedPlayers, setFinishedPlayers] = useState([]);

  // Listen for who has finished
  useEffect(() => {
    const finishedRef = ref(db, 'gift_ratings_finished');
    const unsub = onValue(finishedRef, (snap) => {
      setFinishedPlayers(Object.keys(snap.val() || {}));
    });
    return () => unsub();
  }, []);

  const handleRate = (targetId, score) => {
    setRatings(prev => ({
      ...prev,
      [targetId]: score
    }));
  };

  const handleSubmit = async () => {
    // Save ratings to Firebase
    // Structure: players/{myId}/gift_suitability/{targetId} = score
    await set(ref(db, `players/${user.id}/gift_suitability`), ratings);
    
    // Mark self as finished
    await set(ref(db, `gift_ratings_finished/${user.id}`), true);
    setSubmitted(true);
  };

  // Filter out self
  const otherPlayers = Object.values(players).filter(p => p.id !== user.id);
  
  // Robust check: Are ALL current players in the finished list?
  const allFinished = Object.keys(players).length > 0 && Object.keys(players).every(pid => finishedPlayers.includes(pid));

  // --- Render ---

  if (submitted) {
    return (
      <div className="w-full max-w-md mx-auto text-center space-y-8 animate-fade-in">
        <div className="glass-card p-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-serif text-christmas-text mb-2">All Set!</h2>
          <p className="text-christmas-text/60 mb-8">
            Waiting for others to finish rating...
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {Object.values(players).map(p => (
              <div key={p.id} className={`
                px-3 py-1 rounded-full text-xs font-bold border transition-all
                ${finishedPlayers.includes(p.id) 
                  ? 'bg-green-100 text-green-700 border-green-200' 
                  : 'bg-gray-100 text-gray-400 border-gray-200'}
              `}>
                {p.name} {finishedPlayers.includes(p.id) ? '✓' : '...'}
              </div>
            ))}
          </div>

          {isAdmin && (
            <button 
              onClick={startLevel1}
              disabled={!allFinished}
              className={`
                w-full py-3 rounded-xl font-serif shadow-lg transition-all
                ${allFinished 
                  ? 'bg-christmas-accent text-white hover:bg-christmas-accent/90' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
              `}
            >
              {allFinished ? 'Start Level 1 →' : 'Waiting for everyone...'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6 pb-20">
      <div className="text-center">
        <div className="w-16 h-16 bg-christmas-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-christmas-accent/20">
          <Gift className="w-8 h-8 text-christmas-accent" />
        </div>
        <h2 className="text-2xl font-serif text-christmas-text">Gift Suitability</h2>
        <p className="text-sm text-christmas-text/60 px-4 mt-2">
          Rate how suitable <b>YOUR GIFT</b> is for each person. <br/>
          (5 = Perfect Match, 1 = Nightmare)
        </p>
      </div>

      <div className="space-y-4">
        {otherPlayers.map(p => (
          <motion.div 
            key={p.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-christmas-text/5 flex items-center justify-center font-serif font-bold text-christmas-text">
                {p.name.charAt(0)}
              </div>
              <span className="font-serif text-christmas-text">{p.name}</span>
            </div>

            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => handleRate(p.id, star)}
                  className="focus:outline-none transition-transform active:scale-90"
                >
                  <Star 
                    className={`w-6 h-6 ${
                      (ratings[p.id] || 0) >= star 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300'
                    }`} 
                  />
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="fixed bottom-6 left-0 right-0 px-6 max-w-md mx-auto z-30">
        <button
          onClick={handleSubmit}
          disabled={Object.keys(ratings).length < otherPlayers.length}
          className={`
            w-full py-4 rounded-xl font-serif shadow-xl text-lg transition-all
            ${Object.keys(ratings).length < otherPlayers.length
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-christmas-accent text-white hover:bg-christmas-accent/90 hover:scale-[1.02]'}
          `}
        >
          Submit Ratings
        </button>
      </div>
    </div>
  );
};

export default GiftRating;
