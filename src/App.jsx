import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Lobby from './pages/Lobby';
import Level1 from './components/levels/Level1_Majority';
import Level2 from './components/levels/Level2_WhoKnowsMe';
import Level3 from './components/levels/Level3_UltimatePassword';
import Result from './components/Result';
import GiftRating from './components/GiftRating';
import { useGame } from './store/gameStore';

function App() {
  const { user, gameState } = useGame();
  const [view, setView] = useState('landing');

  // Sync local view with global game state if user is logged in
  useEffect(() => {
    if (!user) {
      setView('landing');
      return;
    }

    if (user) {
      if (gameState === 'lobby') setView('lobby');
      else if (gameState === 'gift_rating') setView('gift_rating');
      else if (gameState === 'level1') setView('level1');
      else if (gameState === 'level2') setView('level2');
      else if (gameState === 'level3') setView('level3');
      else if (gameState === 'result') setView('result');
    }
  }, [user, gameState]);

  return (
    <Layout>
      {view === 'landing' && (
        <Landing onEnter={() => setView('lobby')} />
      )}
      {view === 'lobby' && (
        <Lobby />
      )}
      {view === 'gift_rating' && (
        <GiftRating />
      )}
      {view === 'level1' && (
        <Level1 />
      )}
      {view === 'level2' && (
        <Level2 />
      )}
      {view === 'level3' && (
        <Level3 />
      )}
      {view === 'result' && (
        <Result />
      )}
    </Layout>
  );
}

export default App;
