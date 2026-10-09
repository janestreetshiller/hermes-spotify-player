// Isolated fixture-only acceptance of distinct reference geometry and shared state.
import {chromium} from 'playwright'
import assert from 'node:assert/strict'
import {createServer} from 'node:http'
import {readFile,mkdir,writeFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
const assets=new Map(await Promise.all([['/','index.html','text/html'],['/app.js','app.js','text/javascript'],['/style.css','style.css','text/css'],['/artwork.webp','artwork.webp','image/webp']].map(async([url,file,type])=>[url,{body:await readFile('docs/demo/'+file),type}])))
const server=createServer((req,res)=>{const a=assets.get(req.url);res.writeHead(a?200:404,{'Content-Type':a?.type||'text/plain'});res.end(a?.body)})
await new Promise(r=>server.listen(0,'127.0.0.1',r))
const origin=`http://127.0.0.1:${server.address().port}`
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']})
const page=await browser.newPage({viewport:{width:1100,height:850},deviceScaleFactor:2})
await page.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():r.abort())
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(5000)
const shell=page.locator('.spotify-surface'),button=name=>shell.getByRole('button',{name,exact:true})
const settings=async()=>{await button('Player settings').click();await page.getByLabel('Player style',{exact:true}).waitFor()}
const calls=action=>page.evaluate(a=>window.demoCalls.filter(c=>c.action===a),action)
const results=[]
try {
 await mkdir('docs/evidence/styles',{recursive:true})
 await page.goto(origin+'/');await button('Pause Spotify').waitFor()
 await settings();await page.getByRole('radio',{name:'Ice blue',exact:true}).check()
 await page.getByLabel('Player style',{exact:true}).selectOption('quicktime')
 await page.locator('[data-style=quicktime]').waitFor()
 await page.waitForFunction(()=>document.activeElement?.getAttribute('aria-label')==='Player style')
 await page.keyboard.press('Escape');await button('Pause Spotify').waitFor()
 assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('aria-label')),'Player settings')
 assert.equal(await page.locator('.spotify-metal canvas').count(),0,'QuickTime does not reuse the silver GPU rim')
 for(const action of ['pause','play','next','previous','seek','volume','like','unlike','playlist-add'])assert.equal((await calls(action)).length,0,'style selection is not a playback/account command')
 results.push('Distinct rectangular layout selected without playback/account commands; settings focus restored')
 await page.reload();await page.locator('[data-style=quicktime]').waitFor();await button('Pause Spotify').waitFor()
 results.push('Reference layout persisted across reload')
 for(const style of ['quicktime','wmp-curved','handheld','droplet','wmp-classic','wmp-glass','jetaudio','organic','dark-playlist','wmp-library']) {
 await settings();await page.getByLabel('Player style',{exact:true}).selectOption(style);await page.keyboard.press('Escape')
 for(const width of [234,340,640]) {
  await page.locator('.product').evaluate((e,w)=>e.style.width=w+'px',width)
  for(const [mode,label] of [['on','Full player'],['off','Transport only'],['mini','Compact mini']]) {
   await settings();await page.getByRole('radio',{name:label,exact:true}).click()
   // Compact/off intentionally unmount the settings radio. Assert the rendered
   // and persisted result, rather than waiting on a detached input's checked bit.
   await page.waitForFunction(mode=>document.querySelector('.spotify-surface')?.dataset.screen===mode&&JSON.parse(localStorage.getItem('spotify-demo:playerPreferences'))?.mode===mode,mode)
   if(mode==='on')await page.keyboard.press('Escape')
   await page.waitForTimeout(120)
   const g=await shell.evaluate(e=>{const r=e.getBoundingClientRect();return {frame:r.toJSON(),style:e.dataset.style,buttons:[...e.querySelectorAll('button')].map(b=>({label:b.getAttribute('aria-label'),...b.getBoundingClientRect().toJSON()})),viewport:e.closest('.spotify-retro-viewport').getBoundingClientRect().toJSON()}})
   assert.equal(g.style,style);assert.ok(g.frame.width<=g.viewport.width+.5)
   for(const b of g.buttons)assert.ok(b.left>=g.frame.left-.5&&b.top>=g.frame.top-.5&&b.right<=g.frame.right+.5&&b.bottom<=g.frame.bottom+.5,`${style}/${width}/${mode}: ${b.label} outside frame`)
   const p=await button('Pause Spotify').boundingBox();assert.ok(p.width>=29.5,'transport remains legible logical size, not uniformly shrunk')
   await shell.screenshot({path:`docs/evidence/styles/${style}-${mode}-${width}.png`})
  }
 }
 }
 results.push('Ten reference layouts: expanded/off/mini containment at 234/340/640px; 30px central transport maintained')
 await settings();await page.getByLabel('Player style',{exact:true}).selectOption('quicktime');await page.keyboard.press('Escape')
 await settings();await page.getByRole('radio',{name:'Full player',exact:true}).check();await page.keyboard.press('Escape')
 await button('Pause Spotify').click();await button('Play Spotify').waitFor();await button('Play Spotify').click();await button('Pause Spotify').waitFor()
 for(const name of ['Next track','Previous track','Seek backward 10 seconds','Seek forward 10 seconds']){await button(name).click();await page.waitForFunction(()=>!document.querySelector('.qt-main-play')?.disabled)}
 for(const action of ['pause','play','next','previous'])assert.ok((await calls(action)).length>0)
 assert.ok((await calls('seek')).length>=2)
 const volume=page.getByRole('slider',{name:'Spotify volume',exact:true});await volume.focus();await page.keyboard.press('ArrowRight');await page.waitForFunction(()=>window.demoCalls.some(c=>c.action==='volume'))
 results.push('Centered reference transport, ±10s seek and volume use shared fixture controller')
 await button('Search Spotify').click();await page.locator('.spotify-panel input').first().waitFor();await page.keyboard.press('Escape')
 await button('Add current track to playlist').click();await page.locator('.spotify-playlist-rows button').first().waitFor();await page.keyboard.press('Escape')
 await shell.getByRole('tab',{name:'Lyrics',exact:true}).click();await page.waitForTimeout(100)
 assert.equal((await calls('/visualizer/start')).length,0)
 await page.evaluate(()=>{window.demoScenario['/visualizer/start']={response:{state:'starting',lease:'qt-test'}};window.demoScenario['/visualizer/frame?lease=qt-test']={response:{state:'streaming',sequence:1,bands:Array(32).fill(.4),wave:Array(64).fill(.1),rms:.2}};window.demoScenario['/visualizer/stop']={response:{state:'off'}}})
 await shell.getByRole('tab',{name:'Visualizer',exact:true}).click();await page.locator('[data-audio-state=streaming]').waitFor();assert.equal(await page.locator('.spotify-visualizer').innerText(),'');await shell.getByRole('tab',{name:'Artwork',exact:true}).click();assert.equal(await page.locator('.spotify-visualizer').count(),0)
 assert.ok((await calls('/visualizer/stop')).length>0)
 results.push('Search/playlist/lyrics remain reachable; Visual starts directly and leaving it stops capture in the new shell (fixtures only)')
 await settings();await page.getByLabel('Player style',{exact:true}).selectOption('silver');await page.locator('[data-style=silver][data-finish=ice]').waitFor();await page.keyboard.press('Escape')
 results.push('Returning to silver restores the separately persisted finish; finishes are not layouts')
 assert.deepEqual(errors,[])
 const hashes=Object.fromEntries(await Promise.all(['desktop/plugin.js','demo/sdk.jsx','docs/demo/app.js','scripts/style-test.mjs'].map(async name=>[name,createHash('sha256').update(await readFile(name)).digest('hex')])) )
 await writeFile('docs/evidence/styles/results.json',JSON.stringify({hashes,results,scope:'synthetic isolated browser; not native or all-reference acceptance'},null,2))
 console.log(JSON.stringify({hashes,results},null,2))
} finally {await browser.close();await new Promise(r=>server.close(r))}
