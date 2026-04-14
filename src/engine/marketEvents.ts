import { GameState, MarketEvent, MarketCondition } from './types';
import gameData from '../data/gameData.json';

const allEvents = gameData.marketEvents as MarketEvent[];

export function getRandomMarketEvent(state: GameState): MarketEvent | null {
  const available = allEvents.filter(
    (e) => !state.usedMarketEvents.includes(e.id)
  );

  if (available.length === 0) return null;

  const index = Math.floor(Math.random() * available.length);
  return available[index];
}

export function getMarketConditionFromEvent(event: MarketEvent): MarketCondition {
  if (event.isNegative) return 'downturn';
  if (event.id === 'event-hot-market') return 'boom';
  return 'normal';
}

export function getMarketConditionFromHistory(usedEvents: string[]): MarketCondition {
  // Check last few events to determine market condition
  const recent = usedEvents.slice(-3);
  const recentEvents = recent
    .map((id) => allEvents.find((e) => e.id === id))
    .filter(Boolean) as MarketEvent[];

  const negativeCount = recentEvents.filter((e) => e.isNegative).length;
  const positiveCount = recentEvents.filter((e) => !e.isNegative).length;

  if (negativeCount >= 2) return 'downturn';
  if (positiveCount >= 2) return 'boom';
  return 'normal';
}
