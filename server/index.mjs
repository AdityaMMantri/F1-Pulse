import { createServer } from 'node:http'
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRacingService } from './racing.mjs'

const colors=['body','accent','wing','nose','engine','halo','rims','frontWing','rearWing']
const surfaces=['left','right','nose','engine-left','engine-right','rear-left','rear-right']
const color=v=>typeof v==='string'&&/^#[a-f\d]{6}$/i.test(v)
const range=(v,a,b)=>typeof v==='number'&&Number.isFinite(v)&&v>=a&&v<=b
export function validDesign(d){
 return !!d&&d.version===2&&colors.every(k=>color(d[k]))&&['matte','gloss','metallic'].includes(d.finish)&&['soft','medium','hard'].includes(d.compound)&&['corner','straight'].includes(d.aero)&&typeof d.number==='string'&&/^\d{0,2}$/.test(d.number)&&typeof d.text==='string'&&d.text.length<=24&&Array.isArray(d.decals)&&d.decals.length<=16&&d.decals.every(x=>x&&typeof x.id==='string'&&x.id.length<80&&typeof x.name==='string'&&x.name.length<=80&&surfaces.includes(x.surface)&&typeof x.image==='string'&&x.image.length<800000&&/^data:image\/png;base64,[a-z\d+/=]+$/i.test(x.image)&&range(x.x,-1,1)&&range(x.y,-1,1)&&range(x.scale,.12,1.3)&&range(x.rotation,-180,180)&&(x.text===undefined||typeof x.text==='string'&&x.text.length<=24)&&(x.ink===undefined||color(x.ink)))&&new Set(d.decals.map(x=>x.id)).size===d.decals.length
}

export function createApi({dataFile=resolve(dirname(fileURLToPath(import.meta.url)),'data/garage.json'), racing=true, racingService}={}){
 const feed = racingService ?? (racing ? createRacingService({cacheFile:resolve(dirname(dataFile),'racing-2026.json')}) : null)
 let writes=Promise.resolve()
 const send=(res,status,body)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(body))}
 const server = createServer(async(req,res)=>{
  const path=new URL(req.url,'http://localhost').pathname
  try{
   if(req.method==='GET'&&path==='/api/health')return send(res,200,{status:'ok',storage:'file',service:'F1 Pulse',racing:feed?.state().meta??null})
   if(path==='/api/racing/2026'){
    if(req.method!=='GET')return send(res,405,{error:'Use GET for season data.'})
    if(!feed)return send(res,503,{error:'Racing service disabled.'})
    await feed.ready
    return send(res,200,feed.state())
   }
   if(path!=='/api/garage/design')return send(res,404,{error:'Endpoint not found.'})
   if(req.method==='GET'){
    await writes
    try{return send(res,200,JSON.parse(await readFile(dataFile,'utf8')))}catch(error){if(error.code==='ENOENT')return send(res,404,{error:'No server design yet. Save one first.'});throw error}
   }
   if(req.method!=='PUT')return send(res,405,{error:'Use GET or PUT for garage designs.'})
   if(!req.headers['content-type']?.includes('application/json'))return send(res,415,{error:'Send a JSON design.'})
   const chunks=[];let size=0
   for await(const chunk of req){size+=chunk.length;if(size>14_000_000){send(res,413,{error:'Design is too large.'});return}chunks.push(chunk)}
   let design
   try{design=JSON.parse(Buffer.concat(chunks).toString('utf8'))}catch{return send(res,400,{error:'Invalid JSON.'})}
   if(!validDesign(design))return send(res,400,{error:'Invalid car design. Check colours, text, and artwork limits.'})
   const record={design,savedAt:new Date().toISOString()}
   const write=writes.then(async()=>{await mkdir(dirname(dataFile),{recursive:true});await writeFile(dataFile+'.tmp',JSON.stringify(record,null,2));await rename(dataFile+'.tmp',dataFile)})
   writes=write.catch(()=>{})
   await write
   return send(res,200,{savedAt:record.savedAt,message:'Design saved on the server.'})
  }catch(error){console.error('Garage API:',error.message);if(!res.headersSent)send(res,500,{error:'Storage is unavailable. Your browser design has not changed.'})}
 })
 server.once('listening',()=>{void feed?.start()})
 server.once('close',()=>feed?.stop())
 return server
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const server=createApi();server.listen(3001,'127.0.0.1',()=>console.log('Garage API: http://127.0.0.1:3001'))
}
