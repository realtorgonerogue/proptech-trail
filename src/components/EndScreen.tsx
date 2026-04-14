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

    // Draw share card — taller to fit credits nicely
    canvas.width = 600;
    canvas.height = 500;

    // Background
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, 600, 500);

    // Outer border
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, 584, 484);

    // Header band
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(8, 8, 584, 70);

    // Title
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('THE PROPTECH TRAIL', 300, 42);

    // Tagline
    ctx.fillStyle = '#86efac';
    ctx.font = '11px monospace';
    ctx.fillText('The Oregon Trail for Real Estate', 300, 62);

    // Archetype
    ctx.fillStyle = '#d1d5db';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(archNames[state.archetype || 'portal'] || 'Unknown', 300, 105);

    // Score block
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 64px monospace';
    ctx.fillText(`${state.score || 0}`, 300, 180);

    ctx.fillStyle = '#d1d5db';
    ctx.font = '12px monospace';
    ctx.fillText('POINTS', 300, 200);

    // Leaderboard title
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`"${state.leaderboardTitle || 'Unknown'}"`, 300, 230);

    // Stats (2-column layout)
    ctx.textAlign = 'left';
    ctx.font = '12px monospace';
    const leftStats = [
      ['Rounds Survived', `${state.round}`],
      ['Market Share', `${state.resources.marketShare}`],
    ];
    const rightStats = [
      ['Final Cash', `$${state.resources.cash}M`],
      ['Revenue', `${state.resources.revenue}`],
    ];
    leftStats.forEach(([label, val], i) => {
      ctx.fillStyle = '#9ca3af';
      ctx.fillText(label, 60, 280 + i * 22);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(val, 220, 280 + i * 22);
    });
    rightStats.forEach(([label, val], i) => {
      ctx.fillStyle = '#9ca3af';
      ctx.fillText(label, 320, 280 + i * 22);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(val, 490, 280 + i * 22);
    });

    // Focus line
    ctx.textAlign = 'center';
    ctx.fillStyle = '#9ca3af';
    ctx.font = '11px monospace';
    const focusText = state.adjacencies.length === 0 ? 'Focused company' : `${state.adjacencies.length} business lines`;
    ctx.fillText(focusText, 300, 345);

    // Game over reason
    ctx.fillStyle = '#ef4444';
    ctx.font = 'italic 11px monospace';
    ctx.fillText(state.gameOverReason || '', 300, 368);

    // Divider
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, 395);
    ctx.lineTo(540, 395);
    ctx.stroke();

    // Play the game at...
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('Play at proptech-trail.vercel.app', 300, 418);

    // Podcast source
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px monospace';
    ctx.fillText("Based on Mike DelPrete's Context podcast • mikedp.com", 300, 440);

    // Author credits
    ctx.fillStyle = '#9ca3af';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('Built by Nick Aufenkamp', 300, 465);

    ctx.fillStyle = '#22c55e';
    ctx.font = '10px monospace';
    ctx.fillText('thetartanteam.com  •  diyhomebuyeracademy.com', 300, 482);

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
      <div className="text-center space-y-2 max-w-md w-full">
        <p className="text-gray-600 text-[10px] font-pixel">
          Based on 53 interviews from Mike DelPrete&apos;s{' '}
          <a href="https://mikedp.com" target="_blank" rel="noopener noreferrer"
            className="text-green-600 hover:text-green-500 underline">
            Context podcast
          </a>
        </p>
        <div className="pt-2 border-t border-gray-800">
          <p className="text-gray-500 text-[10px] font-pixel mb-1.5">
            Built by Nick Aufenkamp
          </p>
          <div className="flex items-center justify-center gap-3 text-[10px]">
            <a
              href="https://thetartanteam.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-500 hover:text-green-400 underline"
            >
              thetartanteam.com
            </a>
            <span className="text-gray-700">•</span>
            <a
              href="https://diyhomebuyeracademy.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-500 hover:text-green-400 underline"
            >
              diyhomebuyeracademy.com
            </a>
          </div>
        </div>
      </div>

      {/* Hidden canvas for share card generation */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
