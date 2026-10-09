# HCI principles in F1 Pulse

Enable **HCI highlights** in the header to see implementation areas labelled with these codes. Expand either principle group for explanations and links. Turn highlights off for the normal interface.

| Code | Principle | Implementation | Page |
|---|---|---|---|
| N1 | Knowledge in the world and in the head | Visible search labels, examples, graph definitions, and named artwork surfaces reduce guessing. | `/compare` |
| N2 | Simplify the structure of tasks | The Garage presents three steps: paint, identity, and artwork. Chart presets offer a ready-made starting point. | `/cars` |
| N3 | Make things visible | Selected controls, filter counts, the live car preview, and status messages show the result of an action. | `/cars` |
| N4 | Get the mappings right | Driver selectors match the chart legend; car surface choices switch to the relevant camera angle. | `/compare` |
| N5 | Use constraints | The same driver cannot occupy both comparison slots. Artwork limits and disabled undo prevent invalid actions. | `/compare` |
| N6 | Design for error | Garage undo/redo, reset confirmation, clear filters, and upload error messages provide recovery. | `/cars` |
| N7 | Standardize | Shared navigation, labelled form controls, familiar buttons, and visible keyboard focus work consistently across pages. | `/drivers` |
| S1 | Strive for consistency | The same navigation, button styles, headings, and active-state treatment recur throughout the site. | `/` |
| S2 | Enable shortcuts | Press / to focus global search. In the Garage, Alt+S saves, Alt+Z undoes, and Alt+Shift+Z redoes. Shortcuts ignore text fields. | `/cars` |
| S3 | Offer informative feedback | Result counts, selected chart settings, the live preview, and Garage status messages explain what changed. | `/drivers` |
| S4 | Give interactions closure | Saving, loading, exporting, and resetting end with a clear confirmation message. The Garage distinguishes saved and unsaved work. | `/cars` |
| S5 | Prevent errors and support recovery | Distinct-driver constraints, upload validation, separate artwork positions, and actionable empty states prevent or explain errors. | `/compare` |
| S6 | Permit easy reversal | Garage Undo and Redo reverse design changes, including reset. Filters have a clearly labelled reset action. | `/cars` |
| S7 | Keep users in control | Users choose the camera, chart, period, and artwork action. Reset is confirmed; HCI annotations can be switched off. | `/cars` |
| S8 | Reduce short-term memory load | Labels, current selections, chart legends, exact-data tables, and the artwork list keep relevant context visible. | `/compare` |

## Demonstration sequence

1. Press `/` to focus global search, then search for a driver.
2. Open Drivers, filter the grid, and clear the filters.
3. Open Compare: choose drivers, change the period and chart, and inspect exact values. The opposite selected driver is disabled in each selector.
4. Open Garage: use the three task steps, change a preset, undo with Alt+Z, redo with Alt+Shift+Z, and save with Alt+S. Observe saved/unsaved status and completion feedback. Shortcuts ignore input fields.
5. Add artwork in separate positions or replace the selected item. Try an invalid upload to see recovery guidance.
6. Open Reset, then Cancel; reset is also undoable.

The loading intro remains 4.5 seconds minimum. Only a short red glow travels around the supplied car image; there is no permanent outline. Reduced-motion preferences suppress the travelling glow.
