import { Link } from 'react-router'

const norman = [
 ['N1','Knowledge in the world and in the head','Visible search labels, examples, graph definitions, and named artwork surfaces reduce guessing.','/compare'],
 ['N2','Simplify the structure of tasks','The Garage presents three steps: paint, identity, and artwork. Chart presets offer a ready-made starting point.','/cars'],
 ['N3','Make things visible','Selected controls, filter counts, the live car preview, and status messages show the result of an action.','/cars'],
 ['N4','Get the mappings right','Driver selectors match the chart legend; car surface choices switch to the relevant camera angle.','/compare'],
 ['N5','Use constraints','The same driver cannot occupy both comparison slots. Artwork limits and disabled undo prevent invalid actions.','/compare'],
 ['N6','Design for error','Garage undo/redo, reset confirmation, clear filters, and upload error messages provide recovery.','/cars'],
 ['N7','Standardize','Shared navigation, labelled form controls, familiar buttons, and visible keyboard focus work consistently across pages.','/drivers'],
]
const shneiderman = [
 ['S1','Strive for consistency','The same navigation, button styles, headings, and active-state treatment recur throughout the site.','/'],
 ['S2','Enable shortcuts','Press / to focus global search. In the Garage, Alt+S saves, Alt+Z undoes, and Alt+Shift+Z redoes. Shortcuts ignore text fields.','/cars'],
 ['S3','Offer informative feedback','Result counts, selected chart settings, the live preview, and Garage status messages explain what changed.','/drivers'],
 ['S4','Give interactions closure','Saving, loading, exporting, and resetting end with a clear confirmation message. The Garage distinguishes saved and unsaved work.','/cars'],
 ['S5','Prevent errors and support recovery','Distinct-driver constraints, upload validation, separate artwork positions, and actionable empty states prevent or explain errors.','/compare'],
 ['S6','Permit easy reversal','Garage Undo and Redo reverse design changes, including reset. Filters have a clearly labelled reset action.','/cars'],
 ['S7','Keep users in control','Users choose the camera, chart, period, and artwork action. Reset is confirmed; HCI annotations can be switched off.','/cars'],
 ['S8','Reduce short-term memory load','Labels, current selections, chart legends, exact-data tables, and the artwork list keep relevant context visible.','/compare'],
]

export default function HciGuide({close}:{close:()=>void}){
 return <aside className="hci-guide" aria-label="HCI implementation guide">
  <div className="hci-guide-title"><div><span className="eyebrow">HCI PRESENTATION MODE</span><h2>Principles in practice</h2><p>Highlighted areas carry the matching N or S codes. Follow a link to inspect the example.</p></div><button className="button secondary" onClick={close}>Hide highlights</button></div>
  <div className="hci-guide-groups">{[['Norman’s 7 principles',norman],['Shneiderman’s 8 golden rules',shneiderman]].map(([title,items])=><details key={title as string}><summary>{title as string}</summary><ol>{(items as string[][]).map(([id,name,evidence,to])=><li key={id}><span className="hci-code">{id}</span><div><strong>{name}</strong><p>{evidence}</p><Link to={to}>See implementation ↗</Link></div></li>)}</ol></details>)}</div>
 </aside>
}
