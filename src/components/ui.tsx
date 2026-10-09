import { Link } from 'react-router'
import type { ReactNode } from 'react'
import { type Driver, type Race, dateLabel } from '../data/season'
import { useSeason } from '../data/useSeason'
import { driverPhotos, teamLogos, circuitImages } from '../media'

export function Heading({ label, title, description }: { label: string; title: string; description: string }) {
  return <div className="page-heading"><div><div className="eyebrow">{label}</div><h1>{title}</h1><p>{description}</p></div></div>
}
export function Portrait({ driver, className = '', eager = false }: { driver: Driver; className?: string; eager?: boolean }) {
  return driverPhotos[driver.id] ? <img className={'portrait '+className} src={driverPhotos[driver.id]} alt={driver.first+' '+driver.last} width="640" height="640" loading={eager?'eager':'lazy'} decoding="async" />
    : <div className={'portrait missing-portrait '+className} role="img" aria-label={driver.first+' '+driver.last+' — portrait not supplied'}><b>{driver.number}</b><small>Portrait unavailable</small></div>
}
export function TeamLogo({ name }: { name: string }) {
  return teamLogos[name] ? <img className="team-logo" src={teamLogos[name]} alt={name+' logo'} width="80" height="80" loading="lazy" />
    : <span className="team-logo logo-fallback" title={name+' logo not supplied'} aria-label={name+' — logo unavailable'}>{name.split(' ').map(v=>v[0]).join('')}</span>
}
export function Track({ race }: { race: Race }) {
  return circuitImages[race.name] ? <img className="track track-image" src={circuitImages[race.name]} alt={race.name+' supplied circuit artwork'} width="640" height="880" loading="lazy" />
    : <div className="track-fallback"><span className="eyebrow">ROUND {String(race.round).padStart(2,'0')}</span><strong>{race.city}</strong><small>Circuit artwork not supplied</small></div>
}
export function Standings({ all = false }: { all?: boolean }) {
  const {drivers}=useSeason()
  return <div className="standings">{drivers.slice(0,all?drivers.length:5).map(d=><Link to={'/drivers/'+d.id} className="standing-row" key={d.id}><span className="rank">{d.position ? String(d.position).padStart(2,'0') : '—'}</span><Portrait driver={d} className="standing-photo" /><span className="driver-name">{d.first} <strong>{d.last}</strong><small><i style={{background:d.color}}/>{d.team}{d.reserve?' · Substitute':''}</small></span><span className="points">{d.points}<small>PTS</small></span><span className="row-arrow" aria-hidden="true">↗</span></Link>)}</div>
}
export function RaceCard({ race }: { race: Race }) {
  return <Link className="panel calendar-card" to={'/circuits/'+race.id}><span className="eyebrow">ROUND {race.round}<span className={race.completed?'':'upcoming'}>{race.completed?'COMPLETED':'UPCOMING'}</span></span><h2>{race.name}</h2><p>{race.city}</p><Track race={race}/><div className="race-card-date">{dateLabel(race.start)} — {dateLabel(race.end)} 2026</div><span className="text-link">Circuit & {race.completed?'results':'weekend'} ↗</span></Link>
}
export function SourceNote({ href, children }: { href: string; children?: ReactNode }) {
  const {dataLabel,live}=useSeason()
  return <p className="source-note">{children} {dataLabel}. <a href={live?"https://api.jolpi.ca/":href} target="_blank" rel="noreferrer">{live?"Results provider":"Snapshot source"} ↗</a></p>
}
export function NotFound() { return <div className="empty"><div className="eyebrow">OFF THE RACING LINE</div><h1>That page took a pit stop.</h1><Link to="/" className="button primary">Back to the dashboard</Link></div> }
