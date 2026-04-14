'use client';

import GameScreen from '../components/GameScreen';
import { useGameState } from '../hooks/useGameState';

export default function Home() {
  const {
    state,
    selectArchetype,
    startGame,
    makeChoice,
    dismissReveal,
    dismissImpact,
    dismissTimePassing,
    dismissEvent,
    goToEndscreen,
    restart,
    toggleSound,
  } = useGameState();

  return (
    <main className="flex-1">
      <GameScreen
        state={state}
        selectArchetype={selectArchetype}
        startGame={startGame}
        makeChoice={makeChoice}
        dismissReveal={dismissReveal}
        dismissImpact={dismissImpact}
        dismissTimePassing={dismissTimePassing}
        dismissEvent={dismissEvent}
        goToEndscreen={goToEndscreen}
        restart={restart}
        toggleSound={toggleSound}
      />
    </main>
  );
}
