# Sourcecode Revealer

Give it a website URL, and it reconstructs the site's **original source code** by reading the [source maps](https://developer.mozilla.org/en-US/docs/Glossary/Source_map) shipped to production — then lets you browse and download it.

[Source maps](https://developer.mozilla.org/en-US/docs/Glossary/Source_map) are incredibly helpful for debugging, but it's easy to forget how much they reveal about your code. This tool exists to raise awareness that **a publicly reachable source map is a potential attack surface** — it can expose your original file structure, comments, internal logic, and sometimes secrets.

## What it does

- Takes any application URL and finds all the JavaScript it loads.
- Fetches the matching `.js.map` source map for each script.
- Reconstructs the original source tree (folders + files) from those maps.
- Lets you **browse** the recovered code in an in-browser file explorer (Monaco editor).
- Lets you **download** the entire reconstructed codebase as a `.zip`.

If no source maps are found, it tells you the site isn't leaking anything this way.

## How it works

1. **Fetch the page** — The URL is loaded through a small serverless CORS proxy ([`api/cors-proxy.mjs`](api/cors-proxy.mjs)) so the browser can read cross-origin responses.
2. **Discover scripts** — It parses the HTML for `<script src="...">` tags and also scans inline scripts for lazily-loaded chunk names (e.g. webpack/CRA `static/js/*.chunk.js`). See [getAllScripts](src/service.ts).
3. **Grab source maps** — For each script URL it requests the `.js.map` file (`script.js` → `script.js.map`). See [getSourceMap](src/service.ts).
4. **Combine & normalize** — All the maps' `sources` and `sourcesContent` are merged, and noisy `../../` prefixes are flattened into a readable tree. See [getSourceMaps](src/util.ts).
5. **Browse or download** — The reconstructed tree is rendered in the [file explorer](src/FileExplorer/FileExplorer.tsx), and [packFiles](src/util.ts) zips everything up (via `client-zip`) for download.

```
URL ─▶ CORS proxy ─▶ HTML ─▶ find scripts ─▶ fetch .js.map
                                                   │
                              merge sources + sourcesContent
                                                   │
                                 ┌─────────────────┴─────────────────┐
                              browse in file explorer          download as .zip
```

The result is deep-linkable — the URL you analyze is stored in the page hash, so you can share a link that reopens the same analysis.

## Tech stack

React 19 + TypeScript + Vite, [RSuite](https://rsuitejs.com/) for UI, [Monaco](https://microsoft.github.io/monaco-editor/) for the code viewer, and Vercel serverless functions for the CORS proxy.

## Running locally

```bash
npm install
npm run dev
```

Then open the printed local URL and paste in a site to analyze.

## Roadmap

- [x] Show incremental update on UI while fetching source map
- [x] Make deep linkable/sharable
- [ ] Show result - Leak detected or Not Detected etc
- [ ] Show how to fix
- [ ] Integrate VS Code for better search/explore
- [ ] Show list of npm packages used, maybe vulnerabilities also?
- [ ] Try to locate sensitive info, API paths and other automated recon
- [ ] Fetch license.txt also and try to parse it for libs used
- [ ] Authored code vs lib code (same as Google Dev Tools)
