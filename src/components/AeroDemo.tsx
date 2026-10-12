import { useEffect, useId, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'

export default function AeroDemo({active}:{active:boolean}){
 const reduced=useReducedMotion()
 const [mode,setMode]=useState<'corner'|'straight'>('corner')
 const [playing,setPlaying]=useState(true)
 const [visible,setVisible]=useState(()=>!document.hidden)
 const arrow=useId()
 useEffect(()=>{
  const update=()=>setVisible(!document.hidden)
  document.addEventListener('visibilitychange',update)
  return()=>document.removeEventListener('visibilitychange',update)
 },[])
 useEffect(()=>{
  if(!active||!playing||reduced||!visible)return
  const timer=window.setTimeout(()=>setMode(current=>current==='corner'?'straight':'corner'),5000)
  return()=>window.clearTimeout(timer)
 },[active,playing,reduced,visible,mode])
 const moving=active&&playing&&!reduced&&visible
 const transition={duration:reduced?0:1.4,ease:'easeInOut' as const}
 return <div className="aero-demo" data-flowing={moving}>
  <div className="aero-mode-switch" role="group" aria-label="Illustrated wing mode">
   <button type="button" aria-pressed={mode==='corner'} onClick={()=>setMode('corner')}>Corner mode</button>
   <button type="button" aria-pressed={mode==='straight'} onClick={()=>setMode('straight')}>Straight mode</button>
   {!reduced&&<button className="aero-playback" type="button" onClick={()=>setPlaying(value=>!value)} aria-label={playing?'Pause wing animation':'Play wing animation'}>{playing?'Pause':'Play'} <span aria-hidden="true">{playing?'Ⅱ':'▷'}</span></button>}
  </div>
  <svg viewBox="0 0 560 240" role="img" aria-label={mode==='corner'?'Air flowing around a wing tilted for cornering grip':'Air flowing around a flatter wing for reduced drag'}>
   <defs><marker id={arrow} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#79d8c3"/></marker></defs>
   {[65,100,135,170].map((y,index)=>{
    const d=mode==='corner'?`M25 ${y} C170 ${y}, 240 ${y-45}, 330 ${y-15} S440 ${y+35}, 530 ${y+35}`:`M25 ${y} C170 ${y}, 240 ${y}, 330 ${y} S440 ${y}, 530 ${y}`
    return <g key={y}>
     <motion.path initial={false} animate={{d}} transition={transition} fill="none" stroke="#79d8c3" strokeWidth="1.2" opacity=".3" markerEnd={`url(#${arrow})`}/>
     <motion.path className="aero-flow" initial={false} animate={{d}} transition={transition} fill="none" stroke="#a4f5df" strokeWidth="2" strokeLinecap="round" strokeDasharray="15 55" style={{animationDelay:`${-index*.4}s`}}/>
    </g>
   })}
   <motion.g initial={false} animate={{rotate:mode==='corner'?-20:0}} transition={transition} style={{transformOrigin:'280px 120px'}}>
    <path d="M175 120 Q250 85 380 115 Q300 143 175 120" fill="#282d36" stroke="#ff8069" strokeWidth="2"/>
    <path d="M280 133 L280 185" stroke="#636c7c" strokeWidth="3"/>
   </motion.g>
   <text x="25" y="227" fill="#aab7c7" fontSize="12">AIRFLOW →</text><text x="340" y="227" fill="#ff9b89" fontSize="12">ILLUSTRATIVE WING PROFILE</text>
  </svg>
  <div className="aero-caption"><strong>{mode==='corner'?'More grip through the corner.':'Less drag along the straight.'}</strong><p>{mode==='corner'?'A steeper wing profile helps generate downforce, at the cost of more air resistance.':'A flatter wing profile reduces air resistance in designated zones.'}</p></div>
  <small>Concept illustration, not an aerodynamic simulation.</small>
 </div>
}
