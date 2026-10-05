# CS Mission Log

Static site for GitHub Pages. Files: `index.html`, `style.css`, `script.js`, `template.html`, plus one HTML file per mission (currently `AppInventor_Part_I.html`, `AppInventor_Above_and_Beyond.html`, `SideQuests.html`).

## Publish
1. Push these files to a repo.
2. Settings > Pages > Deploy from branch (main, root).

## Add a new page
1. Copy `template.html` and rename it, e.g. `MissionName.html`.
2. Follow the HOW-TO comments inside the file: set a unique `data-mission` id on `<body>`, fill in the checklist items (each checkbox needs `data-save` plus `data-cadet` or `data-control` and a unique `id`), and delete whichever optional sections (warning banner, notes, submit button) are not needed.
3. Add one entry to the `MISSIONS` list near the top of `script.js` so the page shows up as a card on the home page.

Nesting: a top-level item becomes a group by giving its row `class="row group"` and adding a nested `<ul>` of subitem rows underneath — see `template.html` or `AppInventor_Part_I.html`'s SimpleDrawingApps item for a working example. Groups can nest more than one level by repeating the pattern inside a subitem.
