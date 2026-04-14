import { Resources, ResourceEffects, GameState } from './types';

const RESOURCE_MIN = 0;
const RESOURCE_MAX = 100;
const CASH_MAX = 999;
const AGENT_REP_PENALTY_THRESHOLD = 20;
const CONSUMER_TRUST_PENALTY_THRESHOLD = 20;
const AGENT_REP_REVENUE_PENALTY = 0.25;
const CONSUMER_TRUST_REVENUE_PENALTY = 0.3;
const BASE_CASH_BURN = 8;

// Cash burn scales with company size — but more gradually
function getScaledCashBurn(state: GameState): number {
  let burn = BASE_CASH_BURN;

  // Burn scales with round (later = more expensive) — +1 every 4 rounds
  burn += Math.floor(state.round / 4);

  // Each adjacency adds ongoing cost
  burn += state.adjacencies.length * 3;

  // Public company = higher overhead
  if (state.quarterlyPressure) burn += 3;

  // W-2 agents = payroll burden
  if (state.flexRisk) burn += 4;

  return burn;
}

// Market share generates passive revenue — bigger company = more transactions
function getMarketShareRevenue(marketShare: number): number {
  // Every 5 points of market share adds 1 cash/round
  return Math.floor(marketShare / 5);
}

export function clampResource(value: number, key: keyof Resources, state?: GameState): number {
  if (key === 'cash') {
    return Math.min(Math.max(value, RESOURCE_MIN), CASH_MAX);
  }
  if (key === 'agentRep' && state?.agentRepCap && state.agentRepCap < RESOURCE_MAX) {
    return Math.min(Math.max(value, RESOURCE_MIN), state.agentRepCap);
  }
  return Math.min(Math.max(value, RESOURCE_MIN), RESOURCE_MAX);
}

export function getFocusMultiplier(adjacencies: string[]): number {
  const count = adjacencies.length;
  if (count === 0) return 1.0;
  if (count === 1) return 0.7;
  if (count === 2) return 0.5;
  return 0.3;
}

export function applyEffects(
  resources: Resources,
  effects: ResourceEffects,
  state: GameState
): Resources {
  const focusMultiplier = getFocusMultiplier(state.adjacencies);
  const newResources = { ...resources };

  for (const [key, delta] of Object.entries(effects) as [keyof Resources, number][]) {
    if (delta === undefined || delta === null) continue;

    // Apply focus multiplier to positive gains only
    const adjustedDelta = delta > 0 ? Math.round(delta * focusMultiplier) : delta;
    newResources[key] = clampResource(newResources[key] + adjustedDelta, key, state);
  }

  return newResources;
}

export function processRoundEffects(state: GameState): {
  resources: Resources;
  warnings: string[];
} {
  const warnings: string[] = [];
  let resources = { ...state.resources };

  // === INCOME ===

  // Revenue converts to cash — this is your core income engine
  // Higher multiplier so revenue decisions actually matter
  const revenueIncome = Math.round(resources.revenue * 0.5);
  resources.cash += revenueIncome;

  // Market share generates passive income — more transactions = more money
  const marketShareIncome = getMarketShareRevenue(resources.marketShare);
  if (marketShareIncome > 0) {
    resources.cash += marketShareIncome;
  }

  // === COSTS ===

  // Scaled cash burn
  const cashBurn = getScaledCashBurn(state);
  resources.cash -= cashBurn;

  // Debt service drain
  if (state.debt > 0) {
    resources.cash -= state.debtServicePerRound;
    warnings.push(`Debt service: -${state.debtServicePerRound} Cash`);
  }

  // Active drains (e.g., holding iBuying inventory)
  for (const drain of state.activedrains) {
    resources.cash += drain.cashPerRound; // negative value
    warnings.push(`${drain.source}: ${drain.cashPerRound} Cash`);
  }

  // === CONDITIONAL PENALTIES ===

  // Venture clock pressure — investors get antsy late
  if (state.ventureClockRounds !== null && state.ventureClockRounds <= 3) {
    const vcPressure = Math.round(resources.revenue * 0.1);
    resources.revenue = Math.max(0, resources.revenue - vcPressure);
    warnings.push(`VC pressure: investors distract leadership (-${vcPressure} Revenue)`);
  }

  // Quarterly pressure — public company overhead (once a year, not every 4 rounds)
  if (state.quarterlyPressure && state.round % 6 === 0) {
    resources.cash -= 5;
    warnings.push('Annual reporting: compliance costs (-5 Cash)');
  }

  // Flex risk: market downturns hit revenue harder
  if (state.flexRisk && state.marketCondition === 'downturn') {
    const flexPenalty = Math.round(resources.revenue * 0.25);
    resources.revenue = Math.max(0, resources.revenue - flexPenalty);
    warnings.push(`W-2 Risk: payroll can't flex (-${flexPenalty} Revenue)`);
  }

  // === NATURAL DECAY ===
  // Slow drift — relationships erode if you're not investing
  if (resources.agentRep > 55 && state.round > 6) {
    resources.agentRep -= 1;
  }
  if (resources.consumerTrust > 55 && state.round > 6) {
    resources.consumerTrust -= 1;
  }

  // === REPUTATION PENALTIES ===

  // Agent Rep penalty — reduced severity
  if (resources.agentRep < AGENT_REP_PENALTY_THRESHOLD) {
    const penalty = Math.round(resources.revenue * AGENT_REP_REVENUE_PENALTY);
    resources.revenue = Math.max(0, resources.revenue - penalty);
    if (penalty > 0) {
      warnings.push(`Low Agent Rep: agents steering clients away (-${penalty} Revenue)`);
    }
  }

  // Consumer Trust penalty
  if (resources.consumerTrust < CONSUMER_TRUST_PENALTY_THRESHOLD) {
    const penalty = Math.round(resources.revenue * CONSUMER_TRUST_REVENUE_PENALTY);
    resources.revenue = Math.max(0, resources.revenue - penalty);
    if (penalty > 0) {
      warnings.push(`Low Consumer Trust: leads drying up (-${penalty} Revenue)`);
    }
  }

  // Revenue can't go negative
  resources.revenue = Math.max(0, resources.revenue);

  // Clamp all resources
  for (const key of Object.keys(resources) as (keyof Resources)[]) {
    resources[key] = clampResource(resources[key], key, state);
  }

  return { resources, warnings };
}

export function calculateCashBurn(state: GameState): number {
  return getScaledCashBurn(state) + state.debtServicePerRound +
    state.activedrains.reduce((sum, d) => sum + Math.abs(d.cashPerRound), 0);
}

// Net cash flow per round (for HUD display)
export function calculateNetCashFlow(state: GameState): number {
  const income = Math.round(state.resources.revenue * 0.5)
    + getMarketShareRevenue(state.resources.marketShare);
  const burn = calculateCashBurn(state);
  return income - burn;
}
