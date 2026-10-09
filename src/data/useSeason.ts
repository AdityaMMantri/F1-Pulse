import { createContext, useContext } from 'react'
import { drivers, teams, races, updated } from './season'
import type { FeedMeta, LiveSnapshot } from './live'

export const initialMeta: FeedMeta = { provider: 'Jolpica F1', status: 'fallback', lastSuccess: null, lastAttempt: null, nextCheck: null, refreshing: true, error: null, intervalMinutes: 15 }
export const fallback = { drivers, teams, races }
export const SeasonContext = createContext({ ...fallback, live: null as LiveSnapshot | null, meta: initialMeta,
  dataLabel: `Bundled snapshot · ${updated}`, completed: races.filter(r => r.completed).length, standingsRound: 16, today: '' })
export const useSeason = () => useContext(SeasonContext)
