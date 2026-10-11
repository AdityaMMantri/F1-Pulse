import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import type { Driver } from '../data/season'
import { teamStyle } from './format'
import { Portrait } from './ui'

function randomPair(ids: string[], previous: string[] = []) {
  // Avoid repeating either featured driver when the roster has enough choices.
  const pool = ids.length >= 4 ? ids.filter(id => !previous.includes(id)) : [...ids]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, 2)
}

export default function DriverShowcase({ drivers }: { drivers: Driver[] }) {
  const roster = drivers.map(d => d.id).sort().join(',')
  const [featured, setFeatured] = useState(() => randomPair(roster.split(',').filter(Boolean)))
  const [paused, setPaused] = useState(false)
  const pairingRef = useRef<HTMLDivElement>(null)
  const shuffle = useCallback(() => {
    setFeatured(previous => randomPair(roster.split(',').filter(Boolean), previous))
  }, [roster])

  useEffect(() => {
    if (paused) return
    const timer = window.setInterval(() => {
      if (!document.hidden) shuffle()
    }, 12_000)
    return () => window.clearInterval(timer)
  }, [paused, shuffle])

  const rivals = featured.map(id => drivers.find(d => d.id === id)).filter((d): d is Driver => !!d)
  const compareUrl = rivals.length === 2 ? `/compare?a=${rivals[0].id}&b=${rivals[1].id}` : '/compare'

  useLayoutEffect(() => {
    const pairing = pairingRef.current
    if (!pairing) return
    const positionVs = () => {
      const groups = Array.from(pairing.querySelectorAll<HTMLAnchorElement>(':scope > a'))
      if (groups.length !== 2) return
      const visibleBounds = groups.map(group => {
        const bounds = Array.from(group.querySelectorAll<HTMLElement>(':scope > .portrait, :scope > div:not(.portrait)')).map(element => element.getBoundingClientRect())
        return { left: Math.min(...bounds.map(rect => rect.left)), right: Math.max(...bounds.map(rect => rect.right)) }
      })
      const midpoint = (visibleBounds[0].right + visibleBounds[1].left) / 2
      pairing.style.setProperty('--rivalry-vs-left', `${midpoint - pairing.getBoundingClientRect().left}px`)
    }
    positionVs()
    const observer = new ResizeObserver(positionVs)
    observer.observe(pairing)
    pairing.querySelectorAll<HTMLElement>(':scope > a > *').forEach(element => observer.observe(element))
    return () => observer.disconnect()
  }, [featured])

  return <section className="compare-promo driver-showcase" aria-labelledby="rivalry-title" data-hci="N3 · N4 · S7">
    <span className="eyebrow">THE GRID, SIDE BY SIDE</span>
    <div className="rivalry-heading"><h2 id="rivalry-title">Two drivers. Endless matchups.</h2></div>
    <p>Different journeys. Different strengths. Find the story behind any two drivers.</p>
    <div ref={pairingRef} className="rivalry-drivers" aria-label="Featured driver pairing">
      {rivals.map(d => <Link to={'/drivers/' + d.id} key={d.id} style={teamStyle(d.color)}>
        <Portrait driver={d}/><div><small>{d.first}</small><strong>{d.last}</strong><span><i/>{d.team}</span></div>
        <b aria-hidden="true">{d.number}</b>
      </Link>)}
      <span className="rivalry-vs" aria-hidden="true">VS</span>
    </div>
    <div className="rivalry-topics" aria-label="Available comparisons"><span>Season form</span><span>Career milestones</span><span>Race by race</span></div>
    <div className="rivalry-footer">
      <Link to={compareUrl}>{rivals.length === 2 ? `Compare ${rivals[0].last} & ${rivals[1].last}` : 'Explore driver comparisons'} <span aria-hidden="true">↗</span></Link>
      <div className="rivalry-controls"><button type="button" onClick={shuffle}>New pairing <span aria-hidden="true">↻</span></button><button type="button" aria-label={paused ? 'Resume driver rotation' : 'Pause driver rotation'} aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? 'Resume' : 'Pause'}</button></div>
    </div>
  </section>
}
