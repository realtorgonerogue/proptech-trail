'use client';

import { Resources, GameState } from '../engine/types';
import { calculateNetCashFlow } from '../engine/resourceSystem';

interface ResourceBarProps {
  state: GameState;
}

const RESOURCE_CONFIG = [
  { key: 'cash' as keyof Resources, label: 'CASH', icon: '💰', color: 'bg-yellow-500', max: 200 },
  { key: 'revenue' as keyof Resources, label: 'REV', icon: '📈', color: 'bg-green-500', max: 100 },
  { key: 'agentRep' as keyof Resources, label: 'AGENTS', icon: '🤝', color: 'bg-blue-500', max: 100 },
  { key: 'consumerTrust' as keyof Resources, label: 'TRUST', icon: '❤️', color: 'bg-red-500', max: 100 },
  { key: 'marketShare' as keyof Resources, label: 'SHARE', icon: '🏆', color: 'bg-purple-500', max: 100 },
];

export default function ResourceBar({ state }: ResourceBarProps) {
  const { resources, round, debt } = state;
  const netCashFlow = calculateNetCashFlow(state);

  return (
    <div className="w-full bg-gray-900 border-b-4 border-gray-700 px-3 py-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-pixel text-green-400">
          ROUND {round}
        </span>
        <span className="text-[10px] font-pixel text-gray-400">
          {state.archetype?.toUpperCase()}
        </span>
        {debt > 0 && (
          <span className="text-[10px] font-pixel text-red-400 animate-pulse">
            ⚠ DEBT: ${debt}M
          </span>
        )}
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {RESOURCE_CONFIG.map(({ key, label, icon, color, max }) => {
          const value = resources[key];
          const pct = Math.min(100, (value / max) * 100);
          const isLow = (key === 'agentRep' || key === 'consumerTrust') && value < 25;
          const isCashLow = key === 'cash' && value < 30;
          const isDanger = (key === 'agentRep' || key === 'consumerTrust') && value < 15;
          const isCashDanger = key === 'cash' && value < 15;

          return (
            <div key={key} className="flex flex-col items-center">
              <div className="flex items-center gap-0.5 mb-0.5">
                <span className="text-xs">{icon}</span>
                <span className={`text-[8px] font-pixel ${
                  isDanger || isCashDanger ? 'text-red-500 animate-pulse' :
                  isLow || isCashLow ? 'text-yellow-400' : 'text-gray-300'
                }`}>
                  {label}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-800 border border-gray-600 relative"
                style={{ imageRendering: 'pixelated' }}>
                <div
                  className={`h-full transition-all duration-500 ${
                    isDanger || isCashDanger ? 'bg-red-600 animate-pulse' :
                    isLow || isCashLow ? 'bg-yellow-500' : color
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className={`text-[9px] font-pixel mt-0.5 ${
                isDanger || isCashDanger ? 'text-red-500' :
                isLow || isCashLow ? 'text-yellow-400' : 'text-white'
              }`}>
                {value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
