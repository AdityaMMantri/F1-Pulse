import { useEffect, useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { BufferGeometry, Float32BufferAttribute, CanvasTexture, TextureLoader, SRGBColorSpace, DoubleSide } from 'three'
import type { Design, Decal } from './design'
function hullGeometry(sections:number[][]){
  const positions:number[]=[],indices:number[]=[],segments=24
  sections.forEach(([x,y,width,height])=>{for(let i=0;i<=segments;i++){const angle=i/segments*Math.PI*2;positions.push(x,y+Math.sin(angle)*height,Math.cos(angle)*width)}})
  for(let j=0;j<sections.length-1;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+segments+1;indices.push(a,b,a+1,b,b+1,a+1)}
  const geometry=new BufferGeometry();geometry.setAttribute('position',new Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry
}
function Lettering({text}:{text:string}){
  const texture=useMemo(()=>{const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const ctx=canvas.getContext('2d')!;ctx.fillStyle='white';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='italic 800 150px Arial';ctx.fillText(text,512,128,950);const t=new CanvasTexture(canvas);t.colorSpace=SRGBColorSpace;return t},[text])
  useEffect(()=>()=>texture.dispose(),[texture])
  return <meshBasicMaterial map={texture} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-2} side={DoubleSide}/>
}
function Logo({decal,onSelect}:{decal:Decal;onSelect:(id:string)=>void}){
  const loaded=useLoader(TextureLoader,decal.image)
  const texture=useMemo(()=>{const t=loaded.clone();t.colorSpace=SRGBColorSpace;return t},[loaded])
  useEffect(()=>()=>texture.dispose(),[texture])
  const ratio=texture.image.width/texture.image.height
  const pos: [number,number,number]=decal.surface==='nose'?[1.55+decal.x,.797,decal.y]:[-.35+decal.x,.62+decal.y,decal.surface==='left'?.807:-.807]
  return <group position={pos} rotation={decal.surface==='nose'?[-Math.PI/2,0,0]:[0,decal.surface==='left'?0:Math.PI,0]}><mesh rotation={[0,0,decal.rotation*Math.PI/180]} onClick={e=>{e.stopPropagation();onSelect(decal.id)}}><planeGeometry args={[decal.scale,decal.scale/ratio]}/><meshBasicMaterial map={texture} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-4} side={DoubleSide}/></mesh></group>
}
export default function CarModel({design,onSelect}:{design:Design;onSelect:(id:string)=>void}){
  const body=useMemo(()=>hullGeometry([[-2,.48,.08,.08],[-1.6,.67,.3,.34],[-.9,.81,.34,.46],[-.35,.6,.38,.25],[.3,.58,.34,.28],[1,.53,.23,.25],[2,.45,.12,.12],[2.8,.3,.06,.04]]),[])
  useEffect(()=>()=>body.dispose(),[body])
  const material={roughness:design.finish==='matte'?.8:design.finish==='metallic'?.24:.18,metalness:design.finish==='metallic'?.75:.12}
  const box=(position:[number,number,number],args:[number,number,number],color:string,radius=.04)=><RoundedBox position={position} args={args} radius={radius} smoothness={3} castShadow receiveShadow><meshStandardMaterial color={color} {...material}/></RoundedBox>
  return <group>
    <mesh geometry={body} castShadow><meshStandardMaterial color={design.body} {...material}/></mesh>
    {box([-.1,.24,0],[4.65,.1,1.55],'#101219')}
    {[-1,1].map(side=><group key={side}>
      {box([-.45,.56,side*.56],[1.8,.48,.48],design.accent,.12)}
      {box([-.65,.83,side*.52],[1.25,.05,.45],design.body,.02)}
      {box([-.04,.63,side*.813],[.46,.19,.012],'#090b10',.003)}
      <mesh position={[-.78,.59,side*.808]} rotation={[0,side===1?0:Math.PI,0]}><planeGeometry args={[.8,.2]}/><Lettering text={design.text}/></mesh>
      {[-1.62,1.8].map(x=><group key={x} position={[x,.44,side*.99]}>
        <mesh rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[.42,.42,.38,48]}/><meshStandardMaterial color="#111318" roughness={.86}/></mesh>
        {[-1,1].map(face=><group key={face} position={[0,0,face*.198]}>
          <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.285,.285,.018,32]}/><meshStandardMaterial color="#222831" metalness={.85} roughness={.33}/></mesh>
          <mesh><torusGeometry args={[.34,.009,8,48]}/><meshStandardMaterial color="#d6b352" roughness={.55}/></mesh>
          <mesh><circleGeometry args={[.08,24]}/><meshStandardMaterial color="#9099a2" side={DoubleSide}/></mesh>
          {Array.from({length:10},(_,i)=><mesh key={i} rotation={[0,0,i*Math.PI/5]}><boxGeometry args={[.49,.025,.021]}/><meshStandardMaterial color="#77808c" metalness={.75} roughness={.28}/></mesh>)}
        </group>)}
      </group>)}
      {[1.8,-1.62].map(x=><group key={x}>{box([x,.37,side*.58],[.06,.035,.7],'#292e35',.01)}<mesh position={[x-.2,.5,side*.6]} rotation={[0,side*.45,.18]}><boxGeometry args={[.065,.04,.75]}/><meshStandardMaterial color="#282c35"/></mesh></group>)}
      {box([2.64,.3,side*1.03],[.64,.31,.045],design.body,.012)}
      {box([-2.12,1.02,side*.76],[.55,.45,.05],design.body,.012)}
      {box([-2.05,.65,side*.39],[.05,.7,.04],'#343a43',.01)}
    </group>)}
    {box([2.6,.2,0],[.6,.07,2.1],design.wing,.02)}
    {[0,1,2].map(i=><group key={i}>{box([2.53-i*.14,.23+i*.055,0],[.13,.04,1.95],i===2?design.accent:design.wing,.012)}</group>)}
    {box([-2.11,1.15,0],[.55,.08,1.54],design.wing,.02)}
    {box([-2.27,1.28,0],[.21,.065,1.53],design.accent,.02)}
    <mesh position={[-.12,.84,0]} scale={[.65,.15,.38]}><sphereGeometry args={[1,32,16]}/><meshStandardMaterial color="#07090d" roughness={.8}/></mesh>
    <mesh position={[-.12,1.04,0]} rotation={[Math.PI/2,0,0]} scale={[.72,1,1]}><torusGeometry args={[.39,.034,8,32,Math.PI*1.85]}/><meshStandardMaterial color={design.wing} metalness={.5} roughness={.25}/></mesh>
    {box([.18,.91,0],[.035,.28,.035],design.wing,.009)}
    <mesh position={[-.78,1.09,0]} rotation={[0,0,Math.PI/2]}><coneGeometry args={[.16,.5,3]}/><meshStandardMaterial color={design.body} {...material}/></mesh>
    <mesh position={[1.55,.794,0]} rotation={[-Math.PI/2,0,Math.PI/2]}><planeGeometry args={[.3,.23]}/><Lettering text={design.number}/></mesh>
    {design.decals.map(decal=><Logo key={decal.id} decal={decal} onSelect={onSelect}/>)}
  </group>
}
