import { drivers as seedDrivers, teams as seedTeams, races as seedRaces, type Driver, type Profile, type Race, type Team } from './season'

export interface Identity { id: string; first: string; last: string; number: number; nationality: string }
export interface ConstructorIdentity { id: string; name: string }
export interface SessionResult {
  round: number; driver: Identity; constructor: ConstructorIdentity; position: number; positionText: string
  points: number; grid: number | null; laps: number | null; status: string; time: string | null
  q1: string | null; q2: string | null; q3: string | null; fastestLap: string | null
}
export interface LiveSnapshot {
  version: 1; season: number; fetchedAt: string; standingsRound: number
  calendar: { round: number; name: string; circuitId: string; circuitName: string; date: string; start: string; time: string | null; sprintDate: string | null; qualifyingDate: string | null }[]
  driverStandings: (Identity & { position: number; points: number; wins: number; constructors: ConstructorIdentity[] })[]
  constructorStandings: (ConstructorIdentity & { position: number; points: number; wins: number })[]
  sessions: Record<'race' | 'sprint' | 'qualifying', SessionResult[]>
}
export interface FeedMeta {
  provider: string; status: 'current' | 'stale' | 'fallback'; lastSuccess: string | null; lastAttempt: string | null
  nextCheck: string | null; refreshing: boolean; error: string | null; intervalMinutes: number
}
const teamIds: Record<string, string> = { red_bull: 'red-bull', rb: 'racing-bulls', racing_bulls: 'racing-bulls', aston_martin: 'aston-martin' }
export const teamId = (id: string) => teamIds[id] ?? id.replaceAll('_', '-')
const driverIds: Record<string, string> = { max_verstappen: 'verstappen', arvid_lindblad: 'lindblad' }
export const driverId = (id: string) => driverIds[id] ?? id
const circuitIds: Record<string, string> = {
  albert_park: 'australia', shanghai: 'china', suzuka: 'japan', miami: 'miami', villeneuve: 'canada', monaco: 'monaco',
  catalunya: 'barcelona-catalunya', red_bull_ring: 'austria', silverstone: 'great-britain', spa: 'belgium', hungaroring: 'hungary',
  zandvoort: 'netherlands', monza: 'italy', madring: 'spain', madrid: 'spain', baku: 'azerbaijan', sepang: 'bahrain',
  bahrain: 'bahrain', marina_bay: 'singapore', americas: 'united-states', rodriguez: 'mexico', interlagos: 'brazil',
  vegas: 'las-vegas', las_vegas: 'las-vegas', losail: 'qatar', lusail: 'qatar', yas_marina: 'abu-dhabi',
}
const count = (rows: SessionResult[], test: (r: SessionResult) => boolean) => rows.filter(test).length
const sum = (rows: SessionResult[]) => rows.reduce((n, r) => n + r.points, 0)
const finished = (row: SessionResult) => ['Finished', 'Lapped'].includes(row.status) || /^\+\d+ Laps?$/.test(row.status)
const noStart = (row: SessionResult) => /did not start|did not qualify|withdrawn|failed to qualify/i.test(row.status)
export function finishLabel(row: SessionResult) {
  if (finished(row)) return String(row.position)
  if (noStart(row)) return 'DNS'
  if (/disqualified|excluded/i.test(row.status)) return 'DSQ'
  return 'DNF'
}
export function adaptSeason(live: LiveSnapshot) {
  const teams: Team[] = live.constructorStandings.map(c => {
    const seed = seedTeams.find(t => t.id === teamId(c.id))
    return { id: teamId(c.id), name: seed?.name ?? c.name, color: seed?.color ?? '#b7c4d8', points: c.points }
  })
  const races: Race[] = live.calendar.map(c => {
    const id = circuitIds[c.circuitId] ?? c.circuitId.replaceAll('_', '-')
    const seed = seedRaces.find(r => r.id === id)
    return { id, name: seed?.name ?? c.name.replace(/ Grand Prix$/, ''), city: c.circuitName, start: c.start, end: c.date,
      round: c.round, completed: live.sessions.race.some(r => r.round === c.round), source: `https://api.jolpi.ca/ergast/f1/2026/${c.round}/results/` }
  })
  // Results supply entrants even when standings have not caught up with a debut.
  const identities = new Map(live.driverStandings.map(d => [d.id, d]))
  for (const row of [...live.sessions.race, ...live.sessions.sprint, ...live.sessions.qualifying]) {
    if (!identities.has(row.driver.id)) identities.set(row.driver.id, { ...row.driver, position: 0, points: 0, wins: 0, constructors: [row.constructor] })
  }
  // Before any published classification, retain the roster but never its old points.
  if (!identities.size) for (const d of seedDrivers) identities.set(d.id, { id: d.id, first: d.first, last: d.last, number: d.number, nationality: d.country, position: 0, points: 0, wins: 0, constructors: [{ id: d.teamId, name: d.team }] })
  if (!teams.length) teams.push(...seedTeams.map(t => ({ ...t, points: 0 })))
  const drivers: Driver[] = [...identities.values()].map(d => {
    const id = driverId(d.id), seed = seedDrivers.find(s => s.id === id)
    const gp = live.sessions.race.filter(r => r.driver.id === d.id), sprint = live.sessions.sprint.filter(r => r.driver.id === d.id)
    const qualifying = live.sessions.qualifying.filter(r => r.driver.id === d.id)
    const lastAppearance = [...qualifying, ...sprint, ...gp].sort((a, b) => b.round - a.round)[0]
    const current = lastAppearance?.constructor ?? d.constructors.at(-1)
    const t = teams.find(t => t.id === teamId(current?.id ?? ''))
    const season: Profile['season'] = {
      races: gp.length, gpPoints: sum(gp), wins: count(gp, r => r.position === 1 && finished(r)),
      podiums: count(gp, r => r.position <= 3 && finished(r)), poles: count(qualifying, r => r.position === 1),
      top10: count(gp, r => r.position <= 10 && !/disqualified|excluded/i.test(r.status)),
      dnf: count(gp, r => !finished(r) && !noStart(r) && !/disqualified|excluded/i.test(r.status)),
      sprintRaces: sprint.length, sprintPoints: sum(sprint), sprintWins: count(sprint, r => r.position === 1 && finished(r)),
      sprintPodiums: count(sprint, r => r.position <= 3 && finished(r)),
    }
    return { id, first: seed?.first ?? d.first, last: seed?.last ?? d.last, number: lastAppearance?.driver.number || d.number || seed?.number || 0,
      country: seed?.country ?? d.nationality, teamId: t?.id ?? teamId(current?.id ?? 'unknown'), team: t?.name ?? current?.name ?? 'Unconfirmed',
      color: t?.color ?? '#b7c4d8', points: d.points, position: d.position, reserve: false,
      profile: { source: `https://api.jolpi.ca/ergast/f1/2026/drivers/${d.id}/results/`, season,
        career: seed?.profile.career ?? { entries: null, points: null, wins: null, podiums: null, poles: null, titles: null } },
      results: races.flatMap(r => {
        const result = gp.find(v => v.round === r.round), sprintResult = sprint.find(v => v.round === r.round)
        if (!result && !sprintResult) return []
        const eventTeam = result?.constructor ?? sprintResult!.constructor
        return [{ race: r.name, date: r.end, team: teams.find(t => t.id === teamId(eventTeam.id))?.name ?? eventTeam.name,
          position: result ? finishLabel(result) : 'Pending', points: (result?.points ?? 0) + (sprintResult?.points ?? 0) }]
      }),
    }
  }).sort((a, b) => (a.position || 999) - (b.position || 999))
  return { teams, races, drivers }
}
