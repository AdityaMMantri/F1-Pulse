import { useState } from 'react'
import { Link } from 'react-router'
import { driverPhotos } from '../media'
import { podiumClass, resultTeamStyle } from './format'
import '../styles/result-highlights.css'

export interface HighlightDriver {
  id: string; first: string; last: string; team: string; color: string; position: number
  time?: string | null; points: number
}
const podiumNames = ['Winner', 'Runner-up', 'Third place']

export function GrandPrixPodium({ drivers, race, pointsLabel="RACE PTS" }: { drivers: HighlightDriver[]; race: string; pointsLabel?: string }) {
  const [replay, setReplay] = useState(0)
  const winners = [1, 2, 3].map(p => drivers.find(d => d.position === p))
  if (winners.some(d => !d)) return null
  return <section className="gp-celebration" aria-label={`${race} Grand Prix podium`}>
    <div className="highlight-heading"><div><span className="eyebrow">THE GRAND PRIX PODIUM</span><h3>{race} · Final results</h3></div><button className="text-button replay-celebration" onClick={() => setReplay(n => n + 1)}>Replay ↻</button></div>
    <div key={replay} className="podium-stage">
      {[2, 1, 3].map(position => {
        const driver = winners[position - 1]!
        return <Link key={driver.id} className={`podium-person ${podiumClass(position)}`} to={'/drivers/' + driver.id} style={resultTeamStyle(driver.team,driver.color)} aria-label={`P${position}, ${driver.first} ${driver.last}, ${driver.team}`}>
          <div className="podium-portrait"><span className="podium-back-number" aria-hidden="true">0{position}</span>{driverPhotos[driver.id]?<img src={driverPhotos[driver.id]} alt="" width="240" height="260"/>:<span className="podium-initials">{driver.first[0]}{driver.last[0]}</span>}</div>
          <div className="podium-step"><span className="podium-medal">P{position}</span><small>{podiumNames[position - 1]}</small><strong><span>{driver.first}</span><b>{driver.last}</b></strong><span className="podium-team"><i />{driver.team}</span><span className="podium-points">{driver.points} <small>{pointsLabel}</small></span></div>
        </Link>
      })}
    </div><p className="podium-photo-note">Team colours at this event · Select a driver to explore their season.</p>
  </section>
}

export function QualifyingTopTen({ drivers }: { drivers: HighlightDriver[] }) {
  const topTen = drivers.filter(d => d.position >= 1 && d.position <= 10).sort((a, b) => a.position - b.position)
  if (!topTen.length) return null
  return <section className="qualifying-spotlight" aria-label="Qualifying top ten">
    <div className="highlight-heading"><div><span className="eyebrow">THE POLE SHOOTOUT</span><h3>Qualifying · Top 10</h3></div><span className="q3-badge">Q3 GROUP</span></div>
    <p>Top ten in the published qualifying classification. Grid penalties can change the race starting order. A dash means no Q3 time was published.</p>
    <ol className="q3-grid">{topTen.map(d => <li key={d.id}><Link to={'/drivers/' + d.id} style={resultTeamStyle(d.team,d.color)}>
      <span className="q3-position">P{d.position}</span>
      {driverPhotos[d.id] ? <img src={driverPhotos[d.id]} alt="" loading="lazy" width="44" height="48" /> : <span className="q3-initials" aria-hidden="true">{d.first[0]}{d.last[0]}</span>}
      <span className="q3-identity"><strong>{d.first} {d.last}</strong><small>{d.team}</small></span>
      <span className="q3-time">{d.time ?? '—'}<small>{d.position === 1 ? 'QUALIFYING P1' : 'Q3 TIME'}</small></span>
    </Link></li>)}</ol>
  </section>
}

export function SprintTopThree({ drivers }: { drivers: HighlightDriver[] }) {
  const top = drivers.filter(d => d.position >= 1 && d.position <= 3).sort((a, b) => a.position - b.position)
  if (!top.length) return null
  return <section className="sprint-highlights" aria-label="Sprint top three"><div className="highlight-heading"><div><span className="eyebrow">SPRINT / CLASSIFICATION</span><h3>Sprint finishers</h3></div></div><div className="sprint-top-three">{top.map(d => <Link key={d.id} className={podiumClass(d.position)} style={resultTeamStyle(d.team,d.color)} to={'/drivers/' + d.id}><span className="sprint-medal">P{d.position}</span><div><small>{podiumNames[d.position - 1]}</small><strong><span>{d.first}</span>{d.last}</strong><span>{d.team}</span></div><b>{d.points}<small>PTS</small></b></Link>)}</div></section>
}
