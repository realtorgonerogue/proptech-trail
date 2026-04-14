'use client';

import { useReducer, useCallback } from 'react';
import {
  GameState,
  GameAction,
  ARCHETYPES,
  Choice,
} from '../engine/types';
import { applyEffects, processRoundEffects, getFocusMultiplier } from '../engine/resourceSystem';
import {
  getNextDecision,
  getSubDecisionTriggers,
  getDecisionById,
  shouldTriggerMarketEvent,
} from '../engine/decisionTree';
import { getRandomMarketEvent, getMarketConditionFromEvent } from '../engine/marketEvents';
import { calculateScore } from '../engine/scoring';

// How many months pass per decision (varies by phase for pacing)
function getMonthsPerDecision(round: number, isMicro: boolean): number {
  if (isMicro) return 1; // micro-decisions are quick — 1 month
  if (round <= 4) return 3;   // Phase 1: quarterly decisions (founding)
  if (round <= 9) return 3;   // Phase 2: quarterly (early growth)
  return 4;                   // Phase 3: every 4 months (scaling, each one weighs heavy)
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function getMonthName(month: number): string {
  return MONTH_NAMES[(month - 1) % 12];
}

export function formatDate(month: number, year: number): string {
  return `${getMonthName(month)} ${year}`;
}

const initialState: GameState = {
  phase: 'title',
  archetype: null,
  companyName: 'My Company',
  resources: { cash: 0, revenue: 0, agentRep: 0, consumerTrust: 0, marketShare: 0 },
  round: 0,
  gameRound: 0,
  debt: 0,
  debtServicePerRound: 0,
  ventureClockRounds: null,
  quarterlyPressure: false,
  flexRisk: false,
  attachRate: null,
  focusScore: 1.0,
  adjacencies: [],
  choiceHistory: [],
  pendingSubDecisions: [],
  usedMarketEvents: [],
  usedMicroDecisions: [],
  currentDecision: null,
  currentMarketEvent: null,
  lastChoiceEffects: null,
  lastChoice: null,
  gameOverReason: null,
  score: null,
  leaderboardTitle: null,
  marketCondition: 'normal',
  agentRepCap: 100,
  activedrains: [],
  soundEnabled: true,
  inventoryRisk: false,
  month: 1,
  year: 2026,
  previousResources: null,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SELECT_ARCHETYPE': {
      const config = ARCHETYPES.find((a) => a.id === action.archetype)!;
      return {
        ...state,
        phase: 'archetype_select',
        archetype: action.archetype,
        resources: { ...config.startingResources },
      };
    }

    case 'START_GAME': {
      const firstDecision = getNextDecision({
        ...state,
        round: 1,
        phase: 'playing',
        month: 1,
        year: 2026,
        previousResources: null,
      });
      return {
        ...state,
        phase: 'playing',
        round: 1,
        gameRound: 1,
        month: 1,
        year: 2026,
        currentDecision: firstDecision,
        previousResources: null,
      };
    }

    case 'MAKE_CHOICE': {
      const decision = state.currentDecision;
      if (!decision) return state;

      const choice = decision.choices.find((c: Choice) => c.id === action.choiceId);
      if (!choice) return state;

      // Snapshot resources BEFORE applying effects
      const previousResources = { ...state.resources };

      let newState = { ...state, previousResources };

      // Handle coin flip effects
      let effects = { ...choice.effects };
      if (choice.flags?.coinFlip) {
        const isPositive = Math.random() >= 0.5;
        const flipEffects = isPositive
          ? choice.flags.coinFlipPositive || {}
          : choice.flags.coinFlipNegative || {};
        effects = { ...effects, ...flipEffects };
      }

      // Apply resource effects
      newState.resources = applyEffects(newState.resources, effects, newState);
      newState.lastChoiceEffects = effects;
      newState.lastChoice = choice;

      // Record choice
      newState.choiceHistory = [
        ...newState.choiceHistory,
        { decisionId: decision.id, choiceId: choice.id, round: state.round },
      ];

      // Track micro-decisions
      if (decision.isMicroDecision) {
        newState.usedMicroDecisions = [...newState.usedMicroDecisions, decision.id];
      }

      // Process flags
      if (choice.flags) {
        const flags = choice.flags;

        if (flags.setsVentureClock !== undefined) {
          newState.ventureClockRounds = flags.setsVentureClock;
        }
        if (flags.setsQuarterlyPressure) {
          newState.quarterlyPressure = true;
        }
        if (flags.setsFlexRisk) {
          newState.flexRisk = true;
        }
        if (flags.addsAdjacency) {
          newState.adjacencies = [...newState.adjacencies, flags.addsAdjacency];
          newState.focusScore = getFocusMultiplier(newState.adjacencies);
        }
        if (flags.setsAttachRate !== undefined) {
          newState.attachRate = flags.setsAttachRate;
        }
        if (flags.addDebt) {
          newState.debt += flags.addDebt;
          newState.debtServicePerRound = 5;
        }
        if (flags.reduceDebt) {
          newState.debt = Math.max(0, newState.debt - 15);
          if (newState.debt <= 0) newState.debtServicePerRound = 0;
        }
        if (flags.reducedDebtService) {
          newState.debtServicePerRound = 2;
        }
        if (flags.permanentAgentRepCap) {
          newState.agentRepCap = Math.min(newState.agentRepCap, flags.permanentAgentRepCap);
          newState.resources.agentRep = Math.min(newState.resources.agentRep, newState.agentRepCap);
        }
        if (flags.inventoryRisk) {
          newState.inventoryRisk = true;
        }
        if (flags.cashDrainPerRound && flags.cashDrainRounds) {
          newState.activedrains = [
            ...newState.activedrains,
            {
              cashPerRound: flags.cashDrainPerRound,
              roundsRemaining: flags.cashDrainRounds,
              source: 'Holding inventory',
            },
          ];
        }
        if (flags.randomResourcePenalty) {
          const resourceKeys = ['agentRep', 'consumerTrust', 'revenue'] as const;
          const randomKey = resourceKeys[Math.floor(Math.random() * resourceKeys.length)];
          newState.resources = {
            ...newState.resources,
            [randomKey]: Math.max(0, newState.resources[randomKey] - 3),
          };
        }
        if (flags.gameOver) {
          const scoreResult = calculateScore(newState);
          const modifiedScore = flags.scoreModifier
            ? Math.round(scoreResult.score * flags.scoreModifier)
            : scoreResult.score;
          return {
            ...newState,
            phase: 'game_over',
            gameOverReason: flags.gameOverReason || 'Game Over',
            score: modifiedScore,
            leaderboardTitle: scoreResult.title,
            currentDecision: null,
          };
        }
      }

      // Queue sub-decisions triggered by this choice
      const triggers = newState.archetype ? getSubDecisionTriggers(choice.id, newState.archetype) : [];
      if (triggers.length > 0) {
        newState.pendingSubDecisions = [...newState.pendingSubDecisions, ...triggers];
      }

      // Remove current decision from pending if it was a sub-decision
      if (decision.isSubDecision || decision.isMicroDecision) {
        newState.pendingSubDecisions = newState.pendingSubDecisions.filter(
          (id) => id !== decision.id
        );
      }

      // Transition to reveal phase (step 1 of post-decision flow)
      newState.phase = 'reveal';
      newState.currentDecision = decision;

      return newState;
    }

    // Step 2: Player dismisses reveal → show impact screen
    case 'DISMISS_REVEAL': {
      return { ...state, phase: 'impact' };
    }

    // Step 3: Player dismisses impact → show time passing
    case 'DISMISS_IMPACT': {
      return { ...state, phase: 'time_passing' };
    }

    // Step 4: Time passing completes → process round and advance
    case 'DISMISS_TIME_PASSING': {
      let newState = { ...state, phase: 'playing' as const };

      // Advance time
      const isMicro = newState.currentDecision?.isMicroDecision || false;
      const monthsToAdvance = getMonthsPerDecision(newState.round, isMicro);
      let newMonth = newState.month + monthsToAdvance;
      let newYear = newState.year;
      while (newMonth > 12) {
        newMonth -= 12;
        newYear++;
      }
      newState.month = newMonth;
      newState.year = newYear;

      // Process round (burn resources, tick clocks)
      const roundResult = processRoundEffects(newState);
      newState.resources = roundResult.resources;

      // Tick active drains
      newState.activedrains = newState.activedrains
        .map((d) => ({ ...d, roundsRemaining: d.roundsRemaining - 1 }))
        .filter((d) => d.roundsRemaining > 0);

      // Tick venture clock
      if (newState.ventureClockRounds !== null) {
        newState.ventureClockRounds--;
        if (newState.ventureClockRounds <= 0) {
          newState.resources.cash = Math.max(0, newState.resources.cash - 20);
          newState.resources.agentRep = Math.max(0, newState.resources.agentRep - 10);
        }
      }

      // Advance round
      newState.round++;
      newState.gameRound++;

      // Check for cash = 0 (debt mechanic)
      if (newState.resources.cash <= 0) {
        if (newState.debt > 0) {
          const scoreResult = calculateScore(newState);
          return {
            ...newState,
            phase: 'game_over',
            gameOverReason: 'Bankrupt — debt could not save you',
            score: scoreResult.score,
            leaderboardTitle: scoreResult.title,
            currentDecision: null,
          };
        }
        const debtDecision = getDecisionById('debt-decision', newState.archetype || undefined);
        return {
          ...newState,
          phase: 'debt_decision',
          currentDecision: debtDecision,
          resources: { ...newState.resources, cash: 0 },
        };
      }

      // Check for market event
      if (shouldTriggerMarketEvent(newState)) {
        const event = getRandomMarketEvent(newState);
        if (event) {
          return {
            ...newState,
            phase: 'market_event',
            currentMarketEvent: event,
            usedMarketEvents: [...newState.usedMarketEvents, event.id],
            marketCondition: getMarketConditionFromEvent(event),
          };
        }
      }

      // Get next decision
      const nextDecision = getNextDecision(newState);
      if (!nextDecision) {
        const scoreResult = calculateScore(newState);
        return {
          ...newState,
          phase: 'game_over',
          gameOverReason: 'Company matured — the journey is complete',
          score: scoreResult.score,
          leaderboardTitle: scoreResult.title,
          currentDecision: null,
        };
      }

      return {
        ...newState,
        currentDecision: nextDecision,
        lastChoiceEffects: null,
        lastChoice: null,
        previousResources: null,
      };
    }

    case 'DISMISS_EVENT': {
      const event = state.currentMarketEvent;
      if (!event) return { ...state, phase: 'playing' };

      // Apply base effects (happen no matter what)
      let newResources = applyEffects(state.resources, event.effects, state);

      // Apply the chosen response effects
      const responseIndex = (action as { type: 'DISMISS_EVENT'; responseIndex: number }).responseIndex;
      const response = event.responses?.[responseIndex];
      if (response) {
        newResources = applyEffects(newResources, response.effects, state);
      }

      let newState = {
        ...state,
        resources: newResources,
        currentMarketEvent: null,
        phase: 'playing' as const,
      };

      const nextDecision = getNextDecision(newState);
      if (!nextDecision) {
        const scoreResult = calculateScore(newState);
        return {
          ...newState,
          phase: 'game_over',
          gameOverReason: 'Company matured',
          score: scoreResult.score,
          leaderboardTitle: scoreResult.title,
        };
      }

      return { ...newState, currentDecision: nextDecision };
    }

    case 'GO_TO_ENDSCREEN': {
      return { ...state, phase: 'endscreen' };
    }

    case 'RESTART': {
      return { ...initialState };
    }

    case 'TOGGLE_SOUND': {
      return { ...state, soundEnabled: !state.soundEnabled };
    }

    default:
      return state;
  }
}

