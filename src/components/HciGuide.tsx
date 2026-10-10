import { Link, useLocation } from 'react-router'

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

const explanations: Record<string, [string,string]> = {
 N1:['Put useful knowledge beside the task instead of expecting users to remember it.','The expanded F1 guide explains result notation and charts with examples, so beginners can interpret the same information as experienced fans.'],
 N2:['Break a complex task into small, understandable steps.','Garage Paint, Identity and Artwork steps separate decisions; comparison presets and guide chapters provide clear starting points.'],
 N3:['Make available actions and the current state easy to see.','The championship leader appears once with rank and points; results show sync context, and the Garage previews each edit immediately.'],
 N4:['Make the relationship between a control and its result natural.','Team colours accompany names and numerical ranks. Chart legends identify each driver, while Garage surface selection directs the camera.'],
 N5:['Limit choices that would produce invalid or confusing states.','Distinct comparison drivers, bounded text and artwork limits prevent avoidable mistakes before submission.'],
 N6:['Assume mistakes happen and provide a way to recover.','Undo, clear filters and actionable validation let users repair their work without starting again.'],
 N7:['Use familiar patterns where users should not need to learn a new convention.','Labelled inputs, common navigation and native expandable sections remain predictable across the redesigned pages.'],
 S1:['Use consistent words, controls and visual meanings.','Team identity colours, navigation states and button treatments remain consistent even when sections use different layouts.'],
 S2:['Let experienced users complete frequent tasks with fewer steps.','Global search and Garage keyboard shortcuts speed up repeat visits without removing visible controls.'],
 S3:['Explain what an action did and what the system is doing.','The latest-result recap identifies its sync time; save feedback and driver filter counts show the current outcome.'],
 S4:['Give a sequence of actions a recognisable ending.','Save, load and export feedback confirm completion; saved versus unsaved design status makes the result explicit.'],
 S5:['Prevent common errors and explain how to fix remaining ones.','Upload limits, distinct driver selection and separate artwork positions reduce invalid input and accidental overlap.'],
 S6:['Make appropriate actions reversible.','Undo and Redo support experimentation with paint and artwork; reset can be cancelled before committing.'],
 S7:['Let users direct the interaction.','Users choose chart period, metric, camera and guide disclosures. HCI mode can be hidden whenever it is no longer useful.'],
 S8:['Keep necessary context visible rather than relying on memory.','Ranks, names, points, chart legends and nearby explanations reduce the need to remember information from another screen.'],
}
const walkthroughs: Record<string, [string,string,string,string][]> = {
 '/': [['N3 · N4 · S8','Championship hierarchy','.championship-feature','A single leader portrait carries rank 1, followed by positions 2–5. Team colours and explicit points make the order easy to scan without duplicate information.'],['N3 · N4 · S8','A different story in the sidebar','.brief-next','Constructor standings complement the driver battle. The upcoming weekend remains at the top rather than being repeated here.'],['N3 · S3','Results with context','.weekend-brief','The recap is derived from published race or sprint results. Its sync label distinguishes saved information from newly fetched results.']],
 '/learn': [['N1 · N2 · S8','Choose a learning path','.guide-index','Chapter links make the guide navigable without reading everything. Examples, a scoring table and expandable explanations keep help close to the question.'],['N1 · N4 · S8','Decode the numbers','#results','Plain-language definitions explain gaps, statuses, missing data and chart scales, so a reader can evaluate results rather than guess.']],
 '/cars': [['N2 · S8','A staged design workflow','.task-steps','Paint, Identity and Artwork organise the studio around the user’s decisions.'],['N6 · S6','Safe experimentation','.reset-control','Reset asks for confirmation, and undo provides recovery. Browser and shared-server saves are separately labelled.']],
 '/compare': [['N4 · N5 · S5','Compare distinct drivers','.comparison-selectors','Each labelled selector belongs to its portrait. The other selected driver is unavailable, preventing a meaningless self-comparison.'],['N2 · S8','Start from a useful graph','.chart-presets','Presets provide a starting point; chart controls, reading notes and legends support deeper exploration.']],
 '/circuits': [['N1 · S8','Recognise the venue','.circuit-grid','Track maps, names and weekend dates stay together in selectable cards. Users can recognise a circuit without memorising its name.']],
 '/teams': [['N7 · S1 · S8','Consistent team identity','.team-grid','Team cards retain the same visual structure, with names and colours supporting quick recognition and comparison.']],
 '/drivers': [['N1 · N3 · S3 · S8','Visible search feedback','.toolbar','Search, team filter, sort and result count stay together. Clear filters provides a direct recovery path.']],
}
export default function HciGuide({close}:{close:()=>void}){
 const {pathname}=useLocation()
 const examples=walkthroughs[pathname]??(pathname.startsWith('/circuits/')?[['N3 · N4 · S8','Session results in context','.result-panel','Session tabs separate qualifying, Sprint and Grand Prix. Team colours accompany position badges; top-ten qualifying highlights and the podium serve different purposes.']]:[])
 function reveal(selector:string){const target=document.querySelector<HTMLElement>(selector);if(target){target.setAttribute('tabindex','-1');target.focus({preventScroll:true});target.scrollIntoView({block:'center',behavior:'instant'})}}
 return <aside className="hci-guide" aria-label="HCI implementation guide">
  <div className="hci-guide-title"><div><span className="eyebrow">HCI PRESENTATION MODE</span><h2>Principles in practice</h2><p>N = Norman. S = Shneiderman. Dashed outlines mark examples on this page. Each principle below explains the idea, the implementation and its benefit. Press Escape to leave presentation mode.</p></div><button className="button secondary" onClick={close}>Hide highlights</button></div>
  {examples.length>0&&<section className="hci-walkthrough"><h3>On this page</h3><div>{examples.map(([codes,title,selector,copy])=><article key={title}><span className="hci-code">{codes}</span><h4>{title}</h4><p>{copy}</p><button className="text-button" aria-label={"Show example: "+title} onClick={()=>reveal(selector)}>Show this example ↓</button></article>)}</div></section>}
  <div className="hci-guide-groups">{[['Norman’s 7 principles',norman],['Shneiderman’s 8 golden rules',shneiderman]].map(([title,items])=><details key={title as string}><summary>{title as string}</summary><ol>{(items as string[][]).map(([id,name,evidence,to])=><li key={id}><span className="hci-code">{id}</span><div><strong>{name}</strong><p><b>The principle:</b> {explanations[id][0]}</p><p><b>In this project:</b> {evidence}</p><p><b>Why it helps:</b> {explanations[id][1]}</p><Link to={to}>See implementation ↗</Link></div></li>)}</ol></details>)}</div>
 </aside>
}
