import { Link, useSearchParams } from 'react-router'
import { sources } from '../data/season'
import { useSeason } from '../data/useSeason'
import { Heading, Standings, TeamLogo, RaceCard, SourceNote } from '../components/ui'
export default function Season(){
  const {races,teams,standingsRound}=useSeason()
  const [p,setP]=useSearchParams(),tab=p.get('view')??'Drivers',filter=p.get('status')??'all'
  const change=(key:string,value:string)=>setP(v=>{v.set(key,value);return v},{replace:true})
  return <><Heading label="A YEAR ON THE LIMIT" title="The 2026 season." description="Standings and every race weekend. One clear view."/><div className="tabs" aria-label="Season view">{['Drivers','Constructors','Race calendar'].map(t=><button aria-pressed={t===tab} className={t===tab?'selected':''} onClick={()=>change('view',t)} key={t}>{t}</button>)}</div>
    {tab==='Drivers'?<section className="panel season-standings"><div className="section-title"><h2>Driver championship</h2><span className="eyebrow">STANDINGS ROUND {standingsRound}</span></div><Standings all/></section>:tab==='Constructors'?<section className="panel season-standings"><div className="section-title"><h2>Constructor championship</h2><span className="eyebrow">{teams.length} TEAMS</span></div>{teams.map((t,i)=><Link to={'/teams/'+t.id} className="constructor-row" key={t.id}><span className="rank">{i+1}</span><TeamLogo name={t.name}/><strong>{t.name}</strong><div><span style={{width:t.points/Math.max(...teams.map(t=>t.points),1)*100+'%',background:t.color}}/></div><b>{t.points}<small>PTS</small></b></Link>)}</section>:<><div className="toolbar"><label>Show weekends <select aria-label="Filter race weekends" value={filter} onChange={e=>change('status',e.target.value)}><option value="all">All weekends</option><option value="upcoming">Upcoming</option><option value="completed">Completed</option></select></label></div><div className="circuit-grid">{races.filter(r=>filter==='all'||r.completed===(filter==='completed')).map(r=><RaceCard key={r.id} race={r}/>)}</div></>}
    <SourceNote href={tab==='Constructors'?sources.teams:tab==='Drivers'?sources.drivers:sources.calendar}/></>
}
