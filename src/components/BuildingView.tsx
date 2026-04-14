'use client';

import { GameState, MarketCondition } from '../engine/types';
import { calculateNetCashFlow } from '../engine/resourceSystem';

interface BuildingViewProps {
  state: GameState;
}

// Each building is a grid of colored pixels
type PixelGrid = number[][];

const COLORS: Record<number, string> = {
  0: 'transparent',
  1: '#4a5568',  // wall gray
  2: '#63b3ed',  // window light blue
  3: '#2b6cb0',  // window dark blue
  4: '#975a16',  // door brown
  5: '#e53e3e',  // roof red
  6: '#718096',  // rubble gray
  7: '#ed8936',  // accent orange
  8: '#2d3748',  // dark wall
};

const GARAGE: PixelGrid = [
  [0,0,0,0,5,5,5,5,5,5,0,0,0,0],
  [0,0,0,5,5,5,5,5,5,5,5,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,1,2,3,1,1,2,3,1,0,0,0],
  [0,0,0,1,3,2,1,1,3,2,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,1,1,4,4,4,4,1,1,0,0,0],
  [0,0,0,1,1,4,4,4,4,1,1,0,0,0],
];

const SMALL_OFFICE: PixelGrid = [
  [0,0,0,5,5,5,5,5,5,5,5,5,5,0,0,0],
  [0,0,5,5,5,5,5,5,5,5,5,5,5,5,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,2,3,1,2,3,1,2,3,1,2,3,0,0],
  [0,0,1,3,2,1,3,2,1,3,2,1,3,2,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,2,3,1,1,4,4,1,1,2,3,1,0,0],
  [0,0,1,3,2,1,1,4,4,1,1,3,2,1,0,0],
  [0,0,8,8,8,8,8,8,8,8,8,8,8,8,0,0],
];

const MID_RISE: PixelGrid = [
  [0,0,0,0,5,5,5,5,5,5,5,5,0,0,0,0],
  [0,0,0,5,1,1,1,1,1,1,1,1,5,0,0,0],
  [0,0,0,1,2,3,1,1,1,2,3,1,1,0,0,0],
  [0,0,0,1,3,2,1,1,1,3,2,1,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,1,2,3,1,1,1,2,3,1,1,0,0,0],
  [0,0,0,1,3,2,1,1,1,3,2,1,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,1,2,3,1,4,4,1,2,3,1,0,0,0],
  [0,0,0,1,3,2,1,4,4,1,3,2,1,0,0,0],
  [0,0,8,8,8,8,8,8,8,8,8,8,8,8,0,0],
];

const TOWER: PixelGrid = [
  [0,0,0,0,0,7,7,7,7,0,0,0,0,0],
  [0,0,0,0,5,5,5,5,5,5,0,0,0,0],
  [0,0,0,0,1,2,3,2,3,1,0,0,0,0],
  [0,0,0,0,1,3,2,3,2,1,0,0,0,0],
  [0,0,0,0,1,2,3,2,3,1,0,0,0,0],
  [0,0,0,0,1,3,2,3,2,1,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0],
  [0,0,0,1,1,2,3,2,3,1,1,0,0,0],
  [0,0,0,1,1,3,2,3,2,1,1,0,0,0],
  [0,0,0,1,1,2,3,2,3,1,1,0,0,0],
  [0,0,0,1,1,3,2,3,2,1,1,0,0,0],
  [0,0,0,1,1,1,4,4,1,1,1,0,0,0],
  [0,0,8,8,8,8,8,8,8,8,8,8,0,0],
];

const CAMPUS: PixelGrid = [
  [0,0,0,0,0,7,7,7,7,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,5,5,5,5,5,5,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,2,3,2,3,1,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,3,2,3,2,1,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,2,3,2,3,1,0,0,5,5,5,5,0,0],
  [0,0,0,1,1,3,2,3,2,1,1,0,1,2,3,1,0,0],
  [0,0,0,1,1,2,3,2,3,1,1,0,1,3,2,1,0,0],
  [0,0,0,1,1,3,2,3,2,1,1,0,1,2,3,1,0,0],
  [0,0,0,1,1,1,4,4,1,1,1,0,1,1,4,1,0,0],
  [0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0],
];

const RUBBLE: PixelGrid = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,6,0,0,0,0,0,0,0],
  [0,0,0,0,0,6,6,6,0,0,0,0,0,0],
  [0,0,0,6,0,6,1,6,0,6,0,0,0,0],
  [0,0,6,6,6,6,6,6,6,6,6,0,0,0],
  [0,6,6,1,6,6,6,6,6,1,6,6,0,0],
  [0,6,6,6,6,6,6,6,6,6,6,6,0,0],
];

const STRUGGLING: PixelGrid = [
  [0,0,0,0,5,5,5,5,5,5,0,0,0,0],
  [0,0,0,5,5,5,5,5,5,5,5,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,1,8,8,1,1,8,8,1,0,0,0],
  [0,0,0,1,8,8,1,1,8,8,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,1,1,4,4,4,4,1,1,0,0,0],
  [0,0,0,1,1,4,4,4,4,1,1,0,0,0],
];

