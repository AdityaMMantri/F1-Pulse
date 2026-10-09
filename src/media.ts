import kimiPhoto from './assets/Drivers/Kimi Antonelli.jpeg'
import racingBullsLogo from './assets/Logo/Racing Bulls F1.jpeg'
import alpineLogo from './assets/Logo/Alpine F1.jpeg'
// Supplied portraits may contain historical uniforms; roster data controls team identity.
const images = import.meta.glob<string>('./assets/optimized/*.webp', { eager: true, query: '?url', import: 'default' })
const asset = (name: string) => images['./assets/optimized/' + name + '.webp']
export { default as carImage } from './assets/Favicon.jpeg'
export const driverPhotos: Record<string,string | undefined> = Object.fromEntries(Object.entries({
  verstappen:'max-verstappen', norris:'lando-norris', leclerc:'charles-leclerc', piastri:'oscar-piastri',
  sainz:'carlos-sainz', russell:'george-russel', hamilton:'lewis-hamilton', perez:'sergio-perez',
  albon:'alex-albon', alonso:'fernando-alonso', bearman:'ollie-bearman', bortoleto:'gabriel-bortoleto',
  bottas:'valtteri-bottas', colapinto:'franco-colapinto', gasly:'pierre-gasly', hadjar:'issac-hadjar',
  hulkenberg:'hulkenberg', lawson:'liam-lawson', lindblad:'linblad', ocon:'esteban-ocon', stroll:'lance-stroll', tsunoda:'yuki-tsunoda',
}).map(([id,file])=>[id,asset('drivers-'+file)]))
export const teamLogos: Record<string,string | undefined> = Object.fromEntries(Object.entries({
  Mercedes:'mercedes-f1', Ferrari:'ferrari', McLaren:'mclaren-f1', 'Red Bull Racing':'red-bull-f1',
  'Haas F1 Team':'haas-f1', Audi:'audi-f1', Williams:'williams-f1', 'Aston Martin':'aston-martin-f1', Cadillac:'cadillac',
}).map(([name,file])=>[name,asset('logo-'+file)]))
export const circuitImages: Record<string,string | undefined> = Object.fromEntries(Object.entries({
  China:'shanghai-circuit', Japan:'suzuka-circuit', Monaco:'monaco-circuit', 'Great Britain':'british',
  Belgium:'belgium-circuit', Hungary:'hungarian-circuit', Netherlands:'dutch-circuit', Italy:'monza-circuit',
  Spain:'madrid-circuit', Azerbaijan:'baku-circuit', Singapore:'singapore-circuit', 'United States':'austin-circuit',
  Mexico:'mexico-circuit', Brazil:'brazil-circuit', 'Las Vegas':'las-vegas-circuit', Qatar:'qatar-circuit', 'Abu Dhabi':'abu-dhabi-circuit',
}).map(([name,file])=>[name,asset('maps-'+file)]))

// Newly supplied artwork, shared by every profile, card and comparison.
driverPhotos.antonelli = kimiPhoto
teamLogos['Racing Bulls'] = racingBullsLogo
teamLogos.Alpine = alpineLogo

// New circuit maps supplied for the six remaining venues.
const suppliedMaps = import.meta.glob<string>('./assets/maps/*', { eager: true, query: '?url', import: 'default' })
Object.assign(circuitImages, Object.fromEntries(Object.entries({
  Australia: 'Albert Park.jpg', Canada: 'Canada Circuit.jpg',
  'Barcelona-Catalunya': 'circuit de barcelona.png', Miami: 'Miami Circuit.jpg',
  Austria: 'Red Bull Ring.jpg', Bahrain: 'Sepang Circuit.jpg',
}).map(([name, file]) => [name, suppliedMaps['./assets/maps/' + file]])))
