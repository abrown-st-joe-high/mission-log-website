# CS Mission Log

Static site for GitHub Pages. Files: `index.html`, `style.css`, `script.js`, plus one HTML file per mission.

## Publish
1. Push these files to a repo.
2. Settings > Pages > Deploy from branch (main, root).

## Add a mission page
1. Copy `AppInventor_Part_I.html` and rename it.
2. Change `data-mission` on `<body>` to a unique id.
3. Every checkbox, date, text field, or textarea needs `data-save` and a unique `id`.
   Use `data-cadet` for cadet checkboxes and `data-control` for mission control checkboxes.
4. Add an entry to the `MISSIONS` list at the top of `script.js`.
