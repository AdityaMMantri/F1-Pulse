import profileData from './profiles.json'
import resultData from './results.json'

export const updated = '5 October 2026'
export const snapshotDate = '2026-10-05'
export const sources = {
  drivers: 'https://www.formula1.com/en/results/2026/drivers',
  teams: 'https://www.formula1.com/en/results/2026/team',
  calendar: 'https://www.formula1.com/en/racing/2026',
  history: 'https://www.formula1.com/en/results/2025/drivers',
  replacements: 'https://www.formula1.com/en/latest/article/hadjar-to-make-racing-return-with-red-bull-at-azerbaijan-gp.1ddPnUSDEze0V9MCiQ9d2U',
}
export const lineupNote = 'Hadjar missed rounds 12–14. Lawson substituted at Red Bull, with Tsunoda taking the Racing Bulls seat. The regular pairing returned at Azerbaijan. Team points are attributed to the team represented at each event.'
export const teams = [
  { id: 'mercedes', name: 'Mercedes', points: 556, color: '#51d9c6' },
  { id: 'ferrari', name: 'Ferrari', points: 405, color: '#ff625c' },
  { id: 'mclaren', name: 'McLaren', points: 316, color: '#ff982e' },
  { id: 'red-bull', name: 'Red Bull Racing', points: 298, color: '#779dff' },
  { id: 'racing-bulls', name: 'Racing Bulls', points: 90, color: '#a4b6ff' },
  { id: 'alpine', name: 'Alpine', points: 68, color: '#ef96c5' },
  { id: 'haas', name: 'Haas F1 Team', points: 27, color: '#e1e3e7' },
  { id: 'audi', name: 'Audi', points: 17, color: '#f46b53' },
  { id: 'williams', name: 'Williams', points: 12, color: '#64a4ff' },
  { id: 'aston-martin', name: 'Aston Martin', points: 7, color: '#55d2a4' },
  { id: 'cadillac', name: 'Cadillac', points: 0, color: '#c5bdaf' },
]
export type Team = typeof teams[number]
type DriverSeed = [string, string, string, string, number, number, string]
const roster: DriverSeed[] = [
  ['antonelli', 'Kimi', 'Antonelli', 'mercedes', 12, 320, 'Italy'],
  ['russell', 'George', 'Russell', 'mercedes', 63, 236, 'United Kingdom'],
  ['hamilton', 'Lewis', 'Hamilton', 'ferrari', 44, 214, 'United Kingdom'],
  ['leclerc', 'Charles', 'Leclerc', 'ferrari', 16, 191, 'Monaco'],
  ['norris', 'Lando', 'Norris', 'mclaren', 1, 188, 'United Kingdom'],
  ['verstappen', 'Max', 'Verstappen', 'red-bull', 3, 188, 'Netherlands'],
  ['piastri', 'Oscar', 'Piastri', 'mclaren', 81, 128, 'Australia'],
  ['hadjar', 'Isack', 'Hadjar', 'red-bull', 6, 96, 'France'],
  ['lawson', 'Liam', 'Lawson', 'racing-bulls', 30, 65, 'New Zealand'],
  ['gasly', 'Pierre', 'Gasly', 'alpine', 10, 41, 'France'],
  ['lindblad', 'Arvid', 'Lindblad', 'racing-bulls', 41, 38, 'United Kingdom'],
  ['colapinto', 'Franco', 'Colapinto', 'alpine', 43, 27, 'Argentina'],
  ['bearman', 'Oliver', 'Bearman', 'haas', 87, 20, 'United Kingdom'],
  ['bortoleto', 'Gabriel', 'Bortoleto', 'audi', 5, 10, 'Brazil'],
  ['hulkenberg', 'Nico', 'Hulkenberg', 'audi', 27, 7, 'Germany'],
  ['ocon', 'Esteban', 'Ocon', 'haas', 31, 7, 'France'],
  ['alonso', 'Fernando', 'Alonso', 'aston-martin', 14, 7, 'Spain'],
  ['sainz', 'Carlos', 'Sainz', 'williams', 55, 7, 'Spain'],
  ['albon', 'Alexander', 'Albon', 'williams', 23, 5, 'Thailand'],
  ['tsunoda', 'Yuki', 'Tsunoda', 'racing-bulls', 22, 1, 'Japan'],
  ['stroll', 'Lance', 'Stroll', 'aston-martin', 18, 0, 'Canada'],
  ['bottas', 'Valtteri', 'Bottas', 'cadillac', 77, 0, 'Finland'],
  ['perez', 'Sergio', 'Perez', 'cadillac', 11, 0, 'Mexico'],
]
export interface Result { race: string; date: string; team: string; position: string; points: number }
export interface Profile {
  source: string
  season: Record<'races'|'gpPoints'|'wins'|'podiums'|'poles'|'top10'|'dnf'|'sprintRaces'|'sprintPoints'|'sprintWins'|'sprintPodiums', number | null>
  career: Record<'entries'|'points'|'wins'|'podiums'|'poles'|'titles', number | null>
}
export const drivers = roster.map(([id, first, last, teamId, number, points, country], i) => {
  const team = teams.find(t => t.id === teamId)!
  const profile = (profileData as Record<string, Profile>)[id]
  // Entries in the source are not starts. Do not use them as a percentage denominator.
  if (id === 'lindblad') profile.career.entries = null // Inconsistent source: 15 career entries vs 16 season races.
  return { id, first, last, teamId, team: team.name, color: team.color, number, points, country, position: i + 1,
    reserve: id === 'tsunoda', profile, results: (resultData as Record<string, Result[]>)[id] ?? [] }
})
export type Driver = typeof drivers[number]
export const history2025: Record<string, { position: number; points: number }> = Object.fromEntries(
  ['norris:423','verstappen:421','piastri:410','russell:319','leclerc:242','hamilton:156','antonelli:150','albon:73','sainz:64','alonso:56','hulkenberg:51','hadjar:51','bearman:41','lawson:38','ocon:38','stroll:33','tsunoda:33','gasly:22','bortoleto:19','colapinto:0'].map((v,i) => { const [id,points] = v.split(':'); return [id,{position:i+1,points:Number(points)}] })
)
type RaceSeed = [string,string,string,string,string]
const calendar: RaceSeed[] = [
  ['australia','Australia','Albert Park','03-06','03-08'],
  ['china','China','Shanghai International Circuit','03-13','03-15'],
  ['japan','Japan','Suzuka','03-27','03-29'],
  ['miami','Miami','Miami International Autodrome','05-01','05-03'],
  ['canada','Canada','Circuit Gilles-Villeneuve','05-22','05-24'],
  ['monaco','Monaco','Circuit de Monaco','06-05','06-07'],
  ['barcelona-catalunya','Barcelona-Catalunya','Circuit de Barcelona-Catalunya','06-12','06-14'],
  ['austria','Austria','Red Bull Ring','06-26','06-28'],
  ['great-britain','Great Britain','Silverstone','07-03','07-05'],
  ['belgium','Belgium','Spa-Francorchamps','07-17','07-19'],
  ['hungary','Hungary','Hungaroring','07-24','07-26'],
  ['netherlands','Netherlands','Zandvoort','08-21','08-23'],
  ['italy','Italy','Monza','09-04','09-06'],
  ['spain','Spain','Madring · Madrid','09-11','09-13'],
  ['azerbaijan','Azerbaijan','Baku City Circuit','09-24','09-26'],
  ['bahrain','Bahrain','Sepang · Malaysia','10-02','10-04'],
  ['singapore','Singapore','Marina Bay Street Circuit','10-09','10-11'],
  ['united-states','United States','Circuit of The Americas','10-23','10-25'],
  ['mexico','Mexico','Autódromo Hermanos Rodríguez','10-30','11-01'],
  ['brazil','Brazil','Interlagos','11-06','11-08'],
  ['las-vegas','Las Vegas','Las Vegas Strip Circuit','11-19','11-21'],
  ['qatar','Qatar','Lusail International Circuit','11-27','11-29'],
  ['abu-dhabi','Abu Dhabi','Yas Marina Circuit','12-04','12-06'],
]
export const races = calendar.map(([id,name,city,start,end],i) => ({ id,name,city,start:'2026-'+start,end:'2026-'+end,round:i+1,completed:i<16,source:'https://www.formula1.com/en/racing/2026/'+id }))
export type Race = typeof races[number]
export const nextRace = races.find(r => !r.completed)!
export const dateLabel = (date: string) => new Date(date+'T12:00:00Z').toLocaleDateString('en-GB',{day:'2-digit',month:'short',timeZone:'UTC'})
export const raceResults = (race: Race) => drivers.flatMap(driver => {
  const result = driver.results.find(r => r.race === race.name)
  return result ? [{driver,...result}] : []
}).sort((a,b) => (Number(a.position)||99)-(Number(b.position)||99))
export function averageFinish(d: Driver) {
  const finishes = d.results.map(r=>Number(r.position)).filter(n=>Number.isFinite(n)&&n>0)
  return finishes.length ? (finishes.reduce((a,b)=>a+b,0)/finishes.length).toFixed(1) : null
}
