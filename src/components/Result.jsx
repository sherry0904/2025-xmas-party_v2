import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../store/gameStore';
import Confetti from 'react-confetti';
import { Trophy, Gift, Star, BarChart2 } from 'lucide-react';
import GiftInsights from './GiftInsights';

const Result = () => {
  const { players, isAdmin, resetAllGame } = useGame();
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [showInsights, setShowInsights] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sort players by score (High to Low)
  const sortedPlayers = Object.values(players).sort((a, b) => b.score - a.score);

  const [expandedPlayerIds, setExpandedPlayerIds] = useState([]);

  // Helper: Get recommendations for a specific player (receiver)
  const getRecommendations = (receiverId) => {
    const recs = [];
    Object.values(players).forEach(giver => {
      if (giver.id === receiverId) return; // Skip self
      const score = giver.gift_suitability?.[receiverId] || 0;
      recs.push({ giverName: giver.name, score });
    });
    // Sort by score (High to Low)
    return recs.sort((a, b) => b.score - a.score);
  };

  const toggleExpand = (id) => {
    setExpandedPlayerIds(prev => 
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full min-h-screen relative overflow-hidden flex flex-col items-center py-10">
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={true}
        numberOfPieces={200}
        gravity={0.1}
      />

      <AnimatePresence>
        {showInsights && (
          <GiftInsights players={players} onClose={() => setShowInsights(false)} />
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="z-10 text-center mb-8"
      >
        <h1 className="text-5xl font-serif text-christmas-accent mb-2 drop-shadow-lg">
          Final Results
        </h1>
        <p className="text-christmas-text/60 font-serif italic">
          派對結束！王者誕生。
        </p>
      </motion.div>

      {/* Podium (Top 3) */}
      <div className="flex items-end justify-center gap-4 mb-12 z-10 w-full max-w-lg px-4">
        {/* 2nd Place */}
        {sortedPlayers[1] && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="w-20 h-20 rounded-full bg-gray-300 border-4 border-white shadow-lg flex items-center justify-center mb-2 relative">
              <span className="text-2xl font-bold text-gray-700">{sortedPlayers[1].name.charAt(0)}</span>
              <div className="absolute -bottom-3 bg-gray-600 text-white text-xs px-2 py-1 rounded-full">2nd</div>
            </div>
            <span className="font-serif font-bold text-christmas-text">{sortedPlayers[1].name}</span>
            <span className="text-sm text-christmas-text/60">{sortedPlayers[1].score} 分</span>
            <div className="w-20 h-24 bg-gray-300/30 rounded-t-lg mt-2 border-t border-white/50" />
          </motion.div>
        )}

        {/* 1st Place */}
        {sortedPlayers[0] && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center -mx-2 z-20"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-yellow-400 border-4 border-white shadow-xl flex items-center justify-center mb-2 relative">
                <span className="text-3xl font-bold text-yellow-900">{sortedPlayers[0].name.charAt(0)}</span>
                <div className="absolute -bottom-3 bg-yellow-600 text-white text-xs px-3 py-1 rounded-full font-bold">1st</div>
              </div>
            </div>
            <span className="font-serif font-bold text-christmas-text text-lg">{sortedPlayers[0].name}</span>
            <span className="text-sm font-bold text-christmas-accent">{sortedPlayers[0].score} 分</span>
            <div className="w-24 h-32 bg-yellow-400/30 rounded-t-lg mt-2 border-t border-white/50" />
          </motion.div>
        )}

        {/* 3rd Place */}
        {sortedPlayers[2] && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col items-center"
          >
            <div className="w-20 h-20 rounded-full bg-amber-600 border-4 border-white shadow-lg flex items-center justify-center mb-2 relative">
              <span className="text-2xl font-bold text-amber-100">{sortedPlayers[2].name.charAt(0)}</span>
              <div className="absolute -bottom-3 bg-amber-800 text-white text-xs px-2 py-1 rounded-full">3rd</div>
            </div>
            <span className="font-serif font-bold text-christmas-text">{sortedPlayers[2].name}</span>
            <span className="text-sm text-christmas-text/60">{sortedPlayers[2].score} 分</span>
            <div className="w-20 h-16 bg-amber-600/30 rounded-t-lg mt-2 border-t border-white/50" />
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6 z-10">
        <button
          onClick={() => setShowInsights(true)}
          className="flex items-center gap-2 bg-white/80 backdrop-blur text-christmas-accent px-5 py-2 rounded-full shadow-lg hover:bg-white transition-all text-sm font-bold border border-christmas-accent/30"
        >
          <BarChart2 className="w-4 h-4" />
          禮物大數據
        </button>
      </div>

      {/* Full List & Gift Recommendations */}
      <div className="w-full max-w-md px-6 z-10 pb-20">
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4 text-christmas-text/60 uppercase tracking-widest text-xs font-bold">
            <Gift className="w-4 h-4" />
            <span>禮物交換順序</span>
          </div>
          
          <div className="space-y-3">
            {sortedPlayers.map((p, idx) => (
              <motion.div 
                key={p.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1 + idx * 0.1 }}
                className="bg-white/40 rounded-xl border border-white/50 overflow-hidden"
              >
                {/* Header Row */}
                <div 
                  onClick={() => toggleExpand(p.id)}
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-bold text-christmas-text/40">{idx + 1}</span>
                    <span className="font-serif">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-christmas-accent">{p.score}</span>
                    <span className="text-xs text-christmas-text/40">分</span>
                  </div>
                </div>

                {/* Expanded Details (Gift Recommendations) */}
                {expandedPlayerIds.includes(p.id) && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="bg-white/30 px-4 pb-4 pt-2 border-t border-white/20"
                  >
                    <p className="text-xs font-bold text-christmas-text/50 uppercase mb-2">
                      {p.name} 的最佳禮物推薦:
                    </p>
                    <div className="space-y-1">
                      {getRecommendations(p.id).map((rec, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-christmas-text/80">{rec.giverName} 的禮物</span>
                          <div className="flex gap-1">
                            {[...Array(rec.score)].map((_, starI) => (
                              <Star key={starI} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Admin Reset (Redundant with global reset, but good for flow) */}
      {isAdmin && (
        <div className="fixed bottom-8 z-20">
           <button 
             onClick={resetAllGame}
             className="bg-white/80 backdrop-blur text-christmas-text px-6 py-2 rounded-full shadow-lg hover:bg-white transition-all text-sm font-serif border border-christmas-gold/30"
           >
             開始新遊戲
           </button>
        </div>
      )}

    </div>
  );
};

export default Result;
