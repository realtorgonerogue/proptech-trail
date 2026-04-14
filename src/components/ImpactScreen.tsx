'use client';

import { Resources, GameState } from '../engine/types';
import { calculateNetCashFlow } from '../engine/resourceSystem';

interface ImpactScreenProps {
  state: GameState;
  onContinue: () => void;
}

const RESOURCE_META = [
  { key: 'cash' as keyof Resources, label: 'Cash', icon: '💰', unit: '$M' },
  { key: 'revenue' as keyof Resources, label: 'Revenue', icon: '📈', unit: '' },
  { key: 'agentRep' as keyof Resources, label: 'Agent Rep', icon: '🤝', unit: '' },
  { key: 'consumerTrust' as keyof Resources, label: 'Consumer Trust', icon: '❤️', unit: '' },
  { key: 'marketShare' as keyof Resources, label: 'Market Share', icon: '🏆', unit: '%' },
];

export default function ImpactScreen({ state, onContinue }: ImpactScreenProps) {
  const { resources, previousResources, lastChoice } = state;
  const prev = previousResources || resources;
  const netFlow = calculateNetCashFlow(state);

  // Determine overall sentiment
  const totalDelta = RESOURCE_META.reduce((sum, { key }) => {
    return sum + (resources[key] - prev[key]);
  }, 0);
  const sentiment = totalDelta > 5 ? 'positive' : totalDelta < -5 ? 'negative' : 'neutral';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 animate-fadeIn">
      <div className="w-full max-w-md mx-4">
        {/* Header */}
        <div className={`text-center mb-4 font-pixel text-sm ${
          sentiment === 'positive' ? 'text-green-400' :
          sentiment === 'negative' ? 'text-red-400' : 'text-yellow-400'
        }`}>
          {sentiment === 'positive' ? '📈 DECISION IMPACT' :
           sentiment === 'negative' ? '📉 DECISION IMPACT' : '📊 DECISION IMPACT'}
        </div>

        {/* Choice reminder */}
        {lastChoice && (
          <div className="text-center mb-4">
            <span className="text-gray-500 text-xs">You chose:</span>
            <span className="text-white text-sm font-pixel ml-2">{lastChoice.label}</span>
          </div>
        )}

        {/* Before / After comparison */}
        <div className="bg-gray-900 border-2 border-gray-700 mb-4">
          {/* Column headers */}
          <div className="grid grid-cols-4 gap-0 border-b border-gray-700 px-3 py-2">
            <div className="text-[9px] font-pixel text-gray-500 col-span-1">RESOURCE</div>
            <div className="text-[9px] font-pixel text-gray-500 text-center">BEFORE</div>
            <div className="text-[9px] font-pixel text-gray-500 text-center">AFTER</div>
            <div className="text-[9px] font-pixel text-gray-500 text-right">CHANGE</div>
          </div>

          {RESOURCE_META.map(({ key, label, icon }) => {
            const before = prev[key];
            const after = resources[key];
            const delta = after - before;
            const hasChange = delta !== 0;

            return (
              <div
                key={key}
                className={`grid grid-cols-4 gap-0 px-3 py-2.5 border-b border-gray-800 last:border-0 ${
                  hasChange ? '' : 'opacity-40'
                }`}
              >
                <div className="flex items-center gap-1.5 col-span-1">
                  <span className="text-sm">{icon}</span>
                  <span className="text-[10px] font-pixel text-gray-300">{label}</span>
                </div>
                <div className="text-center text-sm font-pixel text-gray-400">
                  {before}
                </div>
                <div className={`text-center text-sm font-pixel ${
                  delta > 0 ? 'text-green-400' : delta < 0 ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {after}
                </div>
                <div className={`text-right text-sm font-pixel font-bold ${
                  delta > 0 ? 'text-green-400' : delta < 0 ? 'text-red-400' : 'text-gray-600'
                }`}>
                  {delta > 0 ? `+${delta}` : delta === 0 ? '—' : `${delta}`}
                </div>
              </div>
            );
          })}
        </div>

        {/* Burn rate warning */}
        <div className="bg-gray-900/80 border border-gray-700 px-3 py-2.5 mb-4 flex items-center justify-between">
          <span className="text-[9px] font-pixel text-gray-400">BURN RATE</span>
          <span className={`text-xs font-pixel ${netFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {netFlow >= 0 ? '+' : ''}{netFlow} cash/round
          </span>
        </div>

        {/* Status warnings */}
        {(resources.cash < 30 || resources.agentRep < 25 || resources.consumerTrust < 25) && (
          <div className="mb-4 space-y-1">
            {resources.cash < 30 && (
              <div className="text-[10px] font-pixel text-yellow-400 bg-yellow-900/20 border border-yellow-800 px-2 py-1.5 flex items-center gap-2">
                <span>⚠️</span> Cash is getting low. Watch your burn rate.
              </div>
            )}
            {resources.agentRep < 25 && (
              <div className="text-[10px] font-pixel text-yellow-400 bg-yellow-900/20 border border-yellow-800 px-2 py-1.5 flex items-center gap-2">
                <span>⚠️</span> Agents are losing faith. Revenue will suffer.
              </div>
            )}
            {resources.consumerTrust < 25 && (
              <div className="text-[10px] font-pixel text-yellow-400 bg-yellow-900/20 border border-yellow-800 px-2 py-1.5 flex items-center gap-2">
                <span>⚠️</span> Consumer trust is fading. Leads are drying up.
              </div>
            )}
          </div>
        )}

        {/* Continue */}
        <button
          onClick={onContinue}
          className="w-full bg-gray-800 hover:bg-gray-700 active:bg-gray-600
            text-white font-pixel text-xs py-3 border-2 border-gray-600
            transition-colors cursor-pointer"
        >
          TIME PASSES... →
        </button>
      </div>
    </div>
  );
}
