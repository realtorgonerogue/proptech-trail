'use client';

interface HelpScreenProps {
  onClose: () => void;
}

export default function HelpScreen({ onClose }: HelpScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/90 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-lg mx-4 my-4 bg-gray-900 border-2 border-green-600">
        {/* Header */}
        <div className="sticky top-0 bg-green-900 border-b-2 border-green-500 px-4 py-3 flex items-center justify-between">
          <h2 className="font-pixel text-sm text-green-300">📖 HOW TO PLAY</h2>
          <button
            onClick={onClose}
            className="text-green-300 hover:text-white text-xl font-bold leading-none w-8 h-8
              flex items-center justify-center cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-4 space-y-5 text-gray-300 text-sm leading-relaxed">
          {/* What is this */}
          <section>
            <h3 className="font-pixel text-xs text-green-400 mb-2">🎯 THE GAME</h3>
            <p>
              You&apos;re a founder building a real estate company. Make strategic
              decisions across <strong className="text-white">15+ rounds</strong> and
              navigate real-world challenges drawn from interviews with actual industry leaders.
            </p>
            <p className="mt-2 text-gray-400 text-xs italic">
              Every reveal comes from Mike DelPrete&apos;s Context podcast — real founders,
              real outcomes.
            </p>
          </section>

          {/* Archetypes */}
          <section>
            <h3 className="font-pixel text-xs text-green-400 mb-2">🏢 PICK YOUR COMPANY</h3>
            <ul className="space-y-1.5 text-xs">
              <li><strong className="text-white">🌐 Portal Play</strong> — Build a search portal (Zillow, Redfin)</li>
              <li><strong className="text-white">🏢 Brokerage Disruptor</strong> — Reinvent the brokerage (Compass, eXp)</li>
              <li><strong className="text-white">💸 FinTech Outsider</strong> — Apply tech to real estate (Opendoor, Rocket)</li>
              <li><strong className="text-white">⚙️ Infrastructure Builder</strong> — Build the pipes (Dotloop, CoStar)</li>
            </ul>
            <p className="mt-2 text-gray-400 text-xs">
              Each archetype has <strong className="text-green-400">completely different decisions</strong>.
              Replay as different types for new experiences.
            </p>
          </section>

          {/* Resources */}
          <section>
            <h3 className="font-pixel text-xs text-green-400 mb-2">📊 YOUR RESOURCES</h3>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <span className="text-lg">💰</span>
                <div>
                  <strong className="text-white">Cash</strong> — Your runway. If this hits 0,
                  you face a debt crisis. Hit 0 again with debt = game over.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">📈</span>
                <div>
                  <strong className="text-white">Revenue</strong> — Converts to cash each round
                  (60% conversion rate). Higher revenue = more cash flow.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">🤝</span>
                <div>
                  <strong className="text-white">Agent Rep</strong> — How the industry sees you.
                  Below 20 and agents steer clients away, tanking revenue.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">❤️</span>
                <div>
                  <strong className="text-white">Consumer Trust</strong> — How buyers/sellers
                  see you. Below 20 and leads dry up.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">🏆</span>
                <div>
                  <strong className="text-white">Market Share</strong> — Your slice of transactions.
                  The foundation of your final score.
                </div>
              </li>
            </ul>
          </section>

          {/* Phases */}
          <section>
            <h3 className="font-pixel text-xs text-green-400 mb-2">📅 THE JOURNEY</h3>
            <div className="space-y-1.5 text-xs">
              <p><strong className="text-blue-400">Phase 1 — Founding</strong> (Rounds 1-4): Who are you? How do you make money?</p>
              <p><strong className="text-green-400">Phase 2 — Early Growth</strong> (Rounds 5-9): Build the machine. Face first crises.</p>
              <p><strong className="text-yellow-400">Phase 3 — Scaling</strong> (Rounds 10-15+): Big bets. Market shocks. Endgame choices.</p>
            </div>
            <p className="mt-2 text-gray-400 text-xs">
              <strong>Survival challenges</strong> (market crashes, lawsuits, competition) can hit at any phase —
              just like real life.
            </p>
          </section>

          {/* Decision Flow */}
          <section>
            <h3 className="font-pixel text-xs text-green-400 mb-2">🎲 EACH DECISION</h3>
            <ol className="space-y-1 text-xs list-decimal list-inside">
              <li><strong className="text-white">Choose</strong> — Pick your strategy (2-3 options, tradeoffs shown)</li>
              <li><strong className="text-white">Reveal</strong> — See what happened to real companies</li>
              <li><strong className="text-white">Impact</strong> — Before/after resource comparison</li>
              <li><strong className="text-white">Time passes</strong> — Months advance, burn applies</li>
            </ol>
          </section>

          {/* Tips */}
          <section>
            <h3 className="font-pixel text-xs text-green-400 mb-2">💡 TIPS</h3>
            <ul className="space-y-1.5 text-xs list-disc list-inside">
              <li><strong className="text-white">Watch your cash flow</strong> — the +/- indicator shows if you&apos;re bleeding or profitable</li>
              <li><strong className="text-white">Don&apos;t over-diversify</strong> — each business line makes everything else 30-70% less effective</li>
              <li><strong className="text-white">Agent Rep and Consumer Trust erode</strong> if you&apos;re not maintaining them</li>
              <li><strong className="text-white">VC funding</strong> gives fast cash but starts a 12-round clock</li>
              <li><strong className="text-white">Market events are choices</strong> — you can&apos;t just ride them out, respond strategically</li>
            </ul>
          </section>

          {/* Scoring */}
          <section>
            <h3 className="font-pixel text-xs text-green-400 mb-2">🏆 SCORING</h3>
            <p className="text-xs mb-2">
              Final score based on market share, revenue, reputation, survival rounds,
              and profitability.
            </p>
            <div className="text-xs space-y-0.5">
              <p><span className="text-gray-500">0-20:</span> Your investors would like a word</p>
              <p><span className="text-gray-500">20-40:</span> Sustainable but unsexy</p>
              <p><span className="text-green-400">40-65:</span> You built something real</p>
              <p><span className="text-yellow-400">65-80:</span> Glenn Sanford sends his regards</p>
              <p><span className="text-orange-400">80+:</span> You are the industry now</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-900 border-t-2 border-green-700 px-4 py-3">
          <button
            onClick={onClose}
            className="w-full bg-green-700 hover:bg-green-600 active:bg-green-500
              text-white font-pixel text-xs py-3 border-2 border-green-500
              transition-colors cursor-pointer"
          >
            GOT IT — LET&apos;S PLAY →
          </button>
        </div>
      </div>
    </div>
  );
}
