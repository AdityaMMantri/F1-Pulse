import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'

import { useSearchParams } from 'react-router'

import { teams } from '../data/season'

import { Heading } from '../components/ui'

import { defaultDesign, arrangePanel, restoreDesign, presets, readLogo, storageKey, paintAreas, surfaces, sponsors, letteringImage, type Design, type Decal, type Finish, type Surface } from './design'

import type { View } from './Viewer'

import Fallback from './Fallback'

import { checkServer, saveServerDesign, loadServerDesign } from './api'
import './garage.css'

const Viewer=lazy(()=>import('./Viewer'))

class ViewerBoundary extends Component<{children:ReactNode;fallback:ReactNode},{failed:boolean}>{

  state={failed:false}

  static getDerivedStateFromError(){return {failed:true}}

  render(){return this.state.failed?this.props.fallback:this.props.children}

}

function supportsWebGL(){try{const c=document.createElement('canvas'),gl=c.getContext('webgl2');if(gl){gl.getExtension('WEBGL_lose_context')?.loseContext();return true}return false}catch{return false}}

export default function Garage(){

  const [params]=useSearchParams()

  const [serverState,setServerState]=useState('Checking server…'),[serverBusy,setServerBusy]=useState(false),[serverSaved,setServerSaved]=useState<string|null>(null)
  useEffect(()=>{let active=true;checkServer().then(()=>{if(active)setServerState('Server connected')}).catch(()=>{if(active)setServerState('Server offline · browser saves available')});return()=>{active=false}},[])

  const [savedDesign,setSavedDesign]=useState<string|null>(null)

  const [autoInk,setAutoInk]=useState(true)

  const [artworkMode,setArtworkMode]=useState<'replace'|'add'>('replace')

  const [newText,setNewText]=useState('YOUR BRAND'),[textInk,setTextInk]=useState('#ffffff'),[placement,setPlacement]=useState<Surface>('left')

  const [history,setHistory]=useState<Design[]>(()=>[{...defaultDesign,body:teams.find(t=>t.id===params.get('team'))?.color??defaultDesign.body}]),[index,setIndex]=useState(0)

  const design=history[index]
  const panelPaint=placement==='nose'?design.nose:placement.startsWith('engine')?design.engine:placement.startsWith('rear')?design.rearWing:design.accent
  const brightness=parseInt(panelPaint.slice(1,3),16)*.299+parseInt(panelPaint.slice(3,5),16)*.587+parseInt(panelPaint.slice(5,7),16)*.114
  const letteringInk=autoInk?(brightness>150?'#101820':'#ffffff'):textInk

  const [selected,setSelected]=useState(''),[view,setView]=useState<View>('Three-quarter'),[zoom,setZoom]=useState(1),[turn,setTurn]=useState(0),[webgl,setWebgl]=useState(supportsWebGL),[fallback,setFallback]=useState(false),[status,setStatus]=useState('Your design stays in this browser.'),[busy,setBusy]=useState(false),[reset,setReset]=useState(false)

  const exporter=useRef<null|(()=>string)>(null),fileInput=useRef<HTMLInputElement>(null)

  const decal=design.decals.find(d=>d.id===selected),is2d=fallback||!webgl

  function commit(next:Design){setHistory(h=>[...h.slice(0,index+1),next].slice(-50));setIndex(Math.min(index+1,49))}

  function patch(update:Partial<Design>){commit({...design,...update})}

  function updateDecal(update:Partial<Decal>){patch({decals:design.decals.map(d=>d.id===selected?{...d,...update}:d)})}

  function save(){try{localStorage.setItem(storageKey,JSON.stringify(design));setSavedDesign(JSON.stringify(design));setStatus('Design saved on this device. Uploaded logos stay local.')}catch{setStatus('Could not save: browser storage is unavailable or full. Export an image instead.')}}

  function load(){try{const raw=localStorage.getItem(storageKey)??localStorage.getItem('f1-pulse-design-v1');if(!raw){setStatus('No saved design yet. Save a design first.');return}const data=restoreDesign(JSON.parse(raw));if(!data)throw new Error();commit(data);setSavedDesign(JSON.stringify(data));setSelected('');setStatus('Saved design loaded. You can undo this change.')}catch{setStatus('Saved design could not be read. Your current design has not changed.')}}

  async function syncServer(action:'save'|'load'){
    setServerBusy(true);setBusy(true)
    try{
      if(action==='save'){const result=await saveServerDesign(design);setServerSaved(JSON.stringify(design));setStatus('Design saved to the server at '+new Date(result.savedAt).toLocaleTimeString()+'. It survives a server restart.')}
      else{const result=await loadServerDesign();commit(result.design);setSelected('');setServerSaved(JSON.stringify(result.design));setStatus('Server design loaded. Undo restores your previous design.')}
      setServerState('Server connected')
    }catch(error){setStatus(error instanceof Error?error.message:'Server unavailable. Start the project with npm run dev. Browser saves still work.')}
    finally{setServerBusy(false);setBusy(false)}
  }

  async function upload(file:File|undefined){if(!file)return;setBusy(true);try{const image=await readLogo(file);addMark(file.name.slice(0,80),image)}catch(e){setStatus(e instanceof Error?e.message:'Image could not be decoded. Choose another file.')}finally{setBusy(false);if(fileInput.current)fileInput.current.value=''}}

  function addMark(name:string,image:string,text?:string,ink?:string,mode=artworkMode){
    const panel=design.decals.filter(d=>d.surface===placement)
    const existing=mode==='replace'?(panel.find(d=>d.id===selected)??panel[panel.length-1]):undefined
    if(!existing&&(design.decals.length>=16||panel.length>=3)){setStatus('This panel has room for three separate items. Replace an item, remove one, or choose another surface.');return}
    const id=existing?.id??crypto.randomUUID()
    const item:Decal={id,name,image,text,ink,surface:placement,x:existing?.x??0,y:existing?.y??0,scale:existing?.scale??.4,rotation:existing?.rotation??0}
    const items=existing?design.decals.map(d=>d.id===id?item:d):[...design.decals,item]
    patch({decals:arrangePanel(items,placement)});setSelected(id);focusSurface(placement)
    setStatus(existing?name+' replaced the selected artwork. Other items are kept.':name+' added in a separate position. Select any item to edit or move it.')
  }

  function goStep(id:string){
    const target=document.getElementById(id),controls=target?.closest('details')
    if(!target||!controls)return
    controls.open=true
    if(window.matchMedia('(max-width:760px)').matches){target.scrollIntoView({block:'start'});return}
    controls.scrollIntoView({block:'start'})
    controls.scrollTop+=target.getBoundingClientRect().top-controls.getBoundingClientRect().top-85
  }

  function focusSurface(surface:Surface){setTurn(surface.endsWith('right')||surface==='right'?Math.PI:0);setView(surface==='nose'?'Top':'Side');setZoom(.85)}

  function duplicate(mirror=false){
    if(!decal||design.decals.length>=16)return
    const side=(mirror?(decal.surface.includes('left')?decal.surface.replace('left','right'):decal.surface.replace('right','left')):decal.surface) as Surface
    if(design.decals.filter(d=>d.surface===side).length>=3){setStatus('That panel already has three items. Choose another surface.');return}
    const copy={...decal,id:crypto.randomUUID(),name:decal.name+(mirror?' · mirrored':' · copy'),surface:side}
    patch({decals:arrangePanel([...design.decals,copy],side)});setSelected(copy.id);setPlacement(side);focusSurface(side);setStatus('Artwork copied to a separate position.')
  }

  function movePanel(surface:Surface){
    if(!decal)return
    if(surface!==decal.surface&&design.decals.filter(d=>d.surface===surface).length>=3){setStatus('That panel already has three items. Choose another surface.');return}
    patch({decals:arrangePanel(design.decals.map(d=>d.id===selected?{...d,surface}:d),surface)});setPlacement(surface);focusSurface(surface)
  }

  function exportImage(){try{if(!exporter.current){setStatus('The preview is still loading. Try export again shortly.');return}const url=exporter.current();const a=document.createElement('a');a.href=url;a.download=url.startsWith('data:image/svg')?'pulse-26-design.svg':'pulse-26-design.png';a.click();setStatus('Image exported. Check your browser downloads.')}catch{setStatus('Export failed. Switch to the 2D fallback and export an SVG instead.')}}

  useEffect(()=>{const handler=(e:KeyboardEvent)=>{if(!e.altKey||e.ctrlKey||e.metaKey||busy||(e.target as HTMLElement).closest('input,textarea,select,[contenteditable="true"]'))return
    if(e.key.toLowerCase()==='s'){e.preventDefault();save()}
    if(e.key.toLowerCase()==='z'){e.preventDefault();if(e.shiftKey&&index<history.length-1){setIndex(i=>i+1);setStatus('Change redone.')}else if(!e.shiftKey&&index>0){setIndex(i=>i-1);setStatus('Change undone.')}}
  };window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler)})

  const fallbackView=<Fallback design={design} exporter={exporter}/>

  return <><Heading label="THE GARAGE / PULSE 26" title="Your car. Your signature." description="A new silhouette for a new era. Sculpt your livery, place your sponsors, and own every angle."/>

    <div className="garage-toolbar"><nav className="task-steps" aria-label="Car customisation steps" data-hci="N2 · S8"><a href="#garage-paint" onClick={e=>{e.preventDefault();goStep('garage-paint')}}><b>01</b><span>Paint<small>Set the palette</small></span></a><a href="#garage-identity" onClick={e=>{e.preventDefault();goStep('garage-identity')}}><b>02</b><span>Identity<small>Make your mark</small></span></a><a href="#garage-artwork" onClick={e=>{e.preventDefault();goStep('garage-artwork')}}><b>03</b><span>Artwork<small>Place your sponsors</small></span></a></nav><div className="garage-progress"><strong>{savedDesign===JSON.stringify(design)?'Saved in this browser':serverSaved===JSON.stringify(design)?'Saved to server':'Unsaved design'}</strong><details className="garage-shortcuts"><summary>Keyboard shortcuts</summary><span><kbd>Alt+S</kbd> Save · <kbd>Alt+Z</kbd> Undo · <kbd>Alt+Shift+Z</kbd> Redo</span></details></div><div className="studio-actions" data-hci="N6 · S2 · S6"><div className="history-buttons"><button className="button secondary" disabled={index===0||busy} onClick={()=>{setIndex(i=>i-1);setStatus('Change undone.')}}>↶ Undo</button><button className="button secondary" disabled={index===history.length-1||busy} onClick={()=>{setIndex(i=>i+1);setStatus('Change redone.')}}>↷ Redo</button></div><div className="history-buttons"><button className="button secondary" onClick={save}>Save in browser</button><button className="button secondary" disabled={busy} onClick={load}>Load from browser</button><button className="button primary" onClick={exportImage}>Export image ↗</button></div></div></div>

    <p className="studio-status" role="status" aria-live="polite" data-hci="N3 · S3 · S4">{status}</p><div className="server-storage" data-hci="S3 · S4"><div><span className="storage-kicker">BACKUP & RESTORE</span><strong>Shared garage</strong><small>{serverState}{serverSaved===JSON.stringify(design)?' · Current design saved':''}</small></div><button className="button secondary" disabled={serverBusy||busy} onClick={()=>void syncServer('save')}>{serverBusy?'Working…':'Save to server'}</button><button className="button secondary" disabled={serverBusy||busy} onClick={()=>void syncServer('load')}>Load from server</button><small>One shared save, including artwork. Saving here replaces the previous server design.</small></div><div className="studio-layout"><section className="studio-stage panel" aria-label="Car design preview"><div className="studio-stage-label"><span className="eyebrow">PULSE 26 / {is2d?'2D LIVERY STUDY':'INTERACTIVE 3D CONCEPT'}</span><span>01 — DESIGN STUDIO</span></div><div className="aero-switch"><div><b>ACTIVE AERO</b><small>Inspect the front & rear wing flaps</small></div>{(['corner','straight'] as const).map(mode=><button key={mode} aria-pressed={design.aero===mode} onClick={()=>patch({aero:mode})}>{mode==='corner'?'Corner mode':'Straight mode'}</button>)}</div><div className="studio-canvas">{is2d?fallbackView:<ViewerBoundary fallback={<><p className="notice">3D could not start. The 2D editor remains available.</p>{fallbackView}</>}><Suspense fallback={<div className="viewer-loading" role="status">Preparing the 3D studio…</div>}><Viewer design={design} view={view} zoom={zoom} turn={turn} exporter={exporter} onSelect={id=>{setSelected(id);const item=design.decals.find(d=>d.id===id);if(item)setPlacement(item.surface)}} selected={selected} onFailure={()=>{setWebgl(false);setStatus('3D context was lost. Switched to the 2D editor.')}}/></Suspense></ViewerBoundary>}</div>

      <div className="view-controls" aria-label="Camera controls" data-hci="N4 · S7">{(['Three-quarter','Front','Rear','Side','Top'] as View[]).map(v=><button key={v} disabled={is2d} aria-pressed={view===v&&!is2d} onClick={()=>{setView(v);setTurn(0);setZoom(1)}}>{v}</button>)}</div><div className="view-controls"><button disabled={is2d} aria-label="Rotate car left" onClick={()=>setTurn(t=>t-.3)}>↶ Rotate</button><button disabled={is2d} aria-label="Rotate car right" onClick={()=>setTurn(t=>t+.3)}>Rotate ↷</button><button disabled={is2d} aria-label="Zoom in" onClick={()=>setZoom(v=>Math.max(.65,v-.1))}>＋</button><button disabled={is2d} aria-label="Zoom out" onClick={()=>setZoom(v=>Math.min(1.5,v+.1))}>−</button><button aria-pressed={is2d} disabled={!webgl} onClick={()=>{exporter.current=null;setFallback(v=>!v)}}>{is2d?'Try 3D viewer':'Use 2D fallback'}</button></div><p className="studio-hint">{is2d?'2D left-side preview. Your full design is still saved. SVG export available.':'Drag to orbit · Scroll or pinch to zoom · Camera buttons also work with a keyboard'}</p></section>

    <details className="studio-controls panel" open><summary><span className="studio-control-kicker">YOUR DESIGN, EVERY DETAIL</span>Livery workshop <span>Start with a palette. Make every surface yours.</span></summary><fieldset id="garage-paint" disabled={busy}><legend>01 / Paint lab</legend><p className="control-section-title">Choose your starting palette</p><div className="preset-grid">{presets.map(p=><button key={p.name} className="preset" aria-pressed={design.body===p.body&&design.accent===p.accent&&design.wing===p.wing} onClick={()=>patch({body:p.body,accent:p.accent,wing:p.wing,nose:p.body,engine:p.body,halo:p.wing,frontWing:p.wing,rearWing:p.wing})}><i style={{background:`linear-gradient(135deg,${p.body} 60%,${p.accent} 60%)`}}/>{p.name}</button>)}</div><p className="control-section-title">Fine-tune each surface</p><div className="paint-surface-grid">{paintAreas.map(([area,label])=><label className="color-control" key={area}><span>{label}</span><input aria-label={label+' colour'} type="color" value={design[area]} onChange={e=>patch({[area]:e.target.value})}/><code>{design[area].toUpperCase()}</code></label>)}</div><label>Paint finish<select value={design.finish} onChange={e=>patch({finish:e.target.value as Finish})}><option value="matte">Matte</option><option value="gloss">Gloss</option><option value="metallic">Metallic</option></select></label>{is2d&&<small>Finish is saved; material lighting requires the 3D viewer.</small>}<label>Tyre compound<select aria-label="Tyre compound" value={design.compound} onChange={e=>patch({compound:e.target.value as Design['compound']})}><option value="soft">Soft · red marking</option><option value="medium">Medium · yellow marking</option><option value="hard">Hard · white marking</option></select></label></fieldset>

      <fieldset id="garage-identity" disabled={busy}><legend>02 / Identity</legend><div className="identity-inputs"><label>Driver number<input aria-label="Driver number" inputMode="numeric" value={design.number} maxLength={2} onChange={e=>patch({number:e.target.value.replace(/\D/g,'').slice(0,2)})}/></label><label>Sidepod text<input aria-label="Custom car text" value={design.text} maxLength={24} onChange={e=>patch({text:e.target.value})}/></label></div><small>Up to 2 digits and 24 text characters. Base identity appears only on panels without custom artwork.</small></fieldset>

      <fieldset id="garage-artwork" data-hci="N5 · S5 · S8" disabled={busy}><legend>03 / Sponsor & text studio</legend><label>Place new artwork on<select aria-label="New artwork surface" value={placement} onChange={e=>{setPlacement(e.target.value as Surface);focusSurface(e.target.value as Surface)}}>{surfaces.map(v=><option value={v.id} key={v.id}>{v.name}</option>)}</select></label><label>Artwork action<select aria-label="Artwork action" value={artworkMode} onChange={e=>setArtworkMode(e.target.value as 'replace'|'add')}><option value="replace">Replace selected item on this panel</option><option value="add">Add another in a separate position</option></select></label><small>Up to three items per panel. New items are spaced automatically. Base identity text is hidden on panels with custom artwork.</small><div className="sponsor-library">{sponsors.map(sp=><button key={sp.name} disabled={artworkMode==='add'&&design.decals.length>=16} aria-label={'Add '+sp.name+' sponsor'} onClick={()=>addMark(sp.name,letteringImage(sp.name,sp.color,sp.tag))}><b style={{color:sp.color}}>{sp.name}</b><small>{sp.tag}</small></button>)}</div><small>Original fictional sponsors for your concept livery.</small><div className="custom-lettering"><label>Custom text<input aria-label="New decal text" maxLength={24} value={newText} onChange={e=>setNewText(e.target.value)}/></label><label className="color-control">Text colour<input type="color" aria-label="New text colour" value={letteringInk} onChange={e=>{setTextInk(e.target.value);setAutoInk(false)}}/></label><label><input type="checkbox" checked={autoInk} onChange={e=>setAutoInk(e.target.checked)}/> Automatic text contrast</label><button className="button secondary" disabled={!newText.trim()} onClick={()=>addMark(newText,letteringImage(newText,letteringInk),newText,letteringInk)}>Apply text</button><button className="text-button" disabled={!newText.trim()||design.decals.length>=16} onClick={()=>addMark(newText,letteringImage(newText,letteringInk),newText,letteringInk,'add')}>Add another text at a new position +</button></div><label className="upload-control">{busy?'Processing logo…':'Upload your own logo'}<input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" aria-label="Upload logo" onChange={e=>void upload(e.target.files?.[0])} disabled={busy||(artworkMode==='add'&&design.decals.length>=16)}/></label><small>PNG, JPEG or WebP · up to 2 MB / 4096 px · 16 decals max. Transparent PNG works best. Artwork stays in your browser unless you choose Save to server.</small>

      {design.decals.length>0&&<label>Selected decal<select aria-label="Selected decal" value={decal?.id??''} onChange={e=>{setSelected(e.target.value);const next=design.decals.find(d=>d.id===e.target.value);if(next){setPlacement(next.surface);focusSurface(next.surface)}}}><option value="">Choose a decal</option>{design.decals.map(d=><option key={d.id} value={d.id}>{surfaces.find(s=>s.id===d.surface)?.name} · {d.name}</option>)}</select></label>}

      {decal&&<div className="decal-controls"><div className="decal-selected"><img src={decal.image} alt="Selected artwork"/><span>{decal.name}</span></div>{decal.text!==undefined&&<><label>Edit lettering<input aria-label="Edit selected text" maxLength={24} value={decal.text} onChange={e=>updateDecal({text:e.target.value,name:e.target.value||'Text',image:letteringImage(e.target.value,decal.ink)})}/></label><label className="color-control">Lettering colour<input type="color" aria-label="Selected text colour" value={decal.ink??'#ffffff'} onChange={e=>updateDecal({ink:e.target.value,image:letteringImage(decal.text??'',e.target.value)})}/></label></>}<label>Surface<select aria-label="Decal surface" value={decal.surface} onChange={e=>{movePanel(e.target.value as Surface)}}>{surfaces.map(v=><option value={v.id} key={v.id}>{v.name}</option>)}</select></label>{(['x','y','scale','rotation'] as const).map((key,i)=><label key={key}>{['Horizontal position','Vertical position','Logo scale','Logo rotation'][i]}<output>{decal[key].toFixed(key==='rotation'?0:2)}{key==='rotation'?'°':''}</output><input type="range" aria-label={['Logo horizontal position','Logo vertical position','Logo scale','Logo rotation'][i]} min={[-1,-1,.12,-180][i]} max={[1,1,1.3,180][i]} step={[.01,.01,.01,1][i]} value={decal[key]} onChange={e=>updateDecal({[key]:Number(e.target.value)})}/></label>)}<small>Position is relative to the chosen panel. Large artwork is clipped at panel edges; smaller panels limit the visible size.</small><div className="decal-tools"><button className="button secondary" onClick={()=>{patch({decals:arrangePanel(design.decals,decal.surface)});setStatus('Items spaced apart on this panel.')}}>Auto-space this panel</button><button className="button secondary" disabled={design.decals.length>=16} onClick={()=>duplicate()}>Duplicate</button><button className="button secondary" disabled={design.decals.length>=16||decal.surface==='nose'} onClick={()=>duplicate(true)}>Mirror to other side</button><button className="text-button" onClick={()=>updateDecal({x:0,y:0,rotation:0})}>Centre artwork</button></div><button className="text-button danger" onClick={()=>{patch({decals:design.decals.filter(d=>d.id!==selected)});setSelected('');setStatus('Decal removed. Undo restores it.')}}>Remove selected decal</button></div>}</fieldset>

      <div className="reset-control" data-hci="N6 · S6 · S7">{reset?<><p>Reset this design? Your saved design is kept, and you can undo.</p><button className="button secondary" disabled={busy} onClick={()=>{commit({...defaultDesign,decals:[]});setSelected('');setReset(false);setStatus('Design reset.')}}>Confirm reset</button><button className="text-button" onClick={()=>setReset(false)}>Cancel</button></>:<button className="text-button" onClick={()=>setReset(true)}>Reset design</button>}</div></details></div>

    <p className="source-note">Original 2026-inspired model with a 3.4-unit wheelbase and 1.9-unit overall width, sculpted sidepods, exposed suspension, a halo and movable wing flaps. This is a visual concept, not a homologated or team-specific chassis. Sponsor presets are fictional. See the <a href="https://www.formula1.com/en/latest/article/everything-you-need-to-know-about-the-new-f1-rules-for-2026.48bv0VTxhIlhrQXmxercXk" target="_blank" rel="noreferrer">2026 design reference</a>. Browser saves are device-specific. Server saves persist in the local backend, independently of browser storage.</p></>

}

