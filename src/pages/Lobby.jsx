import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../store/gameStore';
import { User, Lock, ArrowRight } from 'lucide-react';

const Lobby = () => {
  const { joinGame, user, isAdmin, logout, resetAllGame, startGame, players } = useGame();
  const [nickname, setNickname] = useState('');
  const [secret1, setSecret1] = useState('');
  const [secret2, setSecret2] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nickname.trim() || !secret1.trim() || !secret2.trim()) {
      setError('Please fill in all fields to join the party!');
      return;
    }
    joinGame(nickname, [secret1, secret2]);
  };

  // If user is already logged in, show waiting screen
  if (user) {
    return (
      <div className="text-center space-y-8 animate-fade-in relative">
        <div className="glass-card p-8 max-w-sm mx-auto relative">
          {/* Controls */}
          <div className="absolute top-4 right-4 flex gap-2">
            
            {/* Player: Leave */}
            <button 
              onClick={logout}
              className="text-xs text-christmas-text/40 hover:text-christmas-text transition-colors"
            >
              Leave
            </button>
          </div>

          <div className="w-20 h-20 bg-christmas-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-serif text-christmas-accent">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <h2 className="text-2xl font-serif text-christmas-text mb-2">
            Welcome, {user.name}!
          </h2>
          <p className="text-christmas-text/60 font-sans text-sm">
            You are in the lobby.
          </p>
          <div className="my-6 border-t border-christmas-text/10" />
          <p className="text-christmas-text/80 animate-pulse mb-8">
            Waiting for host to start the game...
          </p>

          {/* Player List */}
          <div className="border-t border-christmas-text/10 pt-6">
            <h3 className="text-sm font-serif text-christmas-text/60 mb-4">
              Joined Players ({Object.keys(players).length})
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {Object.values(players).map((p) => (
                <div key={p.id} className="flex flex-col items-center animate-slide-up">
                  <div className="w-10 h-10 bg-white/50 rounded-full flex items-center justify-center border border-white/60 shadow-sm">
                    <span className="text-sm font-serif text-christmas-text">
                      {p.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-christmas-text/70 mt-1">{p.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Start Button */}
          {isAdmin && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={startGame}
              className="mt-8 w-full bg-christmas-accent text-white font-serif py-3 rounded-xl shadow-lg hover:bg-christmas-accent/90"
            >
              Start Game (Admin)
            </motion.button>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="glass-card p-8">
        <h2 className="text-3xl font-serif text-christmas-text text-center mb-2">
          Join the Party
        </h2>
        <p className="text-center text-christmas-text/60 text-sm mb-8">
          Enter your details to start
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nickname Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-christmas-text/50 ml-1">
              Nickname
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-christmas-text/40" />
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. Santa Claus"
                className="w-full bg-white/50 border border-white/40 rounded-xl py-3 pl-12 pr-4 
                         text-christmas-text placeholder:text-christmas-text/30 focus:outline-none 
                         focus:ring-2 focus:ring-christmas-accent/50 transition-all"
              />
            </div>
          </div>

          {/* Secrets Section */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-christmas-accent" />
              <span className="text-sm font-serif italic text-christmas-text/80">
                Two Secrets about You
              </span>
            </div>
            
            <input
              type="text"
              value={secret1}
              onChange={(e) => setSecret1(e.target.value)}
              placeholder="1. I once ate a whole pizza..."
              className="w-full bg-white/50 border border-white/40 rounded-xl py-3 px-4 
                       text-christmas-text placeholder:text-christmas-text/30 focus:outline-none 
                       focus:ring-2 focus:ring-christmas-accent/50 text-sm"
            />
            <input
              type="text"
              value={secret2}
              onChange={(e) => setSecret2(e.target.value)}
              placeholder="2. My hidden talent is..."
              className="w-full bg-white/50 border border-white/40 rounded-xl py-3 px-4 
                       text-christmas-text placeholder:text-christmas-text/30 focus:outline-none 
                       focus:ring-2 focus:ring-christmas-accent/50 text-sm"
            />
          </div>

          {error && (
            <p className="text-christmas-red text-sm text-center bg-christmas-red/10 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-christmas-accent text-white font-serif py-4 rounded-xl
                     shadow-lg shadow-christmas-accent/20 hover:bg-christmas-accent/90 
                     transform hover:scale-[1.02] active:scale-[0.98] transition-all
                     flex items-center justify-center gap-2 group"
          >
            <span>Ready to Party</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default Lobby;
