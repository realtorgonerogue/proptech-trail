'use client';

import { MarketEvent as MarketEventType, ResourceEffects } from '../engine/types';

interface MarketEventProps {
  event: MarketEventType;
  onRespond: (responseIndex: number) => void;
}

const LABELS: Record<string, string> = {
  cash: 'Cash',
  revenue: 'Revenue',
  agentRep: 'Agent Rep',
  consumerTrust: 'Trust',
  marketShare: 'Share',
};

function EffectBadges({ effects }: { effects: ResourceEffects }) {
  return (
    <div className="flex flex-wrap gap-1.5 justify-center">
      {Object.entries(effects).map(([key, val]) => {
        if (!val) return null;
        const isPositive = (val as number) > 0;
        return (
          <span
            key={key}
            className={`font-pixel text-[9px] px-1.5 py-0.5 border ${
              isPositive
                ? 'border-green-700 text-green-400 bg-green-900/30'
                : 'border-red-700 text-red-400 bg-red-900/30'
            }`}
          >
            {isPositive ? '+' : ''}{val as number} {LABELS[key] || key}
          </span>
        );
      })}
    </div>
  );
}

export default function MarketEvent({ event, onRespond }: MarketEventProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/85" />

      {/* Event card */}
      <div className="relative w-full max-w-md mx-4 animate-shakeIn">
        {/* Header */}
        <div className={`px-4 py-2 font-pixel text-xs text-center border-2 border-b-0 ${
          event.isNegative
            ? 'bg-red-900 border-red-500 text-red-300'
            : 'bg-green-900 border-green-500 text-green-300'
        }`}>
          {event.isNegative ? '⚠️ MARKET EVENT' : '📰 MARKET EVENT'}
        </div>

        {/* Body */}
        <div className="bg-gray-900 border-2 border-gray-600 border-t-0 px-4 py-4">
          <h3 className="font-pixel text-sm text-white mb-2 text-center leading-relaxed">
            {event.name}
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed text-center mb-3">
            {event.description}
          </p>

          {/* Base effects — these hit no matter what */}
          {Object.values(event.effects).some(v => v !== 0) && (
            <div className="mb-4">
              <p className="text-[9px] font-pixel text-gray-500 text-center mb-1.5">
                IMMEDIATE IMPACT
              </p>
              <EffectBadges effects={event.effects} />
            </div>
          )}

          {/* Response choices */}
          <p className="text-[9px] font-pixel text-gray-400 text-center mb-2">
            HOW DO YOU RESPOND?
          </p>

          <div className="space-y-2">
            {event.responses.map((response, i) => (
              <button
                key={i}
                onClick={() => onRespond(i)}
                className="w-full text-left bg-gray-800 hover:bg-gray-700 active:bg-gray-600
                  border-2 border-gray-600 hover:border-gray-500 p-3
                  transition-all cursor-pointer"
              >
                <div className="font-pixel text-[10px] text-white mb-1">
                  {response.label}
                </div>
                <div className="text-gray-400 text-xs mb-2 leading-relaxed">
                  {response.description}
                </div>
                <EffectBadges effects={response.effects} />
              </button>
            ))}
          </div>

          <p className="text-gray-600 text-[9px] font-pixel text-center mt-3">
            Source: {event.source}
          </p>
        </div>
      </div>
    </div>
  );
}
