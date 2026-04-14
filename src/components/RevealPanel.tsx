'use client';

import { useState } from 'react';
import { Choice, ResourceEffects } from '../engine/types';

interface RevealPanelProps {
  choice: Choice;
  effects: ResourceEffects;
  onContinue: () => void;
}

export default function RevealPanel({ choice, effects, onContinue }: RevealPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const labels: Record<string, string> = {
    cash: 'Cash',
    revenue: 'Revenue',
    agentRep: 'Agent Rep',
    consumerTrust: 'Consumer Trust',
    marketShare: 'Market Share',
  };

  // Split reveal text: first 2 sentences visible, rest expandable
  const sentences = choice.revealText.split(/(?<=[.!?])\s+/);
  const visibleText = sentences.slice(0, 2).join(' ');
  const expandedText = sentences.slice(2).join(' ');

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center animate-slideUp">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onContinue} />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-gray-900 border-t-4 border-green-500 px-4 pt-4 pb-6 mx-2 mb-2 rounded-t-lg"
        style={{ maxHeight: '80vh', overflow: 'auto' }}>

        {/* Resource changes */}
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          {Object.entries(effects).map(([key, val]) => {
            if (!val) return null;
            const isPositive = (val as number) > 0;
            return (
              <div
                key={key}
                className={`font-pixel text-sm px-3 py-1.5 border-2 animate-bounceIn ${
                  isPositive
                    ? 'border-green-500 text-green-400 bg-green-900/30'
                    : 'border-red-500 text-red-400 bg-red-900/30'
                }`}
              >
                {isPositive ? '▲' : '▼'} {isPositive ? '+' : ''}{val as number} {labels[key] || key}
              </div>
            );
          })}
        </div>

        {/* Choice label */}
        <div className="font-pixel text-xs text-green-400 mb-2">
          You chose: {choice.label}
        </div>

        {/* Reveal text */}
        <div className="bg-gray-800 border border-gray-700 p-3 mb-3">
          <p className="text-gray-200 text-sm leading-relaxed italic">
            &ldquo;{visibleText}&rdquo;
          </p>
          {expandedText && (
            <>
              {expanded && (
                <p className="text-gray-300 text-sm leading-relaxed italic mt-2">
                  {expandedText}
                </p>
              )}
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-green-400 text-xs font-pixel mt-2 hover:text-green-300"
              >
                {expanded ? '▲ Less' : '▼ Read more'}
              </button>
            </>
          )}
        </div>

        {/* Source attribution */}
        <p className="text-gray-500 text-[10px] font-pixel mb-4">
          📎 From Context Podcast: {choice.revealSource}
        </p>

        {/* Continue button */}
        <button
          onClick={onContinue}
          className="w-full bg-green-700 hover:bg-green-600 active:bg-green-500
            text-white font-pixel text-sm py-3 border-2 border-green-500
            transition-colors cursor-pointer"
        >
          CONTINUE →
        </button>
      </div>
    </div>
  );
}
