'use client';

import { useRef, useEffect, useState } from 'react';
import { Archetype, ARCHETYPES, ArchetypeConfig } from '../engine/types';
import HelpScreen from './HelpScreen';

interface TitleScreenProps {
  onSelectArchetype: (archetype: Archetype) => void;
  selectedArchetype: Archetype | null;
  onStart: () => void;
  startingResources: { cash: number; revenue: number; agentRep: number; consumerTrust: number; marketShare: number } | null;
}

export default function TitleScreen({
  onSelectArchetype,
  selectedArchetype,
  onStart,
  startingResources,
}: TitleScreenProps) {
  const startRef = useRef<HTMLButtonElement>(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (selectedArchetype && startRef.current) {
      startRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedArchetype]);

  return (
    <div className="bg-gray-950 flex flex-col items-center px-4 pb-8 relative">
      {/* Help button - top right */}
      <button
        onClick={() => setShowHelp(true)}
        className="fixed top-2 right-2 z-30 bg-gray-800 hover:bg-gray-700 border-2 border-green-600
          hover:border-green-500 text-green-400 font-pixel text-xs w-10 h-10
          transition-colors cursor-pointer flex items-center justify-center"
        title="How to Play"
      >
        ?
      </button>

      {showHelp && <HelpScreen onClose={() => setShowHelp(false)} />}
      {/* Title */}
      <div className="pt-10 sm:pt-14 pb-6 text-center">
        {/* Pixel art logo using CSS blocks */}
        <div className="mb-6 flex flex-col items-center">
          <div className="relative mb-4">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-green-500 text-[10px] font-pixel tracking-widest">
                ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■
              </span>
            </div>
            <h1 className="font-pixel text-3xl sm:text-5xl text-green-400 leading-tight tracking-wider"
              style={{ textShadow: '3px 3px 0px #064e3b, -1px -1px 0px #065f46' }}>
              THE
            </h1>
            <h1 className="font-pixel text-2xl sm:text-4xl text-green-400 leading-tight tracking-wider"
              style={{ textShadow: '3px 3px 0px #064e3b, -1px -1px 0px #065f46' }}>
              PROPTECH
            </h1>
            <h1 className="font-pixel text-3xl sm:text-5xl text-green-300 leading-tight tracking-wider"
              style={{ textShadow: '3px 3px 0px #064e3b, -1px -1px 0px #065f46' }}>
              TRAIL
            </h1>
            <div className="flex items-center justify-center gap-1 mt-1">
              <span className="text-green-500 text-[10px] font-pixel tracking-widest">
                ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■
              </span>
            </div>
          </div>

          {/* Pixel art wagon/house icon */}
          <div className="text-4xl mb-3 animate-bounce" style={{ animationDuration: '3s' }}>
            🏠
          </div>
        </div>

        <p className="text-gray-400 text-xs sm:text-sm font-pixel mb-2">
          The Oregon Trail for Real Estate
        </p>
        <p className="text-gray-500 text-[11px] max-w-sm mx-auto leading-relaxed">
          Based on 53 interviews from Mike DelPrete&apos;s Context podcast —{' '}
          <a href="https://mikedp.com" target="_blank" rel="noopener noreferrer"
            className="text-green-500 hover:text-green-400 underline">
            mikedp.com
          </a>
        </p>
      </div>

      {/* Archetype selection */}
      <div className="w-full max-w-lg mb-6">
        <h2 className="font-pixel text-[10px] sm:text-xs text-gray-400 mb-4 text-center tracking-wider">
          CHOOSE YOUR COMPANY TYPE
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ARCHETYPES.map((archetype: ArchetypeConfig) => {
            const icons: Record<string, string> = {
              portal: '🌐',
              brokerage: '🏢',
              fintech: '💸',
              infrastructure: '⚙️',
            };
            const isSelected = selectedArchetype === archetype.id;
            return (
              <button
                key={archetype.id}
                onClick={() => onSelectArchetype(archetype.id)}
                className={`text-left p-4 border-2 transition-all cursor-pointer active:scale-[0.98] ${
                  isSelected
                    ? 'border-green-500 bg-green-900/20 shadow-lg shadow-green-900/20'
                    : 'border-gray-700 bg-gray-900/50 hover:border-gray-500 hover:bg-gray-900/70'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xl">{icons[archetype.id] || '🏠'}</span>
                  <div className="font-pixel text-[11px] sm:text-xs text-white leading-tight">
                    {archetype.name}
                  </div>
                  {isSelected && (
                    <span className="ml-auto text-green-400 text-sm">✓</span>
                  )}
                </div>
                <div className="text-gray-400 text-[11px] sm:text-xs mb-2 italic leading-relaxed">
                  &ldquo;{archetype.tagline}&rdquo;
                </div>
                <div className="text-gray-500 text-[10px] sm:text-[11px] mb-2.5 leading-relaxed">
                  {archetype.description}
                </div>
                <div className="flex flex-wrap gap-1">
                  {archetype.realInspiration.map((company) => (
                    <span
                      key={company}
                      className={`text-[8px] sm:text-[9px] font-pixel px-1.5 py-0.5 border ${
                        isSelected
                          ? 'bg-green-900/30 text-green-400 border-green-700'
                          : 'bg-gray-800 text-gray-400 border-gray-700'
                      }`}
                    >
                      {company}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected archetype stats preview */}
      {selectedArchetype && startingResources && (
        <div className="w-full max-w-lg mb-4 animate-fadeIn">
          <div className="bg-gray-900 border-2 border-green-700 p-3">
            <h3 className="font-pixel text-xs text-green-400 mb-2">STARTING RESOURCES</h3>
            <div className="grid grid-cols-5 gap-2 text-center">
              {[
                { label: 'CASH', value: startingResources.cash, icon: '💰' },
                { label: 'REV', value: startingResources.revenue, icon: '📈' },
                { label: 'AGENTS', value: startingResources.agentRep, icon: '🤝' },
                { label: 'TRUST', value: startingResources.consumerTrust, icon: '❤️' },
                { label: 'SHARE', value: startingResources.marketShare, icon: '🏆' },
              ].map(({ label, value, icon }) => (
                <div key={label}>
                  <span className="text-base">{icon}</span>
                  <div className="font-pixel text-[9px] text-gray-400">{label}</div>
                  <div className="font-pixel text-sm text-white">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Start button */}
      {selectedArchetype && (
        <button
          ref={startRef}
          onClick={onStart}
          className="w-full max-w-lg bg-green-700 hover:bg-green-600 active:bg-green-500
            active:scale-[0.98] text-white font-pixel text-xs sm:text-sm py-4
            border-2 border-green-500 transition-all mb-8 cursor-pointer animate-fadeIn
            shadow-lg shadow-green-900/30"
        >
          ▶ START YOUR COMPANY
        </button>
      )}

      {/* Footer */}
      <div className="text-center pb-8 space-y-2">
        <p className="text-gray-600 text-[8px] sm:text-[9px] font-pixel">
          Every decision has consequences • Every reveal is real
        </p>
        <div className="pt-3 border-t border-gray-800 max-w-md mx-auto">
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
    </div>
  );
}
