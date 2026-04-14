'use client';

import { useState, useEffect } from 'react';
import { GameState } from '../engine/types';
import { formatDate } from '../hooks/useGameState';

interface TimePassingScreenProps {
  state: GameState;
  onComplete: () => void;
}

// Flavor text for time passing — varies by phase and conditions
function getTimePassingFlavor(state: GameState): string[] {
  const { round, marketCondition, flexRisk, debt, adjacencies, resources } = state;
  const lines: string[] = [];

  // Phase-based flavor
  if (round <= 4) {
    const founding = [
      'Your founding team burns the midnight oil...',
      'First hires walk through the door...',
      'The business plan gets its first real test...',
      'Coffee-fueled nights in the garage...',
      'Your first pitch deck goes out...',
    ];
    lines.push(founding[Math.floor(Math.random() * founding.length)]);
  } else if (round <= 9) {
    const growth = [
      'The team is growing. Growing pains too...',
      'Your first real competitors take notice...',
      'Revenue is trickling in. Not enough, but it\'s real...',
      'The market starts to learn your name...',
      'Board meetings get more intense...',
    ];
    lines.push(growth[Math.floor(Math.random() * growth.length)]);
  } else {
    const scaling = [
      'Scale brings complexity. Complexity brings cost...',
      'What worked at 10 people breaks at 100...',
      'Your competitors are watching every move...',
      'The industry press writes about you now...',
      'Survival mode. Every dollar counts...',
      'The market doesn\'t care about your vision...',
      'The runway gets shorter with every decision...',
      'Only the focused survive this phase...',
    ];
    lines.push(scaling[Math.floor(Math.random() * scaling.length)]);
  }

  // Condition-based flavor
  if (marketCondition === 'downturn') {
    lines.push('The market continues to cool...');
  } else if (marketCondition === 'boom') {
    lines.push('The market is running hot...');
  }

  if (flexRisk && marketCondition === 'downturn') {
    lines.push('Payroll hits different when deals aren\'t closing...');
  }

  if (debt > 0) {
    lines.push('Debt service payments go out like clockwork...');
  }

  if (adjacencies.length >= 2) {
    lines.push('Juggling multiple business lines stretches leadership thin...');
  }

  if (resources.cash < 30) {
    lines.push('The bank balance keeps you up at night...');
  }

  if (resources.agentRep < 20) {
    lines.push('Agent chatter about your company isn\'t great...');
  }

  return lines.slice(0, 3); // Max 3 lines
}

export default function TimePassingScreen({ state, onComplete }: TimePassingScreenProps) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showContinue, setShowContinue] = useState(false);
  const flavorLines = getTimePassingFlavor(state);

  const isMicro = state.currentDecision?.isMicroDecision || false;
  const monthsAdvancing = isMicro ? 1 : (state.round <= 4 ? 3 : state.round <= 9 ? 3 : 4);

  // Animate lines appearing one by one
  useEffect(() => {
    if (visibleLines < flavorLines.length) {
      const timer = setTimeout(() => setVisibleLines((v) => v + 1), 800);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setShowContinue(true), 600);
      return () => clearTimeout(timer);
    }
  }, [visibleLines, flavorLines.length]);

  // Compute what the date will be after advancing
  let newMonth = state.month + monthsAdvancing;
  let newYear = state.year;
  while (newMonth > 12) {
    newMonth -= 12;
    newYear++;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <div className="w-full max-w-md mx-4 text-center">
        {/* Calendar advancing */}
        <div className="mb-8">
          <div className="text-gray-500 text-[10px] font-pixel mb-2">
            {formatDate(state.month, state.year)}
          </div>

          {/* Arrow / months passing animation */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="text-gray-600 text-sm">📅</div>
            <div className="flex gap-1">
              {Array.from({ length: monthsAdvancing }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-green-500 animate-pulse"
                  style={{ animationDelay: `${i * 200}ms` }}
                />
              ))}
            </div>
            <div className="text-white text-sm">📅</div>
          </div>

          <div className="font-pixel text-lg text-white animate-fadeIn">
            {formatDate(newMonth, newYear)}
          </div>
          <div className="text-gray-500 text-[10px] font-pixel mt-1">
            {monthsAdvancing} {monthsAdvancing === 1 ? 'month' : 'months'} pass...
          </div>
        </div>

        {/* Phase indicator */}
        <div className="mb-6">
          <span className={`text-[9px] font-pixel px-2 py-1 border ${
            state.round <= 4 ? 'border-blue-600 text-blue-400' :
            state.round <= 9 ? 'border-green-600 text-green-400' :
            'border-yellow-600 text-yellow-400'
          }`}>
            {state.round <= 4 ? 'FOUNDING' :
             state.round <= 9 ? 'EARLY GROWTH' : 'SCALING'} — ROUND {state.round}
          </span>
        </div>

        {/* Flavor text lines appearing one by one */}
        <div className="space-y-3 mb-8 min-h-[80px]">
          {flavorLines.map((line, i) => (
            <p
              key={i}
              className={`text-gray-400 text-sm italic leading-relaxed transition-all duration-500 ${
                i < visibleLines ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}
            >
              {line}
            </p>
          ))}
        </div>

        {/* Continue button */}
        {showContinue && (
          <button
            onClick={onComplete}
            className="bg-gray-800 hover:bg-gray-700 active:bg-gray-600
              text-white font-pixel text-xs py-3 px-8 border-2 border-gray-600
              transition-all cursor-pointer animate-fadeIn"
          >
            CONTINUE →
          </button>
        )}
      </div>
    </div>
  );
}
