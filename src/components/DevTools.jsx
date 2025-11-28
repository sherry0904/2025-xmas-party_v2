import React, { useState } from 'react';
import { useGame } from '../store/gameStore';
import { Settings, X, ChevronRight } from 'lucide-react';
import { ref, set } from 'firebase/database';
import { db } from '../firebase';

const DevTools = () => {
  const { isAdmin, setGameState } = useGame();
  const [isOpen, setIsOpen] = useState(false);

  if (!isAdmin) return null;

  const handleJump = async (state) => {
    // Update Firebase state directly to ensure all clients sync
    await set(ref(db, 'gameState'), state);
    
    // For levels, we might want to reset their status to 'intro' to ensure a clean start
    if (state === 'level1') {
      await set(ref(db, 'level1/status'), 'intro');
      await set(ref(db, 'level1/currentQ'), 0);
    } else if (state === 'level2') {
      await set(ref(db, 'level2/status'), 'intro');
      await set(ref(db, 'level2/currentQ'), 0);
    } else if (state === 'level3') {
      await set(ref(db, 'level3/status'), 'intro');
      await set(ref(db, 'level3/round'), 0);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end">
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-all border border-gray-600"
          title="Developer Tools"
        >
          <Settings className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="bg-gray-900/95 backdrop-blur text-white p-4 rounded-xl shadow-2xl border border-gray-700 w-48 animate-fade-in">
          <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
            <span className="font-bold text-sm text-gray-300">Dev Tools</span>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Jump to Level</p>
            <button 
              onClick={() => handleJump('lobby')}
              className="w-full text-left text-xs py-2 px-3 rounded hover:bg-gray-800 flex items-center gap-2 transition-colors"
            >
              <ChevronRight className="w-3 h-3" /> Lobby
            </button>
            <button 
              onClick={() => handleJump('gift_rating')}
              className="w-full text-left text-xs py-2 px-3 rounded hover:bg-gray-800 flex items-center gap-2 transition-colors"
            >
              <ChevronRight className="w-3 h-3" /> Gift Rating
            </button>
            <button 
              onClick={() => handleJump('level1')}
              className="w-full text-left text-xs py-2 px-3 rounded hover:bg-gray-800 flex items-center gap-2 transition-colors"
            >
              <ChevronRight className="w-3 h-3" /> Level 1
            </button>
            <button 
              onClick={() => handleJump('level2')}
              className="w-full text-left text-xs py-2 px-3 rounded hover:bg-gray-800 flex items-center gap-2 transition-colors"
            >
              <ChevronRight className="w-3 h-3" /> Level 2
            </button>
            <button 
              onClick={() => handleJump('level3')}
              className="w-full text-left text-xs py-2 px-3 rounded hover:bg-gray-800 flex items-center gap-2 transition-colors"
            >
              <ChevronRight className="w-3 h-3" /> Level 3
            </button>
            <button 
              onClick={() => handleJump('result')}
              className="w-full text-left text-xs py-2 px-3 rounded hover:bg-gray-800 flex items-center gap-2 transition-colors"
            >
              <ChevronRight className="w-3 h-3" /> Result
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevTools;