// Add new action types
type ExtendedGameAction = GameAction
  | { type: 'DISMISS_IMPACT' }
  | { type: 'DISMISS_TIME_PASSING' };

function extendedReducer(state: GameState, action: ExtendedGameAction): GameState {
  return gameReducer(state, action as GameAction);
}

export function useGameState() {
  const [state, dispatch] = useReducer(extendedReducer, initialState);

  const selectArchetype = useCallback(
    (archetype: GameState['archetype']) => {
      if (archetype) dispatch({ type: 'SELECT_ARCHETYPE', archetype });
    },
    []
  );

  const startGame = useCallback(() => dispatch({ type: 'START_GAME' }), []);

  const makeChoice = useCallback(
    (choiceId: string) => dispatch({ type: 'MAKE_CHOICE', choiceId }),
    []
  );

  const dismissReveal = useCallback(
    () => dispatch({ type: 'DISMISS_REVEAL' }),
    []
  );

  const dismissImpact = useCallback(
    () => dispatch({ type: 'DISMISS_IMPACT' }),
    []
  );

  const dismissTimePassing = useCallback(
    () => dispatch({ type: 'DISMISS_TIME_PASSING' }),
    []
  );

  const dismissEvent = useCallback(
    (responseIndex: number) => dispatch({ type: 'DISMISS_EVENT', responseIndex }),
    []
  );

  const goToEndscreen = useCallback(
    () => dispatch({ type: 'GO_TO_ENDSCREEN' }),
    []
  );

  const restart = useCallback(() => dispatch({ type: 'RESTART' }), []);

  const toggleSound = useCallback(
    () => dispatch({ type: 'TOGGLE_SOUND' }),
    []
  );

  return {
    state,
    selectArchetype,
    startGame,
    makeChoice,
    dismissReveal,
    dismissImpact,
    dismissTimePassing,
    dismissEvent,
    goToEndscreen,
    restart,
    toggleSound,
  };
}
