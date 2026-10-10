import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve, sep } from 'node:path'
import { createRacingService, fetchSeason, INTERVAL } from '../../server/racing.mjs'
import { createApi } from '../../server/index.mjs'

const Driver = { driverId: 'max_verstappen', givenName: 'Max', familyName: 'Verstappen', permanentNumber: '3', nationality: 'Dutch' }
const Constructor = { constructorId: 'red_bull', name: 'Red Bull' }
const row = (id, position, points, extra = {}) => ({ Driver: { ...Driver, driverId: id }, Constructor, position: String(position), positionText: String(position), points: String(points), grid: '1', laps: '50', status: 'Finished', ...extra })

// Two-row pages deliberately split the same race across pages.
export function providerFixture() {
  const calendar = [1, 2].map(round => ({ season: '2026', round: String(round), raceName: round === 1 ? 'Australian Grand Prix' : 'Chinese Grand Prix', date: `2026-03-${round === 1 ? '08' : '15'}`,
    Circuit: { circuitId: round === 1 ? 'albert_park' : 'shanghai', circuitName: 'Test circuit' }, Sprint: round === 2 ? { date: '2026-03-14' } : undefined }))
  let calls = 0, failure = false, changed = false
  const results = { Results: [row('max_verstappen', 1, 25), row('norris', 2, 18), row('rookie', 3, 15)], SprintResults: [row('max_verstappen', 1, 8), row('norris', 2, 7)], QualifyingResults: [row('max_verstappen', 1, 0, { Q3: '1:20.123' }), row('norris', 2, 0)] }
  return {
    get calls() { return calls }, fail() { failure = true }, recover() { failure = false; changed = true },
    fetcher: async url => {
      calls++
      if (failure) return new Response('{}', { status: 429, headers: { 'Retry-After': '1800' } })
      const path = new URL(url), offset = Number(path.searchParams.get('offset')), limit = 2
      const endpoint = path.pathname.split('/').at(-2)
      const payload = (total, table) => Response.json({ MRData: { total: String(total), limit: String(limit), offset: String(offset), ...table } })
      if (endpoint === '2026') return payload(calendar.length, { RaceTable: { Races: calendar.slice(offset, offset + limit) } })
      if (endpoint === 'driverstandings') {
        const all = ['max_verstappen', 'norris', 'rookie'].map((id, i) => ({ Driver: { ...Driver, driverId: id }, Constructors: [Constructor], position: String(i + 1), points: String(i ? 18 : changed ? 34 : 33), wins: i ? '0' : '1' }))
        return payload(all.length, { StandingsTable: { StandingsLists: [{ round: '2', DriverStandings: all.slice(offset, offset + limit) }] } })
      }
      if (endpoint === 'constructorstandings') return payload(1, { StandingsTable: { StandingsLists: [{ round: '2', ConstructorStandings: [{ Constructor, position: '1', points: '60', wins: '1' }] }] } })
      const key = { results: 'Results', sprint: 'SprintResults', qualifying: 'QualifyingResults' }[endpoint]
      const all = results[key]
      return payload(all.length, { RaceTable: { Races: [{ ...calendar[key === 'SprintResults' ? 1 : 0], [key]: all.slice(offset, offset + limit) }] } })
    },
  }
}

test('all pages are merged, sprint-only weekends stay separate, standings are not recomputed', async () => {
  const fixture = providerFixture(), data = await fetchSeason({ fetcher: fixture.fetcher, pace: 0 })
  assert.equal(data.sessions.race.length, 3)
  assert.equal(data.sessions.race[2].driver.id, 'rookie')
  assert.equal(data.sessions.sprint[0].round, 2)
  assert.equal(data.sessions.qualifying[0].q3, '1:20.123')
  assert.equal(data.driverStandings.length, 3)
  assert.equal(data.driverStandings[0].points, 33)
  assert.equal(data.constructorStandings[0].points, 60)
})

