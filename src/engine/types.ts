// ===== CORE GAME TYPES =====

export type Archetype = 'portal' | 'brokerage' | 'fintech' | 'infrastructure';

export type GamePhase =
  | 'title'
  | 'archetype_select'
  | 'playing'
  | 'reveal'
  | 'impact'
  | 'time_passing'
  | 'market_event'
  | 'debt_decision'
  | 'game_over'
  | 'endscreen';

export type MarketCondition = 'boom' | 'normal' | 'downturn';

export interface Resources {
  cash: number;
  revenue: number;
  agentRep: number;
  consumerTrust: number;
  marketShare: number;
}

export interface ResourceEffects {
  cash?: number;
  revenue?: number;
  agentRep?: number;
  consumerTrust?: number;
  marketShare?: number;
}

export interface ChoiceFlags {
  setsVentureClock?: number;      // rounds until investors lose patience
  setsQuarterlyPressure?: boolean;
  setsFlexRisk?: boolean;
  addsAdjacency?: string;         // e.g., 'mortgage', 'rentals', 'ibuying'
  setsAttachRate?: number;
  addDebt?: number;
  reduceDebt?: boolean;
  reducedDebtService?: number;    // rounds of reduced service
  permanentAgentRepCap?: number;  // cap agentRep at this value
  gameOver?: boolean;
  gameOverReason?: string;
  scoreModifier?: number;         // multiplier for final score
  inventoryRisk?: boolean;
  cashDrainPerRound?: number;     // ongoing cash drain (e.g., holding homes)
  cashDrainRounds?: number;       // how many rounds the drain lasts
  potentialCashBonus?: number;    // bonus if market recovers
  potentialBonusCondition?: string;
  coinFlip?: boolean;             // 50% chance of positive or negative effect
  coinFlipPositive?: ResourceEffects;
  coinFlipNegative?: ResourceEffects;
  delayedEffect?: ResourceEffects; // applies next round
  randomResourcePenalty?: boolean; // -1 to random resource for 2 rounds
}

export interface Choice {
  id: string;
  label: string;
  description: string;
  effects: ResourceEffects;
  flags?: ChoiceFlags;
  revealText: string;
  revealSource: string;
}

export interface DecisionCondition {
  archetypeFilter?: Archetype[];        // only show for these archetypes
  requiresChoice?: string;              // only show if player made this choice
  requiresFlag?: string;                // only show if this flag is set
  requiresMarketCondition?: MarketCondition;
  requiresDebt?: boolean;               // only show if carrying debt
  requiresMinMarketShare?: number;      // only show if market share above this
  requiresNoChoice?: string;            // only show if player did NOT make this choice
}

export interface Decision {
  id: string;
  phase: number;                        // 1-4
  title: string;
  description: string;
  choices: Choice[];
  conditions?: DecisionCondition;
  isSubDecision?: boolean;
  isMicroDecision?: boolean;
  triggeredBy?: string;                 // choice ID that triggers this sub-decision
  roundRange?: [number, number];        // [min, max] rounds when this can fire
}

export interface MarketEventResponse {
  label: string;
  description: string;
  effects: ResourceEffects;
}

export interface MarketEvent {
  id: string;
  name: string;
  description: string;
  effects: ResourceEffects;             // base effects that hit no matter what
  responses: MarketEventResponse[];     // player chooses how to respond
  flags?: ChoiceFlags;
  source: string;
  isNegative: boolean;
  triggersDecision?: string;
}

export interface ChoiceHistoryEntry {
  decisionId: string;
  choiceId: string;
  round: number;
}

export interface ActiveDrain {
  cashPerRound: number;
  roundsRemaining: number;
  source: string;
}

