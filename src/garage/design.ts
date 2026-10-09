export type Finish = 'matte' | 'gloss' | 'metallic'
export type Surface = 'left' | 'right' | 'nose' | 'engine-left' | 'engine-right' | 'rear-left' | 'rear-right'
export interface Decal { id:string; name:string; image:string; surface:Surface; x:number; y:number; scale:number; rotation:number; text?:string; ink?:string }
export interface Design { version:2; body:string; accent:string; wing:string; nose:string; engine:string; halo:string; rims:string; frontWing:string; rearWing:string; finish:Finish; number:string; text:string; compound:'soft'|'medium'|'hard'; aero:'corner'|'straight'; decals:Decal[] }
export const defaultDesign:Design = {version:2,body:'#e84832',accent:'#dfe5e9',wing:'#171c24',nose:'#e84832',engine:'#e84832',halo:'#171c24',rims:'#343b45',frontWing:'#171c24',rearWing:'#171c24',finish:'gloss',number:'26',text:'PULSE',compound:'medium',aero:'corner',decals:[]}
export const presets = [
 {name:'Pulse',body:'#e84832',accent:'#e8e8e4',wing:'#171b23'},
 {name:'Glacier',body:'#d3e5ee',accent:'#147c93',wing:'#192a38'},
 {name:'Papaya',body:'#ff962d',accent:'#171b23',wing:'#22252d'},
 {name:'Midnight',body:'#244f92',accent:'#d8f357',wing:'#132035'},
 {name:'Carbon',body:'#282d34',accent:'#e8bd74',wing:'#11151b'},
 {name:'Orchid',body:'#6f43be',accent:'#b4f2d0',wing:'#151a25'},
]
export const paintAreas = [['body','Chassis'],['accent','Sidepods'],['nose','Nose cone'],['engine','Engine cover'],['halo','Halo'],['frontWing','Front wing'],['rearWing','Rear wing'],['rims','Wheel covers'],['wing','Aero trim']] as const
export const surfaces:{id:Surface;name:string}[]=[{id:'left',name:'Left sidepod'},{id:'right',name:'Right sidepod'},{id:'nose',name:'Nose top'},{id:'engine-left',name:'Left engine cover'},{id:'engine-right',name:'Right engine cover'},{id:'rear-left',name:'Left rear endplate'},{id:'rear-right',name:'Right rear endplate'}]
export const sponsors=[{name:'APEX',tag:'PERFORMANCE LAB',color:'#ffffff'},{name:'VOLT',tag:'ELECTRIC SYSTEMS',color:'#d8f357'},{name:'NOVA',tag:'ADVANCED MATERIALS',color:'#7cdbff'},{name:'PULSE',tag:'RACING TECHNOLOGY',color:'#ffffff'},{name:'ORBIT',tag:'CONNECTED ENGINEERING',color:'#ffba89'},{name:'VECTOR',tag:'PRECISION SYSTEMS',color:'#fff'}]
export const storageKey='f1-pulse-design-v2'
export function arrangePanel(decals:Decal[],surface:Surface):Decal[]{
 const panel=decals.filter(d=>d.surface===surface),count=panel.length
 const large=surface==='left'||surface==='right'
 const width=large?.7:surface==='nose'?.56:surface.startsWith('engine')?.38:.15
 const spread=surface.startsWith('rear')?.9:.65
 const step=count>1?spread*2/(count-1):0
 const scale=count===1?(large?.65:surface==='nose'?.38:surface.startsWith('engine')?.35:.22):Math.max(.12,Math.min(large?.43:.26,width*step*.78))
 return decals.map(d=>{const i=panel.findIndex(p=>p.id===d.id);return i<0?d:{...d,x:count===1?0:-spread+i*step,y:0,scale,rotation:0}})
}
const color=(v:unknown)=>typeof v==='string'&&/^#[a-f0-9]{6}$/i.test(v)
const numberIn=(v:unknown,min:number,max:number)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max
export function isDesign(v:unknown):v is Design {
 if(!v||typeof v!=='object')return false
 const d=v as Design
 return d.version===2&&paintAreas.every(([key])=>color(d[key]))&&['matte','gloss','metallic'].includes(d.finish)&&['soft','medium','hard'].includes(d.compound)&&['corner','straight'].includes(d.aero)&&typeof d.number==='string'&&/^\d{0,2}$/.test(d.number)&&typeof d.text==='string'&&d.text.length<=24&&Array.isArray(d.decals)&&d.decals.length<=16&&d.decals.every(x=>x&&typeof x.id==='string'&&x.id.length<80&&typeof x.name==='string'&&x.name.length<=80&&typeof x.image==='string'&&x.image.length<800000&&/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(x.image)&&surfaces.some(s=>s.id===x.surface)&&numberIn(x.x,-1,1)&&numberIn(x.y,-1,1)&&numberIn(x.scale,.12,1.3)&&numberIn(x.rotation,-180,180)&&(x.text===undefined||typeof x.text==='string'&&x.text.length<=24)&&(x.ink===undefined||color(x.ink)))&&new Set(d.decals.map(x=>x.id)).size===d.decals.length
}
export function restoreDesign(raw:unknown):Design|null {
 if(isDesign(raw))return raw
 if(!raw||typeof raw!=='object'||(raw as {version?:number}).version!==1)return null
 const old=raw as Partial<Design>,next={...defaultDesign,...old,version:2,nose:old.body,engine:old.body,halo:old.wing,frontWing:old.wing,rearWing:old.wing} as Design
 return isDesign(next)?next:null
}
export function letteringImage(text:string,ink='#ffffff',subtitle=''){
 const c=document.createElement('canvas');c.width=1024;c.height=subtitle?330:240
 const ctx=c.getContext('2d')!;ctx.fillStyle=ink;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='italic 900 170px Arial';ctx.fillText(text,512,120,980)
 if(subtitle){ctx.font='600 36px Arial';ctx.fillText(subtitle,512,270,950)}
 return c.toDataURL('image/png')
}
export async function readLogo(file:File):Promise<string>{
 if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw new Error('Use a PNG, JPEG or WebP image.')
 if(file.size>2*1024*1024)throw new Error('Choose an image smaller than 2 MB.')
 const bitmap=await createImageBitmap(file)
 try{if(bitmap.width>4096||bitmap.height>4096)throw new Error('Image dimensions must be 4096 × 4096 or smaller.')
 const canvas=document.createElement('canvas'),ratio=Math.min(512/bitmap.width,512/bitmap.height,1);canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio));const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Your browser cannot process this image.');ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);const url=canvas.toDataURL('image/png');if(url.length>=800000)throw new Error('Try a smaller image.');return url
 }finally{bitmap.close()}
}
