import {build} from 'esbuild'
import {mkdir,readFile,writeFile,copyFile} from 'node:fs/promises'
import {execFileSync} from 'node:child_process'
await mkdir('docs/demo',{recursive:true})
await build({entryPoints:['demo/app.jsx'],outfile:'docs/demo/app.js',bundle:true,minify:true,format:'esm',alias:{'@hermes/plugin-sdk':'./demo/sdk.jsx'},define:{'process.env.NODE_ENV':'"production"'}})
execFileSync(process.execPath,['node_modules/@tailwindcss/cli/dist/index.mjs','-i','demo/style.css','-o','docs/demo/style.css','--minify'],{stdio:'inherit'})
await writeFile('docs/demo/index.html','<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Hermes Spotify Player 1.3 — interactive simulated demo of the real plugin UI."><title>Hermes × Spotify — Player 1.3 demo</title><link rel="stylesheet" href="style.css"></head><body><div id="root"></div><script type="module" src="app.js"></script></body></html>')
console.log('Built static demo from actual desktop/plugin.js; fixture backend explicitly labeled.')
