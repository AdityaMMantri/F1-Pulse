import { lazy, Suspense, Component, type ReactNode } from 'react'
import Intro from './Intro'
import { carImage } from '../../media'
const App = lazy(async () => {
  const image = new Image()
  image.src = carImage
  const [module] = await Promise.all([import('../../App'), image.decode().catch(() => undefined), new Promise(resolve => setTimeout(resolve, 4500))])
  return module
})
class AppBoundary extends Component<{children:ReactNode},{failed:boolean}>{
  state={failed:false}
  static getDerivedStateFromError(){return {failed:true}}
  render(){return this.state.failed?<main style={{padding:40}}><h1>A pit stop is needed.</h1><p>The page could not load. Your saved garage design is still stored on this device.</p><button onClick={()=>window.location.reload()}>Reload F1 Pulse</button></main>:this.props.children}
}
export default function Bootstrap(){return <AppBoundary><Suspense fallback={<Intro/>}><App/></Suspense></AppBoundary>}
