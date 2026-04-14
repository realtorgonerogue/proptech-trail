import { GameState, Decision, Archetype } from './types';
import gameData from '../data/gameData.json';

interface TreeData {
  decisions: Decision[];
}

interface GameDataShape {
  trees: Record<string, TreeData>;
  debtDecision?: Decision;
}

const data = gameData as unknown as GameDataShape;

function getArchetypeDecisions(archetype: Archetype): Decision[] {
  const tree = data.trees[archetype];
  if (!tree) return [];
  return tree.decisions as Decision[];
}

function hasChosenDecision(state: GameState, decisionId: string): boolean {
  return state.choiceHistory.some((h) => h.decisionId === decisionId);
}

function getCurrentPhase(round: number): number {
  if (round <= 4) return 1;
  if (round <= 9) return 2;
  return 3;
}

export function getNextDecision(state: GameState): Decision | null {
  if (!state.archetype) return null;

  // 1. Check pending sub-decisions first
  if (state.pendingSubDecisions.length > 0) {
    const subId = state.pendingSubDecisions[0];
    const decisions = getArchetypeDecisions(state.archetype);
    const subDecision = decisions.find((d) => d.id === subId);
    if (subDecision) return subDecision;
    // Sub-decision not found — skip it
    return null;
  }

  // 2. Get the archetype's decision sequence
  const decisions = getArchetypeDecisions(state.archetype);

  // 3. Find next unplayed decision in order
  for (const decision of decisions) {
    if (hasChosenDecision(state, decision.id)) continue;

    // Check if this is a sub-decision (only fire if triggered)
    if (decision.isSubDecision && decision.triggeredBy) {
      // Only show if the triggering choice was made
      const wasTriggerMade = state.choiceHistory.some(
        (h) => h.choiceId === decision.triggeredBy
      );
      if (!wasTriggerMade) continue;
    }

    return decision;
  }

  // 4. No more decisions — game ends
  return null;
}

export function getSubDecisionTriggers(choiceId: string, archetype: Archetype): string[] {
  const decisions = getArchetypeDecisions(archetype);
  return decisions
    .filter((d) => d.triggeredBy === choiceId)
    .map((d) => d.id);
}

export function getDecisionById(id: string, archetype?: Archetype): Decision | null {
  // Check shared decisions first (debt decision)
  if (id === 'debt-decision' && data.debtDecision) {
    return data.debtDecision as Decision;
  }

  if (archetype) {
    const decisions = getArchetypeDecisions(archetype);
    return decisions.find((d) => d.id === id) || null;
  }
  // Search all trees
  for (const arch of ['portal', 'brokerage', 'fintech', 'infrastructure'] as Archetype[]) {
    const decisions = getArchetypeDecisions(arch);
    const found = decisions.find((d) => d.id === id);
    if (found) return found;
  }
  return null;
}

export function shouldTriggerMarketEvent(state: GameState): boolean {
  // Market events can hit at any phase — survival is constant
  if (state.round >= 10) return true;               // Phase 3: guaranteed
  if (state.round >= 5 && Math.random() < 0.35) return true;  // Phase 2: 35% chance
  if (state.round >= 3 && Math.random() < 0.1) return true;   // Phase 1: 10% chance (rare early disruption)
  return false;
}

export { getCurrentPhase };
