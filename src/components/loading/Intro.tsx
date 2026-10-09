import { carImage } from '../../media'
import '../../styles/loader.css'

// Contour follows the supplied car image; only a short moving segment is visible.
const outline = 'M40 142 L169 112 Q187 110 201 119 L204 128 L197 138 L181 149 L177 158 L209 135 Q221 128 238 132 L239 124 L223 125 L223 120 L259 115 L263 117 L262 122 L249 126 L252 134 Q269 140 278 171 L317 165 L333 161 L339 166 L334 176 L348 194 L367 183 L390 174 L399 165 L403 166 L401 178 L379 190 L368 201 L399 213 L444 215 L466 220 Q476 184 500 180 Q533 174 552 193 Q572 214 576 252 L593 262 L614 254 L624 261 L612 268 L629 284 L642 287 L642 298 L630 308 L600 321 Q582 340 548 349 L501 356 L439 356 L437 376 L422 377 L398 371 L367 370 L339 365 Q309 375 288 366 Q265 357 252 333 L220 322 L212 310 L167 301 L112 278 Q85 291 60 283 Q34 269 29 239 Q24 218 28 204 Q29 189 44 184 L54 182 L48 174 L43 162 Z'

export default function Intro() {
  return (
    <div className="pulse-loader" role="status" aria-label="Loading F1 Pulse">
      <div className="loader-brand">F1<span>PULSE</span><i /></div>
      <div className="loader-car">
        <img src={carImage} width="679" height="452" alt="" fetchPriority="high" />
        <svg viewBox="0 0 679 452" aria-hidden="true">
          <path d={outline} className="car-shimmer car-glow" pathLength="100" />
          <path d={outline} className="car-shimmer" pathLength="100" />
        </svg>
      </div>
      <p>Preparing your racing universe…</p>
    </div>
  )
}
