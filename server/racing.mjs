import { mkdir, readFile, writeFile, rename } from 'node:fs/promises'
import { dirname } from 'node:path'
import { setTimeout as pause } from 'node:timers/promises'

export const SEASON = 2026
export const INTERVAL = 15 * 60_000
const BASE = 'https://api.jolpi.ca/ergast/f1/'
const number = value => {
  if (value === undefined || value === null || value === '' || !Number.isFinite(Number(value))) throw new Error('Invalid provider number')
  return Number(value)
}
const text = value => {
  if (typeof value !== 'string' || !value.trim()) throw new Error('Invalid provider text')
  return value
}
const driver = d => ({ id: text(d.driverId), first: text(d.givenName), last: text(d.familyName), number: Number(d.permanentNumber) || 0, nationality: d.nationality || '' })
const constructor = c => ({ id: text(c.constructorId), name: text(c.name) })

// The provider paginates result ROWS, so a race can straddle two pages.
export async function fetchPages(endpoint, table, field, { fetcher = fetch, pace = 350, signal } = {}) {
  let offset = 0, expectedTotal
  const rows = []
  for (let page = 0; page < 30; page++) {
    await pause(pace, undefined, { signal })
    const response = await fetcher(`${BASE}${SEASON}/${endpoint}?limit=100&offset=${offset}`, {
      headers: { 'User-Agent': 'F1PulseHCI/1.0', Accept: 'application/json' },
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(12_000)]) : AbortSignal.timeout(12_000),
    })
    if (!response.ok) {
      const error = new Error(`Results provider returned HTTP ${response.status}`)
      const retry = response.headers.get('retry-after')
      error.retryAfter = retry ? (Number.isFinite(Number(retry)) ? Number(retry) * 1000 : Math.max(0, Date.parse(retry) - Date.now())) : 0
      throw error
    }
    const data = (await response.json()).MRData
    const total = number(data?.total), limit = number(data?.limit)
    if (total < 0 || limit < 1 || number(data?.offset) !== offset || !Array.isArray(data?.[table]?.[field])) throw new Error('Incomplete provider response')
    if (expectedTotal !== undefined && total !== expectedTotal) throw new Error('Provider changed during pagination; retrying next cycle')
    expectedTotal = total
    rows.push(...data[table][field])
    offset += limit
    if (offset >= total) return { rows, total }
  }
  throw new Error('Provider pagination exceeded safe limit')
}

function sessions(pages, key) {
  const result = [], seen = new Set()
  for (const race of pages.rows) for (const row of race[key] ?? []) {
    const d = driver(row.Driver), c = constructor(row.Constructor), round = number(race.round)
    d.number = Number(row.number) || d.number
    const identity = `${round}:${d.id}`
    if (seen.has(identity)) throw new Error('Duplicate session result')
    seen.add(identity)
    result.push({ round, driver: d, constructor: c, position: number(row.position), positionText: row.positionText || row.position,
      points: key === 'QualifyingResults' ? 0 : number(row.points), grid: row.grid === undefined ? null : number(row.grid),
      laps: row.laps === undefined ? null : number(row.laps), status: row.status || '', time: row.Time?.time || null,
      q1: row.Q1 || null, q2: row.Q2 || null, q3: row.Q3 || null, fastestLap: row.FastestLap?.Time?.time || null,
    })
  }
  if (result.length !== pages.total) throw new Error('Incomplete session pagination')
  return result.sort((a, b) => a.round - b.round || a.position - b.position)
}

export async function fetchSeason(options) {
  const calendarPage = await fetchPages('', 'RaceTable', 'Races', options)
  const race = sessions(await fetchPages('results/', 'RaceTable', 'Races', options), 'Results')
  const sprint = sessions(await fetchPages('sprint/', 'RaceTable', 'Races', options), 'SprintResults')
  const qualifying = sessions(await fetchPages('qualifying/', 'RaceTable', 'Races', options), 'QualifyingResults')
  const ds = await fetchPages('driverstandings/', 'StandingsTable', 'StandingsLists', options)
  const cs = await fetchPages('constructorstandings/', 'StandingsTable', 'StandingsLists', options)
  const calendar = calendarPage.rows.map(r => ({ round: number(r.round), name: text(r.raceName), circuitId: text(r.Circuit.circuitId),
    circuitName: text(r.Circuit.circuitName), date: text(r.date), start: r.FirstPractice?.date || r.date,
    time: r.time || null, sprintDate: r.Sprint?.date || null, qualifyingDate: r.Qualifying?.date || null,
  })).sort((a, b) => a.round - b.round)
  const driverStandings = ds.rows.flatMap(s => s.DriverStandings.map(d => ({ ...driver(d.Driver), position: number(d.position), points: number(d.points), wins: number(d.wins), constructors: d.Constructors.map(constructor) }))).sort((a, b) => a.position - b.position)
  const constructorStandings = cs.rows.flatMap(s => s.ConstructorStandings.map(c => ({ ...constructor(c.Constructor), position: number(c.position), points: number(c.points), wins: number(c.wins) }))).sort((a, b) => a.position - b.position)
  if (!calendar.length || calendar.length !== calendarPage.total || ds.total !== driverStandings.length || cs.total !== constructorStandings.length) throw new Error('Incomplete calendar or standings')
  if ((race.length || sprint.length) && (!driverStandings.length || !constructorStandings.length)) throw new Error('Standings temporarily unavailable')
  for (const row of [...race, ...sprint, ...qualifying]) if (!calendar.some(r => r.round === row.round)) throw new Error('Session missing from calendar')
  const driverRound = Number(ds.rows[0]?.round || 0), constructorRound = Number(cs.rows[0]?.round || 0)
  if (driverRound !== constructorRound) throw new Error('Standings are still being published')
  if (driverRound > 0 && !race.length && !sprint.length) throw new Error('Published season results temporarily unavailable')
  return { version: 1, season: SEASON, fetchedAt: new Date().toISOString(), standingsRound: driverRound,
    calendar, driverStandings, constructorStandings, sessions: { race, sprint, qualifying } }
}

