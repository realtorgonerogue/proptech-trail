import { GameState } from './types';
import { calculateNetCashFlow } from './resourceSystem';

export function calculateScore(state: GameState): {
  score: number;
  title: string;
  profitabilityMultiplier: number;
  survivalBonus: number;
} {
  const { resources, round } = state;

  // Base score = market share (realistic range: 3-25)
  const baseScore = resources.marketShare;

  // Revenue bonus — higher revenue = more valuable company
  const revenueBonus = Math.floor(resources.revenue / 5); // 0-10 range

  // Profitability multiplier based on actual net cash flow
  const netFlow = calculateNetCashFlow(state);
  let profitabilityMultiplier = 1;
  if (netFlow > 5) profitabilityMultiplier = 1.8;       // profitable and growing
  else if (netFlow > 0) profitabilityMultiplier = 1.3;   // break-even to slightly positive
  else if (netFlow > -5) profitabilityMultiplier = 1.0;   // burning slowly
  else profitabilityMultiplier = 0.7;                     // burning fast

  // Survival bonus: +2 per round survived (rewards lasting longer)
  const survivalBonus = round * 2;

  // Reputation bonus — agent rep and consumer trust matter
  const repBonus = Math.floor((resources.agentRep + resources.consumerTrust) / 20);

  // Cash reserves bonus — having cash in the bank matters
  const cashBonus = resources.cash > 50 ? 3 : resources.cash > 20 ? 1 : 0;

  // Focus bonus — staying focused is rewarded
  const focusBonus = state.adjacencies.length === 0 ? 5 : state.adjacencies.length === 1 ? 2 : 0;

  // Score modifier from game-ending choices
  let scoreModifier = 1;
  const lastChoice = state.choiceHistory[state.choiceHistory.length - 1];
  if (lastChoice) {
    const flags = getChoiceFlags(state, lastChoice.choiceId);
    if (flags?.scoreModifier) scoreModifier = flags.scoreModifier;
  }

  const rawScore = (baseScore + revenueBonus + repBonus + cashBonus + focusBonus) * profitabilityMultiplier + survivalBonus;
  const score = Math.round(rawScore * scoreModifier);

  const title = getLeaderboardTitle(score);

  return { score, title, profitabilityMultiplier, survivalBonus };
}

function getChoiceFlags(state: GameState, choiceId: string) {
  // Look through choice history to find flags
  // This is a simplified lookup — flags were already processed during gameplay
  if (choiceId.includes('debt-C') || choiceId.includes('wind')) return { scoreModifier: 0.5 };
  return null;
}

export function getLeaderboardTitle(score: number): string {
  if (score >= 80) return 'You are the industry now';
  if (score >= 65) return "Glenn Sanford sends his regards";
  if (score >= 50) return 'Agents wear your t-shirt';
  if (score >= 40) return 'You built something real';
  if (score >= 30) return 'The industry notices you';
  if (score >= 20) return 'Sustainable but unsexy';
  if (score >= 10) return 'Acqui-hired for the talent';
  return 'Your investors would like a word';
}

export function generateCompanyReport(state: GameState): {
  choicesSummary: string[];
  keyStats: { label: string; value: string }[];
  comparison: string;
} {
  const choicesSummary = state.choiceHistory.map((h) => {
    return `Round ${h.round}: ${h.choiceId}`;
  });

  const netFlow = calculateNetCashFlow(state);

  const keyStats = [
    { label: 'Rounds Survived', value: String(state.round) },
    { label: 'Final Cash', value: `$${state.resources.cash}M` },
    { label: 'Revenue', value: String(state.resources.revenue) },
    { label: 'Cash Flow', value: `${netFlow >= 0 ? '+' : ''}${netFlow}/rd` },
    { label: 'Market Share', value: `${state.resources.marketShare}%` },
    { label: 'Agent Rep', value: String(state.resources.agentRep) },
    { label: 'Consumer Trust', value: String(state.resources.consumerTrust) },
    { label: 'Business Lines', value: state.adjacencies.length > 0 ? state.adjacencies.join(', ') : 'Focused' },
  ];

  const archetype = state.archetype || 'portal';
  const comparisons: Record<string, string> = {
    portal: 'Your portal play echoed the journeys of Zillow, Redfin, and Homes.com — companies that learned the portal game is won on distribution, not just product.',
    brokerage: 'Your brokerage story mirrors the choices faced by Compass, eXp, and Side — balancing agent experience, growth, and profitability.',
    fintech: 'Your FinTech journey followed the same path as Opendoor, Rocket, and Aalto — outsiders who had to learn that real estate runs on relationships.',
    infrastructure: 'Your infrastructure play paralleled Dotloop, ShowingTime, and Follow Up Boss — building the pipes the industry runs on.',
  };

  return {
    choicesSummary,
    keyStats,
    comparison: comparisons[archetype],
  };
}
