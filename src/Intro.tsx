import { carImage } from './media'
import './styles/loader.css'
// Hand-traced contour of the supplied opaque 679 × 452 JPEG. No rectangular glow.
const outline = 'M45 113 L194 114 L213 128 L208 154 L156 158 L173 176 L225 153 Q229 134 254 134 L272 146 L300 159 L375 184 L461 216 Q473 178 510 180 Q546 180 553 217 L551 265 L636 295 L650 311 L643 344 L558 381 L432 363 L365 327 Q344 369 302 361 Q261 353 251 309 L159 288 Q143 309 105 304 L60 293 Q29 283 25 248 L26 212 Q31 184 54 179 L69 170 L65 153 L43 149 Z'
export default function Intro(){
  return <div className="pulse-loader" role="status" aria-label="Loading F1 Pulse"><div className="loader-brand">F1<span>PULSE</span><i/></div><div className="loader-car"><img src={carImage} width="679" height="452" alt=""/><svg viewBox="0 0 679 452" aria-hidden="true"><path d={outline} className="car-outline"/><path d={outline} className="car-shimmer" pathLength="100"/></svg></div><p>Preparing your racing universe…</p></div>
}
