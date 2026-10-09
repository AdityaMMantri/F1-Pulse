import { Suspense, useEffect, useImperativeHandle, useRef } from 'react'

import { Canvas, useThree } from '@react-three/fiber'

import { OrbitControls, Grid, Environment, Lightformer } from '@react-three/drei'

import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

import { Vector3 } from 'three'

import type { RefObject } from 'react'

import type { Design } from './design'

import CarModel from './CarModel'

export type View = 'Three-quarter'|'Front'|'Rear'|'Side'|'Top'

export type ExportRef = RefObject<null|(()=>string)>

const positions:Record<View,[number,number,number]>={'Three-quarter':[5.4,2.7,4.5],Front:[5.8,1.05,0],Rear:[-5.8,1.4,0],Side:[0,1.15,7.3],Top:[0,8,.01]}

function Stage({view,zoom,turn,exporter}:{view:View;zoom:number;turn:number;exporter:ExportRef}){

  const controls=useRef<OrbitControlsImpl>(null),{camera,gl,scene,invalidate,size}=useThree()

  useEffect(()=>{const base=positions[view];const framing=Math.max(1,1.3/(size.width/size.height));camera.position.set(base[0],base[1],base[2]);camera.position.applyAxisAngle(new Vector3(0,1,0),turn);camera.position.multiplyScalar(zoom*framing);controls.current?.target.set(0,.55,0);controls.current?.update();invalidate()},[view,zoom,turn,camera,invalidate,size.width,size.height])

  useImperativeHandle(exporter,()=>()=>{gl.render(scene,camera);return gl.domElement.toDataURL('image/png')},[gl,scene,camera])

  return <OrbitControls ref={controls} makeDefault target={[0,.55,0]} enablePan={false} minDistance={4} maxDistance={20} maxPolarAngle={Math.PI/2-.025} enableDamping={false}/>

}

export default function Viewer({design,view,zoom,turn,exporter,onSelect,onFailure,selected}:{design:Design;view:View;zoom:number;turn:number;exporter:ExportRef;onSelect:(id:string)=>void;onFailure:()=>void;selected:string}){

  return <Canvas shadows frameloop="demand" dpr={[1,1.5]} camera={{position:[5.4,2.7,4.5],fov:37}} gl={{antialias:true,preserveDrawingBuffer:true}} onCreated={({gl})=>{gl.domElement.addEventListener('webglcontextlost',onFailure,{once:true})}} fallback={<p>WebGL unavailable. Use the 2D fallback.</p>}>

    <color attach="background" args={['#12151c']}/><fog attach="fog" args={['#12151c',10,25]}/><ambientLight intensity={.5}/><hemisphereLight args={['#e4f1ff','#171921',.8]}/><directionalLight position={[2,6,3]} intensity={2.6} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={5} shadow-camera-bottom={-5}/><directionalLight position={[-3,3,-5]} color="#a4d7ff" intensity={1.4}/><directionalLight position={[0,2,5]} color="#ff8064" intensity={.5}/>

    <Environment resolution={128}><Lightformer position={[0,5,0]} rotation={[Math.PI/2,0,0]} scale={[9,3,1]} intensity={3}/><Lightformer position={[0,2,5]} rotation={[0,Math.PI,0]} scale={[10,1,1]} intensity={2}/><Lightformer position={[-4,2,-3]} rotation={[0,.8,0]} scale={[6,2,1]} color="#91bce8" intensity={2}/></Environment><Suspense fallback={null}><CarModel design={design} onSelect={onSelect} selected={selected}/></Suspense>

    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.015,0]} receiveShadow><planeGeometry args={[200,200]}/><meshStandardMaterial color="#111720" roughness={1} envMapIntensity={0}/></mesh><Grid position={[0,.002,0]} args={[20,20]} cellSize={1} cellThickness={.5} cellColor="#343c4c" sectionColor="#444f61" sectionSize={5} fadeDistance={18}/><Stage view={view} zoom={zoom} turn={turn} exporter={exporter}/>

  </Canvas>

}

