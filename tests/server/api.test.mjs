import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve, sep } from 'node:path'
import { createApi } from '../../server/index.mjs'

test('garage persistence, validation, and restart',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'pulse-api-'))
 let server
 const start=async()=>{server=createApi({dataFile:join(directory,'garage.json'),racing:false});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));return `http://127.0.0.1:${server.address().port}`}
 const stop=async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve))}
 try{
  let base=await start()
  assert.equal((await fetch(base+'/api/health')).status,200)
  assert.equal((await fetch(base+'/api/garage/design')).status,404)
  const design={version:2,...Object.fromEntries(['body','accent','wing','nose','engine','halo','rims','frontWing','rearWing'].map(k=>[k,'#123456'])),finish:'gloss',compound:'medium',aero:'corner',number:'26',text:'PERSISTED',decals:[]}
  const put=value=>fetch(base+'/api/garage/design',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(value)})
  assert.equal((await put(design)).status,200)
  assert.equal((await put({...design,body:'invalid'})).status,400)
  assert.equal((await fetch(base+'/api/garage/design',{method:'PUT',headers:{'Content-Type':'application/json'},body:'{'})).status,400)
  await stop();base=await start()
  const record=await (await fetch(base+'/api/garage/design')).json()
  assert.deepEqual(record.design,design)
  assert.ok(record.savedAt)
 }finally{if(server?.listening)await stop();assert.ok(resolve(directory).startsWith(resolve(tmpdir())+sep+'pulse-api-'));await rm(directory,{recursive:true,force:true})}
})

