import { restoreDesign, type Design } from './design'

async function request(path:string,options?:RequestInit){
 const response=await fetch(path,{...options,signal:AbortSignal.timeout(10000)})
 const body=await response.json()
 if(!response.ok)throw new Error(body.error??'The server could not complete this request.')
 return body
}
export const checkServer=()=>request('/api/health')
export const saveServerDesign=(design:Design)=>request('/api/garage/design',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(design)})
export async function loadServerDesign(){
 const body=await request('/api/garage/design'),design=restoreDesign(body.design)
 if(!design)throw new Error('The stored design is invalid. Your current design is unchanged.')
 return {design,savedAt:body.savedAt as string}
}