export interface GameState {
  phase: GamePhase;
  archetype: Archetype | null;
  companyName: string;
  resources: Resources;
  round: number;
  gameRound: number;                    // actual phase-based round
  debt: number;
  debtServicePerRound: number;
  ventureClockRounds: number | null;    // null = no VC, counts down
  quarterlyPressure: boolean;
  flexRisk: boolean;
  attachRate: number | null;
  focusScore: number;                   // 1.0, 0.7, 0.5, 0.3
  adjacencies: string[];
  choiceHistory: ChoiceHistoryEntry[];
  pendingSubDecisions: string[];
  usedMarketEvents: string[];
  usedMicroDecisions: string[];
  currentDecision: Decision | null;
  currentMarketEvent: MarketEvent | null;
  lastChoiceEffects: ResourceEffects | null;
  lastChoice: Choice | null;
  gameOverReason: string | null;
  score: number | null;
  leaderboardTitle: string | null;
  marketCondition: MarketCondition;
  agentRepCap: number;                  // permanent cap (default 100)
  activedrains: ActiveDrain[];
  soundEnabled: boolean;
  inventoryRisk: boolean;
  // Timeline
  month: number;                        // 1-12
  year: number;                         // starting year
  previousResources: Resources | null;  // snapshot before last choice for impact screen
}

// ===== ARCHETYPE CONFIGS =====

export interface ArchetypeConfig {
  id: Archetype;
  name: string;
  tagline: string;
  description: string;
  startingResources: Resources;
  realInspiration: string[];
  uniqueDecisions: string;
}

export const ARCHETYPES: ArchetypeConfig[] = [
  {
    id: 'portal',
    name: 'The Portal Play',
    tagline: 'We\'re building the best real estate search experience on the internet.',
    description: 'Win the consumer\'s first click. Monetize attention. Own the top of the funnel.',
    startingResources: { cash: 80, revenue: 10, agentRep: 40, consumerTrust: 60, marketShare: 1 },
    realInspiration: ['Zillow', 'Redfin', 'Trulia', 'Homes.com'],
    uniqueDecisions: 'SEO strategy, listing data sourcing, lead monetization, portal traffic wars',
  },
  {
    id: 'brokerage',
    name: 'The Brokerage Disruptor',
    tagline: 'We\'re building a better brokerage from the ground up.',
    description: 'Reinvent how agents work. Better splits, better tech, better culture.',
    startingResources: { cash: 60, revenue: 15, agentRep: 50, consumerTrust: 40, marketShare: 2 },
    realInspiration: ['Compass', 'eXp', 'Side', 'Real'],
    uniqueDecisions: 'Agent model (W2/1099/hybrid), recruiting strategy, office strategy, culture vs. growth',
  },
  {
    id: 'fintech',
    name: 'The FinTech Outsider',
    tagline: 'Real estate is just a financial transaction waiting to be optimized.',
    description: 'Apply Silicon Valley thinking to an analog industry. Move fast and disrupt.',
    startingResources: { cash: 100, revenue: 5, agentRep: 30, consumerTrust: 50, marketShare: 0 },
    realInspiration: ['Opendoor', 'Rocket', 'Aalto', 'Orchard', 'Homeward'],
    uniqueDecisions: 'Agent partnership strategy, direct-to-consumer vs. agent channel, iBuying',
  },
  {
    id: 'infrastructure',
    name: 'The Infrastructure Builder',
    tagline: 'We\'re building the pipes everyone else runs on.',
    description: 'Tools, platforms, data layers. You don\'t sell houses — you power those who do.',
    startingResources: { cash: 50, revenue: 20, agentRep: 70, consumerTrust: 30, marketShare: 1 },
    realInspiration: ['Dotloop', 'ShowingTime', 'Remine', 'CoStar', 'Follow Up Boss'],
    uniqueDecisions: 'Platform vs. product, MLS relationships, data strategy, build vs. partner',
  },
];

// ===== GAME ACTION TYPES =====

export type GameAction =
  | { type: 'SELECT_ARCHETYPE'; archetype: Archetype }
  | { type: 'SET_COMPANY_NAME'; name: string }
  | { type: 'START_GAME' }
  | { type: 'MAKE_CHOICE'; choiceId: string }
  | { type: 'DISMISS_REVEAL' }
  | { type: 'DISMISS_IMPACT' }
  | { type: 'DISMISS_TIME_PASSING' }
  | { type: 'DISMISS_EVENT'; responseIndex: number }
  | { type: 'PROCESS_ROUND' }
  | { type: 'END_GAME'; reason: string }
  | { type: 'RESTART' }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'SET_DECISION'; decision: Decision }
  | { type: 'SET_MARKET_EVENT'; event: MarketEvent }
  | { type: 'GO_TO_ENDSCREEN' };
