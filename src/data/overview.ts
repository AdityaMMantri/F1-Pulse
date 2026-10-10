import type { LiveSnapshot } from './live'

// Derive the recap afresh whenever the shared season snapshot changes.
export function latestRecap(live: LiveSnapshot | null) {
  const gpRound=live?.sessions.race.reduce((n,r)=>Math.max(n,r.round),0)??0
  const sprintRound=live?.sessions.sprint.reduce((n,r)=>Math.max(n,r.round),0)??0
  const session=sprintRound>gpRound?'sprint':'race'
  const round=Math.max(gpRound,sprintRound)
  const event=live?.calendar.find(r=>r.round===round)
  const date=session==='sprint'?event?.sprintDate:event?.date
  const podium=live?.sessions[session].filter(r=>r.round===round&&r.position>=1&&r.position<=3&&/^\d+$/.test(r.positionText)).sort((a,b)=>a.position-b.position)??[]
  return {session,round,date,podium,winner:podium.find(r=>r.position===1)}
}
