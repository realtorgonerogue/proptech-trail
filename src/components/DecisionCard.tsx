'use client';

import { Decision, Choice } from '../engine/types';

interface DecisionCardProps {
  decision: Decision;
  onChoice: (choiceId: string) => void;
}

export default function DecisionCard({ decision, onChoice }: DecisionCardProps) {
  const phaseLabels: Record<number, string> = {
    0: 'CRISIS',
    1: 'FOUNDING',
    2: 'EARLY GROWTH',
    3: 'SCALING',
  };

  const isMicro = decision.isMicroDecision;
  const isSub = decision.isSubDecision;

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-3 animate-fadeIn">
      {/* Phase badge */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-[9px] font-pixel px-2 py-0.5 border ${
          isMicro
            ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10'
            : isSub
            ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10'
            : 'border-green-500 text-green-400 bg-green-500/10'
        }`}>
          {isMicro ? '⚡ QUICK DECISION' : isSub ? '🔗 FOLLOW-UP' : `📋 ${phaseLabels[decision.phase] || 'DECISION'}`}
        </span>
      </div>

      {/* Decision title & description */}
      <div className="bg-gray-900/90 border-2 border-gray-600 p-4 mb-3"
        style={{ imageRendering: 'pixelated' }}>
        <h2 className="font-pixel text-sm text-white mb-2 leading-relaxed">
          {decision.title}
        </h2>
        <p className="text-gray-300 text-sm leading-relaxed">
          {decision.description}
        </p>
      </div>

      {/* Choices */}
      <div className="space-y-2">
        {decision.choices.map((choice: Choice, index: number) => (
          <button
            key={choice.id}
            onClick={() => onChoice(choice.id)}
            className="w-full text-left bg-gray-800/90 hover:bg-gray-700/90 border-2 border-gray-600
              hover:border-green-500 active:border-green-400 active:bg-gray-600/90
              transition-all duration-150 p-3 group cursor-pointer"
            style={{ imageRendering: 'pixelated' }}
          >
            <div className="flex items-start gap-2">
              <span className="font-pixel text-xs text-green-400 mt-0.5 shrink-0">
                {String.fromCharCode(65 + index)}.
              </span>
              <div>
                <span className="font-pixel text-xs text-white group-hover:text-green-300 transition-colors block mb-1">
                  {choice.label}
                </span>
                <span className="text-gray-400 text-xs leading-relaxed block">
                  {choice.description}
                </span>
                {/* Resource preview */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {Object.entries(choice.effects).map(([key, val]) => {
                    if (!val) return null;
                    const labels: Record<string, string> = {
                      cash: 'Cash',
                      revenue: 'Rev',
                      agentRep: 'Agents',
                      consumerTrust: 'Trust',
                      marketShare: 'Share',
                    };
                    return (
                      <span
                        key={key}
                        className={`text-[9px] font-pixel px-1.5 py-0.5 border ${
                          (val as number) > 0
                            ? 'border-green-700 text-green-400 bg-green-900/30'
                            : 'border-red-700 text-red-400 bg-red-900/30'
                        }`}
                      >
                        {(val as number) > 0 ? '+' : ''}{val as number} {labels[key] || key}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
