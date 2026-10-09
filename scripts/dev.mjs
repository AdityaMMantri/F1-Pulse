import { createServer } from 'vite'
import { createApi } from '../server/index.mjs'

const api=createApi()
let vite
try{
 await new Promise((resolve,reject)=>{api.once('error',reject);api.listen(3001,'127.0.0.1',resolve)})
 vite=await createServer({server:{host:'127.0.0.1',port:5173,strictPort:true}})
 await vite.listen();vite.printUrls()
 console.log('Garage and automatic racing backend ready on 127.0.0.1:3001. Both services stop with Ctrl+C.')
}catch(error){console.error(error.message);await vite?.close();api.close();process.exitCode=1}
async function stop(){await vite?.close();api.closeAllConnections();api.close();process.exit(0)}
process.on('SIGINT',stop);process.on('SIGTERM',stop)
