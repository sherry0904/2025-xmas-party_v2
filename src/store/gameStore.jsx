import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, set, onValue, push, serverTimestamp } from 'firebase/database';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { id, name, secrets: [] }
  const [gameState, setGameState] = useState('lobby'); // lobby, level1, level2, level3, result
  const [players, setPlayers] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);

  // Load user from local storage on boot
  useEffect(() => {
    const savedUser = localStorage.getItem('christmas_player');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Real function to join game
  const joinGame = async (nickname, secrets) => {
    const newUserRef = push(ref(db, 'players'));
    const newUser = {
      id: newUserRef.key,
      name: nickname,
      secrets: secrets,
      score: 0,
      joinedAt: serverTimestamp()
    };
    
    try {
      await set(newUserRef, newUser);
      // Save locally
      localStorage.setItem('christmas_player', JSON.stringify(newUser));
      setUser(newUser);
    } catch (error) {
      console.error("Firebase Error:", error);
      alert("Failed to join. Check console.");
    }
  };

  // Listen to players list and determine admin
  useEffect(() => {
    const playersRef = ref(db, 'players');
    const unsubscribe = onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPlayers(data);
        
        // Check if I am still in the list (if I was logged in)
        if (user) {
          const myData = Object.values(data).find(p => p.id === user.id);
          if (!myData) {
             // My record is gone (kicked or reset), so logout locally
             logout();
          } else {
            // Sync my local user data (score, etc) with Firebase
            if (JSON.stringify(myData) !== JSON.stringify(user)) {
              setUser(myData);
              localStorage.setItem('christmas_player', JSON.stringify(myData));
            }
          }
        }

        // First player joined is Admin
        const playerList = Object.values(data).sort((a, b) => a.joinedAt - b.joinedAt);
        if (playerList.length > 0 && user && playerList[0].id === user.id) {
          setIsAdmin(true);
        }
      } else {
        setPlayers({});
        // If list is empty but I am logged in, I should be logged out (Reset All case)
        if (user) {
          logout();
        }
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Listen to global game state
  useEffect(() => {
    const stateRef = ref(db, 'gameState');
    const unsubscribe = onValue(stateRef, (snapshot) => {
      setGameState(snapshot.val() || 'lobby');
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    // Remove self from Firebase if user exists
    if (user && user.id) {
      try {
        await set(ref(db, `players/${user.id}`), null);
      } catch (e) {
        console.error("Error removing player:", e);
      }
    }
    localStorage.removeItem('christmas_player');
    setUser(null);
  };

  // Admin starts game -> Go to Gift Rating first
  const startGame = async () => {
    await set(ref(db, 'gameState'), 'gift_rating');
  };

  // Admin starts Level 1 (after ratings)
  const startLevel1 = async () => {
    await set(ref(db, 'gameState'), 'level1');
    await set(ref(db, 'level1/currentQ'), 0);
    await set(ref(db, 'level1/status'), 'intro');
  };

  // Admin only: Clear all players and reset game
  const resetAllGame = async () => {
    if (!confirm("Are you sure? This will kick everyone out!")) return;
    // Clear all game data
    await set(ref(db, 'players'), null);
    await set(ref(db, 'gameState'), 'lobby');
    await set(ref(db, 'level1'), null);
    await set(ref(db, 'level2'), null);
    await set(ref(db, 'level3'), null);
    await set(ref(db, 'gift_ratings_finished'), null); // Clear finished status
    
    // Also clear individual player gift suitability if needed (though clearing 'players' does this implicitly for the tree)
    // But we should ensure everything is clean.
    
    // Force local logout
    logout();
  };

  const value = {
    user,
    gameState,
    players,
    isAdmin,
    joinGame,
    logout,
    resetAllGame,
    startGame,
    startLevel1,
    setGameState
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
