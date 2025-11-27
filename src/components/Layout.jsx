import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, ChevronUp, ChevronDown } from 'lucide-react';
import { useGame } from '../store/gameStore';

const Layout = ({ children }) => {
  const { user, players, isAdmin, resetAllGame, gameState } = useGame() || {}; // Handle case where context might be null initially
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Sort players by score
  const sortedPlayers = players 
    ? Object.values(players).sort((a, b) => (b.score || 0) - (a.score || 0))
    : [];

  return (
    <div className="min-h-screen bg-christmas-background text-christmas-text font-sans overflow-hidden relative flex flex-col">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-christmas-gold/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [null, Math.random() * -100],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              width: Math.random() * 10 + 5,
              height: Math.random() * 10 + 5,
            }}
          />
        ))}
      </div>

      {/* Persistent Header (Score) */}
      {user && (
        <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center bg-gradient-to-b from-christmas-background to-transparent">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-christmas-accent/20 rounded-full flex items-center justify-center border border-christmas-accent/50">
              <span className="font-serif text-christmas-accent font-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="font-serif text-sm">{user.name}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Admin Reset Button */}
            {isAdmin && (
              <button 
                onClick={resetAllGame}
                className="text-[10px] bg-red-500/20 text-red-800 px-2 py-1 rounded border border-red-500/30 hover:bg-red-500/40 transition-colors"
              >
                Reset All
              </button>
            )}
            
            <div className="flex items-center gap-2 bg-white/40 px-3 py-1 rounded-full border border-white/50 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-christmas-accent" />
              <span className="font-bold text-christmas-accent">{user.score || 0} pts</span>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col justify-center p-6 pt-20 pb-24">
        {children}
      </main>

      {/* Persistent Footer (Leaderboard) - Only show in active game levels */}
      {user && ['level1', 'level2', 'level3'].includes(gameState) && (
        <>
          <motion.div 
            className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-t border-christmas-gold/30 rounded-t-3xl shadow-2xl"
            animate={{ y: showLeaderboard ? 0 : 'calc(100% - 60px)' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            {/* Handle / Title */}
            <div 
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="h-[60px] flex items-center justify-between px-6 cursor-pointer active:bg-white/50 transition-colors gap-4"
            >
              <div className="flex items-center gap-2 min-w-fit">
                <Trophy className="w-5 h-5 text-christmas-accent" />
                {/* Show Title only when expanded or if no players */}
                {(showLeaderboard || sortedPlayers.length === 0) && (
                  <span className="font-serif font-bold text-christmas-text">Leaderboard</span>
                )}
              </div>

              {/* Preview of Top 3 (Only when collapsed) */}
              {!showLeaderboard && sortedPlayers.length > 0 && (
                <div className="flex-1 flex items-center gap-3 overflow-hidden text-xs">
                  {sortedPlayers.slice(0, 3).map((p, i) => (
                    <div key={p.id} className="flex items-center gap-1 min-w-fit">
                      <span className={`font-bold ${i===0?'text-yellow-600':i===1?'text-gray-500':'text-amber-700'}`}>
                        {i+1}.
                      </span>
                      <span className="truncate max-w-[50px] font-serif">{p.name}</span>
                      <span className="font-bold text-christmas-accent">{p.score||0}</span>
                    </div>
                  ))}
                  {sortedPlayers.length > 3 && <span className="text-christmas-text/40">...</span>}
                </div>
              )}

              {showLeaderboard ? <ChevronDown className="w-5 h-5 opacity-50 min-w-fit" /> : <ChevronUp className="w-5 h-5 opacity-50 min-w-fit" />}
            </div>

            {/* List */}
            <div className="px-6 pb-8 space-y-3 max-h-[60vh] overflow-y-auto">
              {sortedPlayers.map((p, idx) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-white/60">
                  <div className="flex items-center gap-3">
                    <span className={`
                      w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                      ${idx === 0 ? 'bg-yellow-400 text-white' : 
                        idx === 1 ? 'bg-gray-300 text-white' : 
                        idx === 2 ? 'bg-amber-600 text-white' : 'bg-transparent text-christmas-text/50'}
                    `}>
                      {idx + 1}
                    </span>
                    <span className="font-serif text-sm">{p.name}</span>
                  </div>
                  <span className="font-bold text-christmas-accent text-sm">{p.score || 0}</span>
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Overlay to close */}
          <AnimatePresence>
            {showLeaderboard && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowLeaderboard(false)}
                className="fixed inset-0 bg-black/20 z-30"
              />
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default Layout;