function getBuildingStage(marketShare: number, cash: number, gameOver: boolean): {
  grid: PixelGrid;
  label: string;
  pixelSize: number;
} {
  if (gameOver) return { grid: RUBBLE, label: 'Rubble', pixelSize: 6 };
  if (cash < 15) return { grid: STRUGGLING, label: 'Struggling', pixelSize: 5 };
  if (marketShare >= 20) return { grid: CAMPUS, label: 'Campus', pixelSize: 4 };
  if (marketShare >= 14) return { grid: TOWER, label: 'Tower', pixelSize: 4 };
  if (marketShare >= 9) return { grid: MID_RISE, label: 'Mid-Rise', pixelSize: 5 };
  if (marketShare >= 5) return { grid: SMALL_OFFICE, label: 'Small Office', pixelSize: 5 };
  return { grid: GARAGE, label: 'Garage', pixelSize: 6 };
}

function getMarketConditionDisplay(condition: MarketCondition): {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
} {
  switch (condition) {
    case 'boom':
      return { label: 'BULL MARKET', color: 'text-green-400', bgColor: 'bg-green-900/40 border-green-700', icon: '📈' };
    case 'downturn':
      return { label: 'BEAR MARKET', color: 'text-red-400', bgColor: 'bg-red-900/40 border-red-700', icon: '📉' };
    default:
      return { label: 'STABLE MARKET', color: 'text-gray-400', bgColor: 'bg-gray-800/40 border-gray-700', icon: '➡️' };
  }
}

function PixelBuilding({ grid, pixelSize }: { grid: PixelGrid; pixelSize: number }) {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  return (
    <div
      className="relative"
      style={{
        width: cols * pixelSize,
        height: rows * pixelSize,
        imageRendering: 'pixelated',
      }}
    >
      {grid.map((row, y) =>
        row.map((cell, x) => {
          if (cell === 0) return null;
          const color = COLORS[cell] || COLORS[1];
          return (
            <div
              key={`${y}-${x}`}
              className="absolute"
              style={{
                left: x * pixelSize,
                top: y * pixelSize,
                width: pixelSize,
                height: pixelSize,
                backgroundColor: color,
              }}
            />
          );
        })
      )}
    </div>
  );
}

export default function BuildingView({ state }: BuildingViewProps) {
  const { resources, marketCondition } = state;
  const building = getBuildingStage(
    resources.marketShare,
    resources.cash,
    state.phase === 'game_over'
  );
  const market = getMarketConditionDisplay(marketCondition);
  const netFlow = calculateNetCashFlow(state);

  return (
    <div className="w-full bg-gray-900 relative">
      {/* Top section: Building + market info side by side */}
      <div className="flex items-end justify-center gap-6 px-4 pt-3 pb-0">

        {/* Left: Company info */}
        <div className="flex flex-col items-start gap-1.5 pb-2 min-w-[100px]">
          <span className="text-[9px] font-pixel text-gray-500">HQ</span>
          <span className="text-[10px] font-pixel text-white">{building.label}</span>
          <div className={`text-[9px] font-pixel px-1.5 py-0.5 border ${market.bgColor} ${market.color}`}>
            {market.icon} {market.label}
          </div>
        </div>

        {/* Center: Building */}
        <div className="flex flex-col items-center">
          <div className="drop-shadow-lg">
            <PixelBuilding grid={building.grid} pixelSize={building.pixelSize} />
          </div>
        </div>

        {/* Right: Financial summary */}
        <div className="flex flex-col items-end gap-1 pb-2 min-w-[100px]">
          <span className="text-[9px] font-pixel text-gray-500">CASH FLOW</span>
          <span className={`text-sm font-pixel ${netFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {netFlow >= 0 ? '+' : ''}{netFlow}/rd
          </span>
          {state.debt > 0 && (
            <span className="text-[9px] font-pixel text-red-400 animate-pulse">
              💀 DEBT: ${state.debt}M
            </span>
          )}
          {state.adjacencies.length > 0 && (
            <span className="text-[9px] font-pixel text-cyan-400">
              🔗 {state.adjacencies.length} business lines
            </span>
          )}
        </div>
      </div>

      {/* Ground strip */}
      <div className="w-full h-2 bg-gradient-to-r from-green-800 via-green-600 to-green-800" />

      {/* Status flags row */}
      {(state.ventureClockRounds !== null || state.quarterlyPressure || state.flexRisk) && (
        <div className="flex gap-2 px-3 py-1.5 bg-gray-950 border-t border-gray-800 flex-wrap justify-center">
          {state.ventureClockRounds !== null && (
            <span className={`text-[9px] font-pixel px-1.5 py-0.5 border ${
              state.ventureClockRounds <= 3
                ? 'border-red-500 text-red-400 animate-pulse'
                : 'border-yellow-600 text-yellow-400'
            }`}>
              ⏰ VC Clock: {state.ventureClockRounds} rounds
            </span>
          )}
          {state.quarterlyPressure && (
            <span className="text-[9px] font-pixel px-1.5 py-0.5 border border-purple-600 text-purple-400">
              📊 Public Company
            </span>
          )}
          {state.flexRisk && (
            <span className="text-[9px] font-pixel px-1.5 py-0.5 border border-orange-600 text-orange-400">
              👥 W-2 Payroll
            </span>
          )}
        </div>
      )}
    </div>
  );
}
