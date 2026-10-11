# HCI principles in the current prototype

Turn on **HCI highlights** in the header. N codes refer to Norman; S codes refer to Shneiderman. Use **On this page** to jump to an example, and expand either principles group for implementation details. Escape hides the annotations.

## Current design changes

- Overview shows the leader once, with rank 1, then the remaining top five.
- The upcoming weekend appears only at the top; constructor standings complement the driver battle below.
- The driver showcase rotates distinct random pairs from the full roster every 12 seconds without repeating championship positions or points. Its comparison link opens the displayed pair; New pairing and Pause/Resume keep rotation under user control (N3, N4, S7).
- The recap derives from published race/sprint results and displays sync context. It is not an editorial news feed.
- The F1 guide shows one of five chapters at a time. Direct links, sequential Next/Previous controls, an active chapter and progress indicator support orientation (N2, S8).
- A weekend timeline and qualifying progression make sequence visible. Scoring bars and the worked 18 + 10 = 28 example distinguish driver scores from the constructor total (N1, N4).
- Numbered native disclosures explain strategy through a definition, example and watching tips (N1, N7, S7, S8). The Corner/Straight switch updates the illustrative wing profile, airflow and explanation together (N3, N4, S7).
- In HCI mode, Show this example opens the relevant guide chapter before focusing it, even when that chapter was hidden.
- Garage groups paint, identity and artwork, with live preview, labelled saves and undo/redo.
- Comparison offers period selection, graph presets, configurable metrics and reading guidance.

## Principle explanations

### N1

Put useful knowledge beside the task instead of expecting users to remember it.

The expanded F1 guide explains result notation and charts with examples, so beginners can interpret the same information as experienced fans.

### N2

Break a complex task into small, understandable steps.

Garage Paint, Identity and Artwork steps separate decisions; comparison presets and guide chapters provide clear starting points.

### N3

Make available actions and the current state easy to see.

The championship leader appears once with rank and points; results show sync context, and the Garage previews each edit immediately.

### N4

Make the relationship between a control and its result natural.

The featured driver pair matches its comparison link. Wing modes update the illustration and explanation together, and scoring bars use a shared scale. Chart legends identify each driver, while Garage surface selection directs the camera.

### N5

Limit choices that would produce invalid or confusing states.

Distinct comparison drivers, bounded text and artwork limits prevent avoidable mistakes before submission.

### N6

Assume mistakes happen and provide a way to recover.

Undo, clear filters and actionable validation let users repair their work without starting again.

### N7

Use familiar patterns where users should not need to learn a new convention.

Labelled inputs, common navigation and native expandable sections remain predictable across the redesigned pages.

### S1

Use consistent words, controls and visual meanings.

Team identity colours, navigation states and button treatments remain consistent even when sections use different layouts.

### S2

Let experienced users complete frequent tasks with fewer steps.

Global search and Garage keyboard shortcuts speed up repeat visits without removing visible controls.

### S3

Explain what an action did and what the system is doing.

The latest-result recap identifies its sync time; save feedback and driver filter counts show the current outcome.

### S4

Give a sequence of actions a recognisable ending.

Save, load and export feedback confirm completion; saved versus unsaved design status makes the result explicit.

### S5

Prevent common errors and explain how to fix remaining ones.

Upload limits, distinct driver selection and separate artwork positions reduce invalid input and accidental overlap.

### S6

Make appropriate actions reversible.

Undo and Redo support experimentation with paint and artwork; reset can be cancelled before committing.

### S7

Let users direct the interaction.

Users can pause/resume the driver showcase or request a new random pairing. They also choose chart period, metric, camera, guide chapters, wing modes and strategy disclosures. HCI mode can be hidden whenever it is no longer useful.

### S8

Keep necessary context visible rather than relying on memory.

Ranks, names, points, chart legends and nearby explanations reduce the need to remember information from another screen.

These are design rationales, not evidence of measured usability improvements. Validate them through task-based usability testing.
