export type Finish = 'matte' | 'gloss' | 'metallic'
export type Surface = 'left' | 'right' | 'nose'
export interface Decal { id:string; name:string; image:string; surface:Surface; x:number; y:number; scale:number; rotation:number }
export interface Design { version:1; body:string; accent:string; wing:string; finish:Finish; number:string; text:string; decals:Decal[] }
export const defaultDesign:Design = {version:1,body:'#ed4938',accent:'#171b23',wing:'#22252d',finish:'gloss',number:'26',text:'PULSE',decals:[]}
export const presets = [
  {name:'Pulse',body:'#ed4938',accent:'#171b23',wing:'#22252d'},
  {name:'Glacier',body:'#d3e5ee',accent:'#147c93',wing:'#192a38'},
  {name:'Papaya',body:'#ff962d',accent:'#171b23',wing:'#22252d'},
  {name:'Midnight',body:'#244f92',accent:'#d8f357',wing:'#132035'},
]
export const storageKey='f1-pulse-design-v1'
const color=(v:unknown)=>typeof v==='string'&&/^#[a-f0-9]{6}$/i.test(v)
const numberIn=(v:unknown,min:number,max:number)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max
export function isDesign(v:unknown):v is Design {
  if(!v||typeof v!=='object')return false
  const d=v as Design
  return d.version===1&&color(d.body)&&color(d.accent)&&color(d.wing)&&['matte','gloss','metallic'].includes(d.finish)&&typeof d.number==='string'&&/^\d{0,2}$/.test(d.number)&&typeof d.text==='string'&&d.text.length<=16&&Array.isArray(d.decals)&&d.decals.length<=3&&d.decals.every(x=>x&&typeof x.id==='string'&&x.id.length<80&&typeof x.name==='string'&&x.name.length<=80&&typeof x.image==='string'&&x.image.length<800000&&/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(x.image)&&['left','right','nose'].includes(x.surface)&&numberIn(x.x,-.5,.5)&&numberIn(x.y,-.15,.15)&&numberIn(x.scale,.15,.8)&&numberIn(x.rotation,-180,180))&&new Set(d.decals.map(x=>x.id)).size===d.decals.length
}
export async function readLogo(file:File):Promise<string>{
  if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw new Error('Use a PNG, JPEG or WebP image. SVG and animated files are not supported.')
  if(file.size>2*1024*1024)throw new Error('Choose an image smaller than 2 MB.')
  const bitmap=await createImageBitmap(file)
  try{
    if(bitmap.width>4096||bitmap.height>4096)throw new Error('Image dimensions must be 4096 × 4096 or smaller.')
    const canvas=document.createElement('canvas'),ratio=Math.min(512/bitmap.width,512/bitmap.height,1)
    canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio))
    const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Your browser cannot process this image.')
    ctx.drawImage(bitmap,0,0,canvas.width,canvas.height)
    const url=canvas.toDataURL('image/png');if(url.length>=800000)throw new Error('This logo is too complex to save locally. Try a smaller image.')
    return url
  }finally{bitmap.close()}
}
