'use client';

import { GameState } from '../engine/types';
import { generateCompanyReport } from '../engine/scoring';
import { formatDate } from '../hooks/useGameState';
import { useCallback, useRef } from 'react';

interface EndScreenProps {
  state: GameState;
  onRestart: () => void;
}

export default function EndScreen({ state, onRestart }: EndScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const report = generateCompanyReport(state);

  const archNames: Record<string, string> = {
    portal: 'The Portal Play',
    brokerage: 'The Brokerage Disruptor',
    fintech: 'The FinTech Outsider',
    infrastructure: 'The Infrastructure Builder',
  };

  const downloadShareCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw share card
    canvas.width = 600;
    canvas.height = 400;

    // Background
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, 600, 400);

    // Border
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, 584, 384);

    // Title
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('THE PROPTECH TRAIL', 300, 45);

    // Archetype
    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px monospace';
    ctx.fillText(archNames[state.archetype || 'portal'] || 'Unknown', 300, 70);

    // Score
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 48px monospace';
    ctx.fillText(`${state.score || 0}`, 300, 140);

    ctx.fillStyle = '#d1d5db';
    ctx.font = '12px monospace';
    ctx.fillText('POINTS', 300, 160);

    // Title
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`"${state.leaderboardTitle || 'Unknown'}"`, 300, 195);

    // Stats
    ctx.textAlign = 'left';
    ctx.fillStyle = '#9ca3af';
    ctx.font = '13px monospace';
    const stats = [
      `Rounds Survived: ${state.round}`,
      `Market Share: ${state.resources.marketShare}`,
      `Final Cash: $${state.resources.cash}M`,
      `Adjacencies: ${state.adjacencies.length === 0 ? 'Focused' : state.adjacencies.join(', ')}`,
    ];
    stats.forEach((s, i) => {
      ctx.fillText(s, 40, 240 + i * 24);
    });

    // Game over reason
    ctx.fillStyle = '#ef4444';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(state.gameOverReason || '', 300, 350);

    // Attribution
    ctx.fillStyle = '#4b5563';
    ctx.font = '10px monospace';
    ctx.fillText('Based on Mike DelPrete\'s Context podcast • mikedp.com', 300, 380);

    // Download
    const link = document.createElement('a');
    link.download = 'proptech-trail-scorecard.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [state]);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center px-4 py-6">
      {/* Game Over header */}
      <div className="text-center mb-6">
        <h1 className="font-pixel text-xl text-red-400 mb-2 animate-pulse">
          {state.gameOverReason === 'Company matured — the journey is complete'
            ? 'JOURNEY COMPLETE'
            : 'GAME OVER'}
        </h1>
        <p className="text-gray-400 text-sm">{state.gameOverReason}</p>
      </div>

      {/* Score */}
      <div className="bg-gray-900 border-2 border-green-500 p-6 mb-4 w-full max-w-md text-center">
        <div className="text-6xl font-pixel text-yellow-400 mb-2 animate-bounceIn">
          {state.score || 0}
        </div>
        <div className="text-gray-400 font-pixel text-xs mb-3">FINAL SCORE</div>
        <div className="font-pixel text-sm text-green-400 mb-2">
          &ldquo;{state.leaderboardTitle}&rdquo;
        </div>
        <div className="text-gray-500 text-xs">
          {archNames[state.archetype || 'portal']} • {state.round} rounds • Jan 2026 — {formatDate(state.month, state.year)}
        </div>
      </div>

      {/* Company Report */}
      <div className="bg-gray-900 border-2 border-gray-700 p-4 mb-4 w-full max-w-md">
        <h3 className="font-pixel text-xs text-gray-400 mb-3">📊 COMPANY REPORT CARD</h3>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {report.keyStats.map(({ label, value }) => (
            <div key={label} className="bg-gray-800 p-2 border border-gray-700">
              <div className="text-[9px] font-pixel text-gray-500">{label}</div>
              <div className="text-sm font-pixel text-white">{value}</div>
            </div>
          ))}
        </div>
        <p className="text-gray-400 text-xs leading-relaxed italic">
          {report.comparison}
        </p>
      </div>

      {/* Actions */}
      <div className="w-full max-w-md space-y-2 mb-6">
        <button
          onClick={downloadShareCard}
          className="w-full bg-blue-800 hover:bg-blue-700 text-white font-pixel text-xs py-3
            border-2 border-blue-500 transition-colors cursor-pointer"
        >
          📥 DOWNLOAD SHARE CARD
        </button>
        <button
          onClick={onRestart}
          className="w-full bg-green-800 hover:bg-green-700 text-white font-pixel text-xs py-3
            border-2 border-green-500 transition-colors cursor-pointer"
        >
          🔄 PLAY AGAIN (NEW ARCHETYPE)
        </button>
      </div>

      {/* Attribution */}
      <p className="text-gray-600 text-[10px] font-pixel text-center">
        Based on 53 interviews from Mike DelPrete&apos;s{' '}
        <a href="https://mikedp.com" target="_blank" rel="noopener noreferrer"
          className="text-green-600 hover:text-green-500 underline">
          Context podcast
        </a>
      </p>

      {/* Hidden canvas for share card generation */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
