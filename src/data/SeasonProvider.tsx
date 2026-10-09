import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { updated } from './season'
import { SeasonContext, useSeason, initialMeta, fallback } from './useSeason'
import { adaptSeason, type FeedMeta, type LiveSnapshot } from './live'

export function SeasonProvider({ children }: { children: ReactNode }) {
  const [live, setLive] = useState<LiveSnapshot | null>(null), [meta, setMeta] = useState(initialMeta)
  const [today,setToday]=useState(()=>new Date().toISOString().slice(0,10))
  useEffect(() => {
    let stopped = false, timer: ReturnType<typeof setTimeout>, request: AbortController | undefined
    async function check() {
      request = new AbortController()
      try {
        const response = await fetch('/api/racing/2026', { signal: AbortSignal.any([request.signal, AbortSignal.timeout(10_000)]) })
        if (!response.ok) throw new Error('API unavailable')
        const body = await response.json() as { data: LiveSnapshot | null; meta: FeedMeta }
        if (!body.meta || !['current', 'stale', 'fallback'].includes(body.meta.status)) throw new Error('Invalid season response')
        if (body.data) {
          if (body.data.version !== 1 || body.data.season !== 2026 || !body.data.calendar.length) throw new Error('Invalid season')
          adaptSeason(body.data) // Reject malformed data before replacing the displayed snapshot.
        }
        if (!stopped) { setToday(new Date().toISOString().slice(0,10)); if (body.data) setLive(body.data); setMeta(body.meta) }
        if (!stopped) timer = setTimeout(check, body.meta.refreshing ? 5000 : 60_000)
      } catch {
        if (!stopped) {
          setMeta(m => ({ ...m, status: m.lastSuccess ? 'stale' : 'fallback', refreshing: false, error: 'Backend unavailable. Showing saved data; reconnecting automatically.' }))
          timer = setTimeout(check, 30_000)
        }
      }
    }
    void check()
    return () => { stopped = true; clearTimeout(timer); request?.abort() }
  }, [])
  const value = useMemo(() => {
    const data = live ? adaptSeason(live) : fallback
    const timestamp = live ? new Date(live.fetchedAt).toLocaleString() : updated
    const dataLabel = live ? `${meta.status === 'current' ? 'Auto-updated' : 'Saved results'} · ${timestamp}` : `Bundled snapshot · ${updated}`
    return { ...data, live, meta, dataLabel, completed: data.races.filter(r => r.completed).length, standingsRound: live?.standingsRound ?? 16, today }
  }, [live, meta, today])
  return <SeasonContext.Provider value={value}>{children}</SeasonContext.Provider>
}

export function RacingStatus() {
  const { meta, live } = useSeason()
  const checked = live ? new Date(live.fetchedAt).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : updated
  const label = meta.refreshing ? 'Checking for results' : meta.status === 'current' ? 'Results up to date' : meta.status === 'stale' ? 'Showing saved results' : 'Season snapshot'
  return <div className={'racing-status '+meta.status} data-hci="N3 · S3">
    <span className="racing-status-dot" aria-hidden="true" />
    <div className="racing-status-summary" role="status"><strong>{label}</strong><span>{live ? 'Last synced' : 'As of'} {checked}</span>{meta.error && <small>{meta.error}</small>}</div>
    <details className="racing-status-details"><summary>About updates</summary><p>Published race and sprint results sync from Jolpica F1 every 15 minutes while the server runs. Saved results remain available between updates. <a href="https://api.jolpi.ca/" target="_blank" rel="noreferrer">View data source ↗</a></p></details>
  </div>
}
