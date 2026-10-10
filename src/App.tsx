import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { BrowserRouter, NavLink, Link, Route, Routes, useLocation } from 'react-router'
import { motion, useReducedMotion } from 'motion/react'
import Home from './pages/Home'
import { Drivers, DriverDetail } from './pages/Drivers'
import { Teams, TeamDetail } from './pages/Teams'
import { Circuits, CircuitDetail } from './pages/Circuits'
import Season from './pages/Season'
import Compare from './pages/Compare'
import Learn from './pages/Learn'
import Icon from './components/Icon'
import { NotFound } from './components/ui'
import { SeasonProvider, RacingStatus } from './data/SeasonProvider'
import { useSeason } from './data/useSeason'
import HciGuide from './components/HciGuide'
import './styles/hci.css'
import './App.css'
import './styles/refinements.css'
import './styles/editorial.css'
const Garage = lazy(()=>import('./garage/Garage'))
const navItems = [['/', 'home', 'Overview'], ['/drivers', 'drivers', 'Drivers'], ['/teams', 'teams', 'Teams'], ['/compare', 'compare', 'Compare'], ['/season', 'season', 'Season'], ['/circuits', 'circuits', 'Circuits'], ['/cars', 'cars', 'Garage']]
function Search(){
  const {drivers,teams,races}=useSeason()
  const [query,setQuery]=useState(''),[open,setOpen]=useState(false)
  const root=useRef<HTMLDivElement>(null),input=useRef<HTMLInputElement>(null)
  useEffect(()=>{const shortcut=(e:KeyboardEvent)=>{const target=e.target as HTMLElement;if(e.key==='/'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!target.closest('input,textarea,select,[contenteditable="true"]')){e.preventDefault();input.current?.focus()}};window.addEventListener('keydown',shortcut);return()=>window.removeEventListener('keydown',shortcut)},[])
  const results=[...drivers.map(d=>({name:d.first+' '+d.last,kind:d.team,url:'/drivers/'+d.id})),...teams.map(t=>({name:t.name,kind:'Team',url:'/teams/'+t.id})),...races.map(r=>({name:r.name+' · '+r.city,kind:'Circuit',url:'/circuits/'+r.id}))].filter(r=>r.name.toLowerCase().includes(query.trim().toLowerCase())).slice(0,7)
  const expanded=open&&!!query.trim()
  return <div ref={root} className="global-search" data-hci="N1 · S2 · S8" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setOpen(false)}} onKeyDown={e=>{if(e.key==='Escape'){setOpen(false);input.current?.focus()}if(e.key==='ArrowDown'&&e.target===input.current){e.preventDefault();root.current?.querySelector<HTMLAnchorElement>('a')?.focus()}}}><Icon name="search" size={18}/><input ref={input} aria-label="Search drivers, teams and circuits" aria-expanded={expanded} aria-controls={expanded?'global-search-results':undefined} value={query} onFocus={()=>setOpen(true)} onChange={e=>{setQuery(e.target.value);setOpen(true)}} placeholder="Search the grid…"/><kbd className="search-shortcut" aria-hidden="true">/</kbd>{query&&<button className="search-clear" aria-label="Clear search" onClick={()=>{setQuery('');input.current?.focus()}}>×</button>}{expanded&&<div className="search-results" id="global-search-results"><span className="eyebrow" role="status">{results.length?'QUICK RESULTS':'NO MATCHES'}</span>{results.map(r=><Link to={r.url} key={r.url} onClick={()=>{setQuery('');setOpen(false)}}><span>{r.name}<small>{r.kind}</small></span><span>↗</span></Link>)}{!results.length&&<p>Try a name, team or circuit, such as “Monaco”.</p>}</div>}</div>
}
function Shell(){
  const {dataLabel}=useSeason()
  const location=useLocation(),reduced=useReducedMotion()
  const [hci,setHci]=useState(false)
  const [menu,setMenu]=useState(false),button=useRef<HTMLButtonElement>(null),nav=useRef<HTMLElement>(null)
  useEffect(()=>{
    document.title=(location.pathname==='/learn'?'F1 explained':navItems.find(([to])=>to!=='/'&&location.pathname.startsWith(to))?.[2]??'Overview')+' · F1 Pulse'
    window.scrollTo({top:0,behavior:'instant'})
    document.getElementById('main')?.focus({preventScroll:true})
  },[location.pathname])
  function toggle(){setMenu(v=>!v);if(!menu)requestAnimationFrame(()=>nav.current?.querySelector('a')?.focus())}
  return <div className={'app-shell'+(hci?' hci-active':'')} onKeyDown={e=>{if(e.key==='Escape'&&hci)setHci(false);if(e.key==='Escape'&&menu){setMenu(false);button.current?.focus()}}}><a className="skip-link" href="#main">Skip to content</a><header className="site-header"><div className="header-inner"><Link to="/" className="brand" aria-label="F1 Pulse home" onClick={()=>setMenu(false)}><img src="/favicon.svg" width="32" height="32" alt=""/>F1<span>PULSE</span><i/></Link><span className="header-divider"/><span className="header-tagline">YOUR RACING UNIVERSE</span><Search key={location.pathname}/><Link className="learn-link" to="/learn"><Icon name="book" size={17}/><span>F1 explained</span></Link><button className="hci-toggle" aria-pressed={hci} onClick={()=>setHci(v=>!v)}>HCI highlights {hci?'on':'off'}</button><button ref={button} className="menu-button" aria-label={menu?'Close navigation':'Open navigation'} aria-expanded={menu} aria-controls="primary-navigation" onClick={toggle}><Icon name="menu"/></button></div><div className={'nav-row '+(menu?'is-open':'')}><nav ref={nav} id="primary-navigation" data-hci="N7 · S1" aria-label="Main navigation">{navItems.map(([to,icon,label])=><NavLink to={to} end={to==='/'} key={to} onClick={()=>setMenu(false)}><Icon name={icon} size={17}/><span>{label}</span>{to==='/compare'&&<small>VS</small>}</NavLink>)}</nav><span className="nav-season"><i/>2026 SEASON</span></div></header>
    <main id="main" tabIndex={-1}><RacingStatus/>{hci&&<HciGuide close={()=>setHci(false)}/>}<motion.div key={location.pathname} initial={reduced?false:{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{duration:.18}}><Routes><Route path="/" element={<Home/>}/><Route path="/drivers" element={<Drivers/>}/><Route path="/drivers/:id" element={<DriverDetail/>}/><Route path="/teams" element={<Teams/>}/><Route path="/teams/:id" element={<TeamDetail/>}/><Route path="/season" element={<Season/>}/><Route path="/circuits" element={<Circuits/>}/><Route path="/circuits/:id" element={<CircuitDetail/>}/><Route path="/compare" element={<Compare/>}/><Route path="/cars" element={<Suspense fallback={<div className="empty" role="status">Opening the design studio…</div>}><Garage/></Suspense>}/><Route path="/learn" element={<Learn/>}/><Route path="*" element={<NotFound/>}/></Routes></motion.div><footer><Link to="/" className="footer-brand">F1<span>PULSE</span><i/></Link><span>{dataLabel}</span><Link to="/learn">Independent student project · F1 explained ↗</Link></footer></main></div>
}
export default function App(){return <SeasonProvider><BrowserRouter><Shell/></BrowserRouter></SeasonProvider>}



