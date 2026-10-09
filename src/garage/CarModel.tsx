import { useEffect, useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { BufferGeometry, Float32BufferAttribute, CanvasTexture, TextureLoader, SRGBColorSpace, DoubleSide, Mesh, Euler, Vector2, Vector3, Quaternion, CatmullRomCurve3, TubeGeometry, Shape, ExtrudeGeometry, LatheGeometry } from 'three'
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js'
import { letteringImage, type Design, type Decal, type Surface } from './design'
type V3=[number,number,number]
type Section=[number,number,number,number,number?]
const carbon='#111820'
// Section-lofted, closed bodywork; longitudinal axis is X, front is +X.
function loft(control:Section[],squared=false){
 const sections:Section[]=[]
 // Interpolate longitudinal sections so the silhouette has continuous curvature.
 const curve=new CatmullRomCurve3(control.map(s=>new Vector3(s[0],s[1],s[2])),false,'centripetal')
 const lower=new CatmullRomCurve3(control.map(s=>new Vector3(s[0],s[3],s[4]??0)),false,'centripetal')
 for(let i=0;i<=96;i++){const a=curve.getPoint(i/96),b=lower.getPoint(i/96);sections.push([a.x,a.y,Math.max(.005,a.z),Math.max(.005,b.y),b.z])}
 const positions:number[]=[],indices:number[]=[],rings=sections.length,segments=48
 sections.forEach(([x,y,w,h,z=0])=>{for(let i=0;i<=segments;i++){const t=i/segments*Math.PI*2;const s=Math.sin(t),c=Math.cos(t),p=squared?.65:1;positions.push(x,y+Math.sign(s)*Math.abs(s)**p*h,z+Math.sign(c)*Math.abs(c)**p*w)}})
 for(let j=0;j<rings-1;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+segments+1;indices.push(a,b,a+1,b,b+1,a+1)}
 for(const end of [0,rings-1]){const [x,y,,,z=0]=sections[end];const center=positions.length/3;positions.push(x,y,z);for(let i=0;i<segments;i++){const a=end*(segments+1)+i;indices.push(...(end===0?[center,a,a+1]:[center,a+1,a]))}}
 const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g
}
function Rod({from,to,r=.018,color=carbon}:{from:V3;to:V3;r?:number;color?:string}){const a=new Vector3(...from),b=new Vector3(...to),delta=b.clone().sub(a);const q=new Quaternion().setFromUnitVectors(new Vector3(0,1,0),delta.clone().normalize());return <mesh position={a.add(b).multiplyScalar(.5)} quaternion={q} castShadow><cylinderGeometry args={[r,r,delta.length(),10]}/><meshStandardMaterial color={color} roughness={.45} metalness={.35}/></mesh>}
function Tube({points,r,color}:{points:V3[];r:number;color:string}){const geometry=useMemo(()=>new TubeGeometry(new CatmullRomCurve3(points.map(p=>new Vector3(...p))),48,r,10,false),[points,r]);useEffect(()=>()=>geometry.dispose(),[geometry]);return <mesh geometry={geometry} castShadow><meshStandardMaterial color={color} roughness={.28} metalness={.35}/></mesh>}
function Wing({position,chord,span,color,angle=0,rear=false}:{position:V3;chord:number;span:number;color:string;angle?:number;rear?:boolean}){
 const geo=useMemo(()=>{
  const vertices:number[]=[],indices:number[]=[],rows=80,around=48
  for(let j=0;j<=rows;j++){
   const z=(j/rows-.5)*span,u=Math.abs(z)/(span/2)
   const sweep=rear?.025*u*u:-.20*u*u
   const rise=rear?.065*u*u:.10*Math.sin(u*Math.PI*.85)**2
   const taper=rear?1-.08*u:1-.24*u*u
   for(let i=0;i<=around;i++){
    const theta=i/around*Math.PI*2,t=(1-Math.cos(theta))/2
    const thickness=5*.095*(.2969*Math.sqrt(t)-.126*t-.3516*t*t+.2843*t**3-.1036*t**4)
    const px=(.5-t)*chord*taper,py=(.035*Math.sin(Math.PI*t)+Math.sign(Math.sin(theta))*thickness)*chord
    vertices.push(sweep+px*Math.cos(angle)-py*Math.sin(angle),rise+px*Math.sin(angle)+py*Math.cos(angle),z)
   }
  }
  for(let j=0;j<rows;j++)for(let i=0;i<around;i++){const a=j*(around+1)+i,b=a+around+1;indices.push(a,a+1,b,b,a+1,b+1)}
  const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return g
 },[chord,span,angle,rear]);useEffect(()=>()=>geo.dispose(),[geo]);return <mesh geometry={geo} position={position} castShadow><meshStandardMaterial color={color} roughness={.34} metalness={.2} side={DoubleSide}/></mesh>
}
function plate(points:[number,number][],z:number,thickness=.018){const s=new Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();const g=new ExtrudeGeometry(s,{depth:thickness,bevelEnabled:true,bevelThickness:.006,bevelSize:.008,bevelSegments:3,steps:1});g.translate(0,0,z-thickness/2);g.computeVertexNormals();return g}
// Closed sidepod skin with an actual open intake and a recessed duct.
// The mouth and the painted front surround share vertices: no floating discs.
function sidepod(side:number){
 const stations=new CatmullRomCurve3([
  new Vector3(-1.52,.30,.24),new Vector3(-1.24,.36,.36),
  new Vector3(-.90,.44,.51),new Vector3(-.48,.54,.62),
  new Vector3(-.06,.63,.665),new Vector3(.30,.675,.65),new Vector3(.59,.66,.625)
 ],false,'centripetal')
 const vertices:number[]=[],indices:number[]=[],rows=88,around=80
 const frontX=(y:number)=>.59-.29*Math.max(0,(.49-y)/.34)**1.2
 const append=(a:number,b:number,c:number)=>indices.push(...(side>0?[a,b,c]:[a,c,b]))
 for(let j=0;j<=rows;j++){
  const {x,y:top,z:outer}=stations.getPoint(j/rows),bottom=.148,inner=.105
  const channel=.062*Math.sin(Math.PI*j/rows)**.7
  // Inboard join, shallow waterslide, raised outer shoulder, sculpted undercut.
  const section=new CatmullRomCurve3([
   new Vector3(0,bottom,inner),new Vector3(0,top-.055,inner),
   new Vector3(0,top-.035,outer*.43),new Vector3(0,top-.025-channel,outer*.66),
   new Vector3(0,top,outer*.90),new Vector3(0,top-.052,outer),
   new Vector3(0,top-.16,outer*.975),new Vector3(0,bottom+.095,outer*.76),
   new Vector3(0,bottom+.022,outer*.57)
  ],true,'centripetal')
  for(let i=0;i<=around;i++){
   const p=section.getPoint(i/around)
   const setback=(.59-frontX(p.y))*Math.exp(-(((x-.59)/.32)**2))
   vertices.push(x-setback,p.y,side*p.z)
  }
 }
 for(let j=0;j<rows;j++)for(let i=0;i<around;i++){const a=j*(around+1)+i,b=a+around+1;append(a,a+1,b);append(b,a+1,b+1)}
 // Close only the rear. The front is an annulus around the duct, never a cap.
 const rearCenter=vertices.length/3,center=new Vector3()
 for(let i=0;i<around;i++)center.add(new Vector3().fromArray(vertices,i*3))
 center.divideScalar(around);vertices.push(center.x,center.y,center.z)
 for(let i=0;i<around;i++)append(rearCenter,i+1,i)
 const mouthCurve=new CatmullRomCurve3([
  new Vector3(0,.492,.27),new Vector3(0,.564,.27),new Vector3(0,.584,.34),
  new Vector3(0,.582,.425),new Vector3(0,.585,.54),new Vector3(0,.564,.585),
  new Vector3(0,.511,.558),new Vector3(0,.491,.45),new Vector3(0,.487,.33)
 ],true,'centripetal')
 const mouth:V3[]=[]
 for(let i=0;i<=around;i++){const p=mouthCurve.getPoint(i/around);mouth.push([frontX(p.y),p.y,side*p.z])}
 const mouthStart=vertices.length/3
 mouth.forEach(p=>vertices.push(...p))
 const frontStart=rows*(around+1)
 for(let i=0;i<around;i++){const a=frontStart+i,b=mouthStart+i;append(a,a+1,b);append(a+1,b+1,b)}
 const makeGeometry=(points:number[],faces:number[])=>{const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(points,3));g.setIndex(faces);g.computeVertexNormals();return g}
 // A short painted return rolls into the carbon tunnel; every ring is connected.
 const lipStart=vertices.length/3
 const throat=mouth.map(([x,y,z])=>[x-.035,.536+(y-.536)*.92,side*.424+(z-side*.424)*.96] as V3)
 throat.forEach(p=>vertices.push(...p))
 for(let i=0;i<around;i++){const a=mouthStart+i,b=lipStart+i;append(a,a+1,b);append(a+1,b+1,b)}
 const ductVertices=throat.flat(),ductIndices:number[]=[]
 const back=throat.map(([x,y,z])=>[x-.25,.525+(y-.536)*.72,side*.405+(z-side*.424)*.78] as V3)
 back.forEach(p=>ductVertices.push(...p))
 for(let i=0;i<around;i++){const a=i,b=i+around+1;ductIndices.push(a,b,a+1,a+1,b,b+1)}
 const backCenter=ductVertices.length/3
 ductVertices.push(.30,.525,side*.405)
 for(let i=0;i<around;i++)ductIndices.push(backCenter,around+1+i,around+2+i)
 return {shell:makeGeometry(vertices,indices),duct:makeGeometry(ductVertices,ductIndices)}
}
function Halo({color}:{color:string}){
 const geometry=useMemo(()=>{
  // One continuous horseshoe, embedded rear feet, and a shared front apex.
  const path=new CatmullRomCurve3([[-.47,.605,-.235],[-.46,.80,-.265],[-.32,.875,-.29],[.05,.88,-.275],[.35,.855,-.15],[.44,.845,0],[.35,.855,.15],[.05,.88,.275],[-.32,.875,.29],[-.46,.80,.265],[-.47,.605,.235]].map(p=>new Vector3(...p)),false,'centripetal')
  const frames=path.computeFrenetFrames(100,false),positions:number[]=[],indices:number[]=[]
  for(let j=0;j<=100;j++){const c=path.getPointAt(j/100);for(let i=0;i<=16;i++){const t=i/16*Math.PI*2,p=c.clone().addScaledVector(frames.normals[j],Math.cos(t)*.042).addScaledVector(frames.binormals[j],Math.sin(t)*.024);positions.push(p.x,p.y,p.z)}}
  for(let j=0;j<100;j++)for(let i=0;i<16;i++){const a=j*17+i,b=a+17;indices.push(a,b,a+1,b,b+1,a+1)}
  const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g
 },[]);useEffect(()=>()=>geometry.dispose(),[geometry])
 return <group><mesh geometry={geometry} castShadow><meshStandardMaterial color={color} roughness={.32} metalness={.4} side={DoubleSide}/></mesh><Tube points={[[.44,.845,0],[.45,.78,0],[.46,.66,0],[.42,.59,0]]} r={.027} color={color}/></group>
}
function TextMaterial({text}:{text:string}){const texture=useMemo(()=>{const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d')!;ctx.font='italic 900 85px Arial';ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,64,500);const t=new CanvasTexture(c);t.colorSpace=SRGBColorSpace;return t},[text]);useEffect(()=>()=>texture.dispose(),[texture]);return <meshBasicMaterial map={texture} transparent depthWrite={false} side={DoubleSide}/>}
function Wheel({x,side,rear,design}:{x:number;side:number;rear:boolean;design:Design}){const width=rear?.36:.28,z=side*(.95-width/2),ring=design.compound==='soft'?'#ee4d47':design.compound==='hard'?'#eaeef3':'#e9c749';
 const tyre=useMemo(()=>new LatheGeometry([[.232,-width/2],[.285,-width/2-.004],[.325,-width/2+.003],[.345,-width/2+.022],[.352,-width/2+.045],[.352,width/2-.045],[.345,width/2-.022],[.325,width/2-.003],[.285,width/2+.004],[.232,width/2]].map(([r,y])=>new Vector2(r,y)),80),[width]);useEffect(()=>()=>tyre.dispose(),[tyre]);return <group position={[x,.36,z]}>
 <mesh geometry={tyre} rotation={[Math.PI/2,0,0]} castShadow><meshStandardMaterial color="#15171b" roughness={.92} side={DoubleSide}/></mesh>
 {[-1,1].map(face=><group key={face} position={[0,0,face*(width/2+.001)]} rotation={[0,face===-1?Math.PI:0,0]}>
 <mesh><circleGeometry args={[.235,64]}/><meshStandardMaterial color={design.rims} metalness={.5} roughness={.35}/></mesh>
 <mesh position={[0,0,.002]}><torusGeometry args={[.24,.009,8,64]}/><meshStandardMaterial color="#7e8895" metalness={.8} roughness={.3}/></mesh>
 <mesh position={[0,0,.005]}><torusGeometry args={[.307,.004,8,64]}/><meshStandardMaterial color={ring}/></mesh>
 <mesh position={[0,0,.008]}><circleGeometry args={[.055,24]}/><meshStandardMaterial color="#aab3bf" metalness={.8} roughness={.25}/></mesh>
 {Array.from({length:12},(_,i)=><mesh key={i} rotation={[0,0,i*Math.PI/6]} position={[0,0,.004]}><boxGeometry args={[.41,.005,.002]}/><meshStandardMaterial color="#1a2028"/></mesh>)}
 <mesh position={[0,.276,.007]}><planeGeometry args={[.24,.042]}/><TextMaterial text="PULSE"/></mesh><mesh position={[0,-.28,.007]}><planeGeometry args={[.17,.034]}/><TextMaterial text="P ZERO"/></mesh>
 </group>)}
 </group>}
interface SurfaceTarget {geometry:BufferGeometry;position:V3;rotation:V3;horizontal:number;vertical:number;maxSize:number}
function ProjectedMark({decal,target,onSelect,selected}:{decal:Decal;target:SurfaceTarget;onSelect:(id:string)=>void;selected:boolean}){
 const loaded=useLoader(TextureLoader,decal.image);const texture=useMemo(()=>{const t=loaded.clone();t.colorSpace=SRGBColorSpace;return t},[loaded]);useEffect(()=>()=>texture.dispose(),[texture]);const ratio=texture.image.width/texture.image.height
 const geometry=useMemo(()=>{const p=new Vector3(...target.position),rot=new Euler(...target.rotation);const q=new Quaternion().setFromEuler(rot);p.add(new Vector3(decal.x*target.horizontal,decal.y*target.vertical,0).applyQuaternion(q));const spin=new Quaternion().setFromAxisAngle(new Vector3(0,0,1),decal.rotation*Math.PI/180);rot.setFromQuaternion(q.multiply(spin));const size=Math.min(decal.scale,target.maxSize);return new DecalGeometry(new Mesh(target.geometry),p,rot,new Vector3(size,size/ratio,.6))},[decal,target,ratio]);useEffect(()=>()=>geometry.dispose(),[geometry])
 return <mesh geometry={geometry} onClick={e=>{e.stopPropagation();onSelect(decal.id)}} renderOrder={3}><meshStandardMaterial map={texture} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-5} roughness={.5} emissive={selected?'#777777':'#000000'} emissiveIntensity={selected?.3:0} side={DoubleSide}/></mesh>
}
export default function CarModel({design,onSelect,selected=''}:{design:Design;onSelect:(id:string)=>void;selected?:string}){
 const shapes=useMemo(()=>{
 const chassis=loft([[-1.85,.27,.09,.08],[-1.4,.33,.18,.15],[-.85,.4,.28,.2],[-.4,.43,.33,.23],[0,.43,.32,.22],[.45,.4,.27,.2],[.8,.38,.2,.17],[1.18,.37,.15,.12]],true)
 const coaming=loft([[-.52,.595,.20,.07],[-.36,.61,.28,.075],[-.06,.61,.29,.075],[.24,.595,.255,.07],[.43,.56,.16,.075]],true)
 const nose=loft([[.5,.46,.245,.14],[.82,.45,.21,.12],[1.15,.42,.165,.10],[1.55,.36,.135,.077],[1.94,.265,.105,.054],[2.26,.185,.085,.035],[2.40,.16,.045,.022]],true)
 const engine=loft([[-1.91,.34,.075,.075],[-1.55,.4,.13,.14],[-1.18,.51,.18,.24],[-.92,.64,.18,.35],[-.72,.70,.145,.36],[-.56,.69,.115,.31],[-.47,.50,.17,.12]])
 const airbox=loft([[-.85,.94,.065,.08],[-.68,.96,.11,.125],[-.51,.96,.105,.12]],true)
 const podAssemblies=[1,-1].map(sidepod)
 const pods=podAssemblies.map(p=>p.shell),ducts=podAssemblies.map(p=>p.duct)
 const endplates=[1,-1].map(side=>plate([[-2.30,.67],[-2.31,1.105],[-2.10,1.105],[-1.79,1.02],[-1.72,.91],[-1.85,.70],[-1.99,.59]],side*.72))
 const frontPlates=[1,-1].map(side=>plate([[1.87,.095],[1.83,.26],[1.92,.34],[2.08,.34],[2.19,.22],[2.45,.16],[2.49,.075]],side*.9))
 const floor=plate([[-2.1,-.49],[-1.6,-.55],[-1,-.69],[.6,-.71],[.88,-.59],[1.06,-.36],[.65,-.26],[.65,.26],[1.06,.36],[.88,.59],[.6,.71],[-1,.69],[-1.6,.55],[-2.1,.49]],0,.025);floor.rotateX(Math.PI/2);floor.translate(0,.145,0)
 return {chassis,coaming,nose,engine,airbox,pods,ducts,endplates,frontPlates,floor}
 },[])
 useEffect(()=>()=>Object.values(shapes).flat().forEach(g=>g.dispose()),[shapes])
 const targets:Record<Surface,SurfaceTarget>=useMemo(()=>({
 left:{geometry:shapes.pods[0],position:[-.35,.46,.7],rotation:[0,0,0],horizontal:.7,vertical:.16,maxSize:1.3},
 right:{geometry:shapes.pods[1],position:[-.35,.46,-.7],rotation:[0,Math.PI,0],horizontal:.7,vertical:.16,maxSize:1.3},
 nose:{geometry:shapes.nose,position:[1.45,.5,0],rotation:[-Math.PI/2,0,0],horizontal:.56,vertical:.085,maxSize:.7},
 'engine-left':{geometry:shapes.engine,position:[-1,.75,.22],rotation:[0,0,0],horizontal:.38,vertical:.2,maxSize:.65},
 'engine-right':{geometry:shapes.engine,position:[-1,.75,-.22],rotation:[0,Math.PI,0],horizontal:.38,vertical:.2,maxSize:.65},
 'rear-left':{geometry:shapes.endplates[0],position:[-1.99,.77,.745],rotation:[0,0,0],horizontal:.15,vertical:.14,maxSize:.42},
 'rear-right':{geometry:shapes.endplates[1],position:[-1.99,.77,-.745],rotation:[0,Math.PI,0],horizontal:.15,vertical:.14,maxSize:.42},
 }),[shapes])
 const identity=useMemo(()=>[
 ...(['left','right'] as Surface[]).map(surface=>({id:'identity-'+surface,name:'Identity',image:letteringImage(design.text,parseInt(design.accent.slice(1,3),16)*.299+parseInt(design.accent.slice(3,5),16)*.587+parseInt(design.accent.slice(5,7),16)*.114>160?'#17212b':'#ffffff'),surface,x:0,y:0,scale:.72,rotation:0})),
 {id:'number',name:'Number',image:letteringImage(design.number),surface:'nose' as Surface,x:0,y:0,scale:.35,rotation:0}
 ],[design.text,design.number,design.accent])
 const mat={roughness:design.finish==='matte'?.78:design.finish==='metallic'?.28:.21,metalness:design.finish==='metallic'?.65:.12}
 const box=(p:V3,args:V3,c:string,rotation:V3=[0,0,0])=><mesh position={p} rotation={rotation} castShadow><boxGeometry args={args}/><meshStandardMaterial color={c} {...mat}/></mesh>
 return <group>
 <mesh geometry={shapes.chassis} castShadow><meshStandardMaterial color={design.body} {...mat}/></mesh>
 <mesh geometry={shapes.coaming} castShadow><meshStandardMaterial color={design.body} {...mat}/></mesh>
 <mesh geometry={shapes.nose} castShadow><meshStandardMaterial color={design.nose} {...mat}/></mesh>
 <mesh geometry={shapes.engine} castShadow><meshStandardMaterial color={design.engine} {...mat}/></mesh>
 <mesh geometry={shapes.airbox} castShadow><meshStandardMaterial color={design.engine} {...mat}/></mesh>
 <mesh geometry={shapes.floor} castShadow><meshStandardMaterial color={carbon} roughness={.7}/></mesh>
 {[-1,1].map(side=><group key={side}>
 <mesh geometry={shapes.pods[side===1?0:1]} castShadow><meshStandardMaterial color={design.accent} {...mat}/></mesh>
 <mesh geometry={shapes.endplates[side===1?0:1]} castShadow><meshStandardMaterial color={design.rearWing} {...mat}/></mesh>
 <mesh geometry={shapes.frontPlates[side===1?0:1]} castShadow><meshStandardMaterial color={design.frontWing} {...mat}/></mesh>
 <Wheel x={-1.7} side={side} rear design={design}/><Wheel x={1.7} side={side} rear={false} design={design}/>
 {/* Every arm shares a physical upright and terminates inside the chassis skin. */}
 {[false,true].map(rear=>{const x=rear?-1.7:1.7,z=side*(rear?.575:.655),fore=rear?-1.36:1.48,aft=rear?-1.84:.91;return <group key={String(rear)}>
 <Rod from={[x,.255,z]} to={[x,.445,z]} r={.038} color="#303a43"/>
 <Rod from={[x,.36,z]} to={[x,.36,side*(rear?.78:.81)]} r={.053} color="#3e4751"/>
 <Rod from={[fore,rear?.29:.34,side*.07]} to={[x,.255,z]} r={.018}/>
 <Rod from={[aft,rear?.29:.36,side*(rear?.055:.12)]} to={[x,.255,z]} r={.018}/>
 <Rod from={[fore,.405,side*(rear?.08:.07)]} to={[x,.445,z]} r={.015}/>
 <Rod from={[aft,rear?.37:.44,side*(rear?.04:.12)]} to={[x,.445,z]} r={.015}/>
 <Rod from={[rear?-1.25:1.02,rear?.48:.50,side*(rear?.14:.15)]} to={[x,.26,z]} r={.018}/>
 <Rod from={[rear?-1.55:1.12,.35,side*.12]} to={[x+.035,.345,z]} r={rear?.023:.012}/>
 <mesh position={[x,.36,z]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.125,.125,.035,32]}/><meshStandardMaterial color="#353c44" metalness={.65} roughness={.55}/></mesh>
 </group>})}
 <mesh geometry={shapes.ducts[side===1?0:1]} receiveShadow><meshStandardMaterial color="#080b10" roughness={.95} side={DoubleSide}/></mesh>
 <Rod from={[.45,.54,side*.16]} to={[.38,.74,side*.57]} r={.014} color={design.halo}/>
 <mesh position={[.39,.74,side*.58]} scale={[.11,.045,.06]}><sphereGeometry args={[1,20,12]}/><meshStandardMaterial color={design.body} {...mat}/></mesh>
 <Tube points={[[.65,.16,side*.69],[.1,.16,side*.70],[-.8,.16,side*.68],[-1.35,.16,side*.575]]} r={.012} color={design.wing}/>
 <Tube points={[[-1.70,.34,side*.095],[-1.81,.59,side*.11],[-1.97,.79,side*.12],[-2.02,.925,side*.12]]} r={.026} color={carbon}/>
 {box([-1.58,.19,side*.48],[.72,.08,.016],carbon,[0,0,-.17])}
 </group>)}
 {/* Swept front elements and a two-element rear wing with attached pylons. */}
 <Wing position={[2.40,.10,0]} chord={.35} span={1.80} color={design.frontWing}/>
 <Wing position={[2.18,.145,0]} chord={.23} span={1.78} color={design.nose} angle={design.aero==='straight'?-.04:-.28}/>
 <Wing position={[2.01,.195,0]} chord={.20} span={1.76} color={design.nose} angle={design.aero==='straight'?-.04:-.42}/>
 <Wing position={[-1.95,.90,0]} chord={.36} span={1.43} color={design.rearWing} angle={-.10} rear/>
 <Wing position={[-2.17,.975,0]} chord={.22} span={1.43} color={design.body} angle={design.aero==='straight'?-.03:-.55} rear/>
 {[-1,1].map(side=><group key={'wing-mount'+side}>
 <Rod from={[2.22,.11,side*.052]} to={[2.19,.20,side*.052]} r={.025} color={design.nose}/>
 <Rod from={[1.86,.25,side*.85]} to={[2.34,.175,side*.85]} r={.01}/>
 </group>)}
 {/* Cockpit well, padded rim, seat and titanium halo. */}
 <mesh position={[-.06,.671,0]} scale={[.43,.033,.235]}><sphereGeometry args={[1,40,20]}/><meshStandardMaterial color="#020508" roughness={.9}/></mesh>
 <Tube points={[[-.46,.66,-.20],[-.2,.675,-.25],[.23,.655,-.205],[.37,.635,0],[.23,.655,.205],[-.2,.675,.25],[-.46,.66,.20]]} r={.023} color={design.body}/>
 <mesh position={[-.34,.70,0]} scale={[.07,.07,.145]}><sphereGeometry args={[1,20,12]}/><meshStandardMaterial color="#30323a" roughness={1}/></mesh>
 <Halo color={design.halo}/>
 <mesh position={[-.503,.96,0]} rotation={[0,Math.PI/2,0]} scale={[.08,.092,1]}><circleGeometry args={[1,48]}/><meshStandardMaterial color="#05080c" side={DoubleSide}/></mesh>
 <mesh position={[-1.94,.34,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.047,.047,.15,24]}/><meshStandardMaterial color="#9b9da0" metalness={1} roughness={.3}/></mesh>
 {box([-2.04,.25,0],[.035,.055,.105],'#a9161a')}
 {identity.filter(d=>!design.decals.some(mark=>mark.surface===d.surface)&&d.image&&((d.id==='number'&&design.number)||(d.id!=='number'&&design.text))).map(d=><ProjectedMark key={d.id} decal={d} target={targets[d.surface]} onSelect={()=>{}} selected={false}/>)}
 {design.decals.map(d=><ProjectedMark key={d.id} decal={d} target={targets[d.surface]} onSelect={onSelect} selected={d.id===selected}/>)}
 </group>
}
