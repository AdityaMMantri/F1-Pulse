import { Suspense, useEffect, useImperativeHandle, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { Vector3 } from 'three'
import type { RefObject } from 'react'
import type { Design } from './design'
import CarModel from './CarModel'
export type View = 'Three-quarter'|'Front'|'Rear'|'Side'|'Top'
export type ExportRef = RefObject<null|(()=>string)>
const positions:Record<View,[number,number,number]>={'Three-quarter':[6,3.2,5.5],Front:[8,.95,0],Rear:[-8,1.4,0],Side:[0,1.35,8],Top:[0,9,.01]}
function Stage({view,zoom,turn,exporter}:{view:View;zoom:number;turn:number;exporter:ExportRef}){
  const controls=useRef<OrbitControlsImpl>(null),{camera,gl,scene,invalidate}=useThree()
  useEffect(()=>{const base=positions[view];camera.position.set(base[0],base[1],base[2]);camera.position.applyAxisAngle(new Vector3(0,1,0),turn);camera.position.multiplyScalar(zoom);controls.current?.target.set(0,.55,0);controls.current?.update();invalidate()},[view,zoom,turn,camera,invalidate])
  useImperativeHandle(exporter,()=>()=>{gl.render(scene,camera);return gl.domElement.toDataURL('image/png')},[gl,scene,camera])
  return <OrbitControls ref={controls} makeDefault target={[0,.55,0]} enablePan={false} minDistance={4} maxDistance={13} maxPolarAngle={Math.PI/2-.025} enableDamping={false}/>
}
export default function Viewer({design,view,zoom,turn,exporter,onSelect,onFailure}:{design:Design;view:View;zoom:number;turn:number;exporter:ExportRef;onSelect:(id:string)=>void;onFailure:()=>void}){
  return <Canvas shadows frameloop="demand" dpr={[1,1.5]} camera={{position:[6,3.2,5.5],fov:40}} gl={{antialias:true,preserveDrawingBuffer:true}} onCreated={({gl})=>{gl.domElement.addEventListener('webglcontextlost',onFailure,{once:true})}} fallback={<p>WebGL unavailable. Use the 2D fallback.</p>}>
    <color attach="background" args={['#12151c']}/><ambientLight intensity={1.5}/><hemisphereLight args={['#e4f1ff','#29232a',2]}/><directionalLight position={[2,6,3]} intensity={4} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={5} shadow-camera-bottom={-5}/><directionalLight position={[-3,3,-5]} color="#a4d7ff" intensity={3}/><directionalLight position={[0,2,5]} color="#ff8064" intensity={1}/>
    <Suspense fallback={null}><CarModel design={design} onSelect={onSelect}/></Suspense>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.015,0]} receiveShadow><planeGeometry args={[200,200]}/><meshStandardMaterial color="#171c25" roughness={.8}/></mesh><Grid position={[0,.002,0]} args={[20,20]} cellSize={1} cellThickness={.5} cellColor="#343c4c" sectionColor="#444f61" sectionSize={5} fadeDistance={18}/><Stage view={view} zoom={zoom} turn={turn} exporter={exporter}/>
  </Canvas>
}