export function validSnapshot(value) {
  return value?.version === 1 && value.season === SEASON && Number.isFinite(Date.parse(value.fetchedAt)) && Number.isFinite(value.standingsRound) &&
    Array.isArray(value.calendar) && value.calendar.length > 0 && Array.isArray(value.driverStandings) &&
    value.calendar.every(r => Number.isFinite(r.round) && typeof r.circuitId === 'string' && typeof r.circuitName === 'string' && Number.isFinite(Date.parse(r.date)) && Number.isFinite(Date.parse(r.start))) &&
    value.driverStandings.every(d => typeof d.id === 'string' && typeof d.first === 'string' && typeof d.last === 'string' && Number.isFinite(d.points) && Number.isFinite(d.position) && Array.isArray(d.constructors)) &&
    Array.isArray(value.constructorStandings) && value.constructorStandings.every(c => typeof c.id === 'string' && typeof c.name === 'string' && Number.isFinite(c.points)) &&
    ['race', 'sprint', 'qualifying'].every(k => Array.isArray(value.sessions?.[k]) && value.sessions[k].every(r => typeof r.driver?.id === 'string' && typeof r.constructor?.id === 'string' && typeof r.status === 'string' && Number.isFinite(r.points) && Number.isFinite(r.position) && Number.isFinite(r.round)))
}

export function createRacingService({ cacheFile, fetcher = fetch, pace = 350, now = Date.now } = {}) {
  let snapshot = null, pending = null, timer, stopped = false, lastError = null, lastAttempt = null, nextCheck = 0
  const controller = new AbortController()
  const ready = readFile(cacheFile, 'utf8').then(raw => { const data = JSON.parse(raw); if (validSnapshot(data)) snapshot = data }).catch(() => {})
  const state = () => ({ data: snapshot, meta: { provider: 'Jolpica F1', source: 'https://api.jolpi.ca/', intervalMinutes: 15,
    status: snapshot ? (lastError || now() - Date.parse(snapshot.fetchedAt) > INTERVAL * 2 ? 'stale' : 'current') : 'fallback',
    lastSuccess: snapshot?.fetchedAt || null, lastAttempt, nextCheck: nextCheck ? new Date(nextCheck).toISOString() : null,
    refreshing: !!pending, error: lastError,
  } })
  function refresh() {
    if (pending) return pending
    if (stopped || now() < nextCheck) return Promise.resolve(state())
    pending = (async () => {
      await ready
      lastAttempt = new Date(now()).toISOString()
      nextCheck = now() + INTERVAL
      try {
        const candidate = await fetchSeason({ fetcher, pace, signal: controller.signal })
        if (!validSnapshot(candidate)) throw new Error('Malformed season data')
        if (snapshot && candidate.standingsRound < snapshot.standingsRound) throw new Error('Provider returned older standings; keeping saved results')
        if (snapshot) for (const key of ['race', 'sprint', 'qualifying']) {
          for (const previous of snapshot.sessions[key]) {
            if (candidate.calendar.some(r => r.round === previous.round) && !candidate.sessions[key].some(r => r.round === previous.round && r.driver.id === previous.driver.id)) throw new Error('Published session rows temporarily missing; keeping saved results')
          }
        }
        await mkdir(dirname(cacheFile), { recursive: true })
        await writeFile(cacheFile + '.tmp', JSON.stringify(candidate))
        await rename(cacheFile + '.tmp', cacheFile)
        snapshot = candidate
        lastError = null
      } catch (error) {
        lastError = 'Update unavailable. Keeping the last successful data; retrying automatically.'
        nextCheck = now() + Math.max(INTERVAL, error.retryAfter || 0)
        if (!stopped) console.warn('Racing sync:', error.message)
      }
      return state()
    })().finally(() => { pending = null })
    return pending
  }
  return {
    ready, state, refresh,
    async start() { await ready; if (stopped) return; void refresh(); timer = setInterval(() => { void refresh() }, 30_000); timer.unref() },
    stop() { stopped = true; clearInterval(timer); controller.abort() },
  }
}