test('sync is deduplicated, atomic, persistent, backs off, recovers and is served through the API', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'pulse-racing-'))
  const cacheFile = join(directory, 'racing.json'), fixture = providerFixture()
  let clock = Date.now(), service, server
  try {
    service = createRacingService({ cacheFile, fetcher: fixture.fetcher, pace: 0, now: () => clock })
    await service.ready
    assert.equal(service.state().meta.status, 'fallback')
    const first = service.refresh(), second = service.refresh()
    assert.equal(first, second)
    await first
    assert.equal(service.state().meta.status, 'current')
    const saved = await readFile(cacheFile, 'utf8'), calls = fixture.calls
    await service.refresh()
    assert.equal(fixture.calls, calls, 'polling is throttled')
    fixture.fail(); clock += INTERVAL + 1
    await service.refresh()
    assert.equal(service.state().meta.status, 'stale')
    assert.equal(await readFile(cacheFile, 'utf8'), saved, 'failed sync never overwrites cache')
    assert.ok(Date.parse(service.state().meta.nextCheck) - clock >= 1800_000)
    service.stop()
    service = createRacingService({ cacheFile, fetcher: fixture.fetcher, pace: 0, now: () => clock })
    await service.ready
    assert.equal(service.state().data.driverStandings[0].points, 33, 'restart restores last good data')
    fixture.recover(); await service.refresh()
    assert.equal(service.state().data.driverStandings[0].points, 34)
    server = createApi({ racingService: service, dataFile: join(directory, 'garage.json') })
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/racing/2026`)
    assert.equal(response.status, 200)
    assert.equal((await response.json()).data.driverStandings[0].points, 34)
  } finally {
    service?.stop()
    if (server?.listening) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)) }
    assert.ok(resolve(directory).startsWith(resolve(tmpdir()) + sep + 'pulse-racing-'))
    await rm(directory, { recursive: true, force: true })
  }
})

test('malformed or truncated responses are rejected instead of publishing partial data', async () => {
  await assert.rejects(fetchSeason({ pace: 0, fetcher: async () => Response.json({ MRData: { total: '1', limit: '100', offset: '0', RaceTable: { Races: [] } } }) }))
  const fixture = providerFixture()
  await assert.rejects(fetchSeason({ pace: 0, fetcher: async (url, options) => {
    const response = await fixture.fetcher(url, options)
    if (url.includes('/results/')) {
      const body = await response.json()
      body.MRData.RaceTable.Races[0].Results[0].points = 'broken'
      return Response.json(body)
    }
    return response
  } }), /Invalid provider number/)
})

test('frontend adapter preserves artwork IDs, event points and sprint-only results without inventing a GP finish', async () => {
  const { createServer } = await import('vite')
  const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' })
  try {
    const { adaptSeason, finishLabel, driverId } = await vite.ssrLoadModule('/src/data/live.ts')
    const fixture = providerFixture(), snapshot = await fetchSeason({ fetcher: fixture.fetcher, pace: 0 })
    const { latestRecap } = await vite.ssrLoadModule('/src/data/overview.ts')
    assert.equal(latestRecap(null).winner, undefined)
    const firstRecap = latestRecap(snapshot)
    assert.equal(firstRecap.session, 'sprint')
    assert.equal(firstRecap.round, 2)
    const updated = structuredClone(snapshot)
    updated.sessions.race.push({ ...snapshot.sessions.race[0], round: 2, driver: { ...snapshot.sessions.race[0].driver, id: 'new_winner', last: 'Changed winner' } })
    const nextRecap = latestRecap(updated)
    assert.equal(nextRecap.session, 'race')
    assert.equal(nextRecap.winner.driver.last, 'Changed winner', 'recap changes with incoming race data')
    assert.equal(latestRecap(snapshot).session, 'sprint', 'selection does not mutate provider data')
    const data = adaptSeason(snapshot)
    const max = data.drivers.find(d => d.id === 'verstappen')
    assert.equal(max.teamId, 'red-bull')
    assert.equal(max.profile.season.gpPoints, 25)
    assert.equal(max.profile.season.sprintPoints, 8)
    assert.equal(max.profile.season.wins, 1)
    assert.equal(max.profile.season.sprintWins, 1)
    assert.equal(max.profile.season.poles, 1)
    assert.equal(max.results[1].position, 'Pending')
    assert.equal(max.results[1].points, 8)
    assert.equal(data.races[1].completed, false)
    assert.equal(data.teams[0].points, 60, 'never sum current driver points into team standings')
    assert.equal(data.drivers.find(d => d.id === 'rookie').profile.career.wins, null)
    assert.equal(finishLabel({ status: 'Engine', position: 19 }), 'DNF')
    assert.equal(finishLabel({ status: '+1 Lap', position: 12 }), '12')
    assert.equal(finishLabel({ status: 'Lapped', position: 12 }), '12')
    assert.equal(driverId('arvid_lindblad'), 'lindblad')
    assert.equal(finishLabel({ status: 'Did not start', position: 20 }), 'DNS')
    assert.equal(finishLabel({ status: 'Disqualified', position: 22 }), 'DSQ')
    const preSeason = adaptSeason({ ...snapshot, driverStandings: [], constructorStandings: [], sessions: { race: [], sprint: [], qualifying: [] } })
    assert.ok(preSeason.drivers.length >= 2)
    assert.ok(preSeason.drivers.every(d => d.points === 0 && d.position === 0 && d.results.length === 0))
  } finally { await vite.close() }
})
