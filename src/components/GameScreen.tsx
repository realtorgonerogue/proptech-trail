'use client';

import { useState } from 'react';
import { GameState, Archetype } from '../engine/types';
import ResourceBar from './ResourceBar';
import BuildingView from './BuildingView';
import DecisionCard from './DecisionCard';
import RevealPanel from './RevealPanel';
import ImpactScreen from './ImpactScreen';
import TimePassingScreen from './TimePassingScreen';
import MarketEvent from './MarketEvent';
import EndScreen from './EndScreen';
import TitleScreen from './TitleScreen';
import HelpScreen from './HelpScreen';
import { ARCHETYPES } from '../engine/types';
import { useSound } from '../hooks/useSound';
import { formatDate } from '../hooks/useGameState';

interface GameScreenProps {
  state: GameState;
  selectArchetype: (archetype: Archetype) => void;
  startGame: () => void;
  makeChoice: (choiceId: string) => void;
  dismissReveal: () => void;
  dismissImpact: () => void;
  dismissTimePassing: () => void;
  dismissEvent: (responseIndex: number) => void;
  goToEndscreen: () => void;
  restart: () => void;
  toggleSound: () => void;
}

export default function GameScreen({
  state,
  selectArchetype,
  startGame,
  makeChoice,
  dismissReveal,
  dismissImpact,
  dismissTimePassing,
  dismissEvent,
  restart,
  toggleSound,
}: GameScreenProps) {
  const { play } = useSound(state.soundEnabled);
  const [showHelp, setShowHelp] = useState(false);

  const handleChoice = (choiceId: string) => {
    play('click');
    makeChoice(choiceId);
  };

  const handleDismissReveal = () => {
    if (state.lastChoiceEffects) {
      const hasPositive = Object.values(state.lastChoiceEffects).some((v) => v && (v as number) > 0);
      play(hasPositive ? 'positive' : 'negative');
    }
    dismissReveal();
  };

  const handleDismissImpact = () => {
    dismissImpact();
  };

  const handleDismissTimePassing = () => {
    play('click');
    dismissTimePassing();
  };

  const handleDismissEvent = (responseIndex: number) => {
    play('event');
    dismissEvent(responseIndex);
  };

  // Title / Archetype selection
  if (state.phase === 'title' || state.phase === 'archetype_select') {
    const selected = state.archetype
      ? ARCHETYPES.find((a) => a.id === state.archetype)
      : null;

    return (
      <TitleScreen
        onSelectArchetype={(arch) => {
          play('click');
          selectArchetype(arch);
        }}
        selectedArchetype={state.archetype}
        onStart={() => {
          play('levelup');
          startGame();
        }}
        startingResources={selected?.startingResources || null}
      />
    );
  }

  // Game Over / Endscreen
  if (state.phase === 'game_over' || state.phase === 'endscreen') {
    return <EndScreen state={state} onRestart={restart} />;
  }

  // Main game view
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Top-right controls */}
      <div className="fixed top-2 right-2 z-40 flex gap-1.5">
        <button
          onClick={() => setShowHelp(true)}
          className="bg-gray-800 hover:bg-gray-700 border-2 border-green-600 hover:border-green-500
            text-green-400 font-pixel text-xs w-8 h-8 flex items-center justify-center
            cursor-pointer transition-colors"
          title="How to Play"
        >
          ?
        </button>
        <button
          onClick={toggleSound}
          className="bg-gray-800 border border-gray-600 px-2 py-1 text-xs
            cursor-pointer hover:bg-gray-700 transition-colors w-8 h-8 flex items-center justify-center"
          title={state.soundEnabled ? 'Mute' : 'Unmute'}
        >
          {state.soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      {showHelp && <HelpScreen onClose={() => setShowHelp(false)} />}

      {/* Resource HUD */}
      <ResourceBar state={state} />

      {/* Date display */}
      <div className="bg-gray-900 border-b border-gray-800 px-3 py-1 flex items-center justify-between">
        <span className="text-[10px] font-pixel text-gray-400">
          📅 {formatDate(state.month, state.year)}
        </span>
        <span className="text-[10px] font-pixel text-gray-500">
          {state.round <= 4 ? 'FOUNDING' :
           state.round <= 9 ? 'EARLY GROWTH' : 'SCALING'}
        </span>
      </div>

      {/* Building view */}
      <BuildingView state={state} />

      {/* Status indicators are now inside BuildingView */}

      {/* Decision area */}
      <div className="flex-1 overflow-y-auto pb-6">
        {state.currentDecision && state.phase === 'playing' && (
          <DecisionCard
            decision={state.currentDecision}
            onChoice={handleChoice}
          />
        )}

        {state.currentDecision && state.phase === 'debt_decision' && (
          <DecisionCard
            decision={state.currentDecision}
            onChoice={handleChoice}
          />
        )}
      </div>

      {/* Reveal panel overlay */}
      {state.phase === 'reveal' && state.lastChoice && state.lastChoiceEffects && (
        <RevealPanel
          choice={state.lastChoice}
          effects={state.lastChoiceEffects}
          onContinue={handleDismissReveal}
        />
      )}

      {/* Impact screen overlay */}
      {state.phase === 'impact' && (
        <ImpactScreen
          state={state}
          onContinue={handleDismissImpact}
        />
      )}

      {/* Time passing screen overlay */}
      {state.phase === 'time_passing' && (
        <TimePassingScreen
          state={state}
          onComplete={handleDismissTimePassing}
        />
      )}

      {/* Market event overlay */}
      {state.phase === 'market_event' && state.currentMarketEvent && (
        <MarketEvent
          event={state.currentMarketEvent}
          onRespond={handleDismissEvent}
        />
      )}
    </div>
  );
}
