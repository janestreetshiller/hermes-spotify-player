// New reviewer regressions only. Isolated browser, fixture API, no Spotify writes.
import {chromium} from 'playwright'
import assert from 'node:assert/strict'
import {createServer} from 'node:http'
import {createHash} from 'node:crypto'
import {readFile,mkdir,writeFile} from 'node:fs/promises'
const assets=new Map(await Promise.all([['/','index.html','text/html'],['/app.js','app.js','text/javascript'],['/style.css','style.css','text/css'],['/artwork.webp','artwork.webp','image/webp']].map(async([url,file,type])=>[url,{body:await readFile('docs/demo/'+file),type}])))
const server=createServer((req,res)=>{const a=assets.get(req.url);res.writeHead(a?200:404,{'Content-Type':a?.type||'text/plain'});res.end(a?.body)})
await new Promise(r=>server.listen(0,'127.0.0.1',r))
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']})
const page=await browser.newPage({viewport:{width:1100,height:850}})
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(5000)
const shell=page.locator('.spotify-surface'),button=name=>shell.getByRole('button',{name,exact:true}),tab=name=>shell.getByRole('tab',{name,exact:true})
const focused=()=>page.evaluate(()=>document.activeElement?.getAttribute('aria-label'))
const results=[]
try {
 await page.goto(`http://127.0.0.1:${server.address().port}/`)
 await button('Add current track to playlist').click()
 await button('Add to Focus sessions').waitFor()
 await button('Close screen panel').click()
 assert.equal(await focused(),'Add current track to playlist')
 await page.keyboard.press('Tab');assert.equal(await focused(),'Artwork')
 results.push('Close restores playlist opener; next Tab reaches Artwork, not document start')
 await button('Add current track to playlist').click();await button('Add to Focus sessions').focus();await page.keyboard.press('Escape')
 assert.equal(await focused(),'Add current track to playlist')
 await page.keyboard.press('Tab');assert.equal(await focused(),'Artwork')
 results.push('Escape restores opener and preserves next-Tab order')
 await button('Add current track to playlist').click();await button('Add to Focus sessions').waitFor();await tab('Visualizer').click()
 assert.equal(await focused(),'Visualizer')
 results.push('Switching tabs does not steal focus back to old opener')
 await page.evaluate(()=>{
  window.demoScenario['/visualizer/start']={delay:0,response:{state:'starting',lease:'focus-test'}}
  window.demoScenario['/visualizer/frame?lease=focus-test']={delay:0,response:{state:'streaming',sequence:1,bands:Array(32).fill(.3),wave:Array(64).fill(.1),rms:.1}}
  window.demoScenario['/visualizer/stop']={delay:0,response:{state:'off'}}
 })
 await tab('Artwork').click();await tab('Visualizer').click();await page.locator('[data-audio-state=streaming]').waitFor()
 await page.locator('.spotify-metal canvas').waitFor()
 await page.evaluate(()=>window.demoSetHostReducedMotion(true))
 await page.locator('.spotify-surface[data-reduced-motion=true]').waitFor()
 await page.waitForTimeout(100)
 assert.equal(await page.locator('.spotify-metal canvas').count(),0)
 assert.equal(await page.locator('.spotify-visualizer button').count(),0)
 await page.locator('[data-audio-state=off]').waitFor()
 assert.ok(await page.evaluate(()=>window.demoCalls.some(c=>c.action==='/visualizer/stop')))
 assert.equal(await button('Player settings').evaluate(e=>getComputedStyle(e).transitionDuration),'0s')
 results.push('Native-host reduced motion stops audio, removes GPU canvas, disables animation without offering a motion override')
 await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>window.demoSetHostReducedMotion(false))
 assert.equal(await page.locator('.spotify-visualizer button').count(),0)
 await page.locator('[data-audio-state=off]').waitFor()
 results.push('Host motion opt-out cannot override OS reduced motion')
 await mkdir('docs/evidence/audio',{recursive:true})
 await shell.screenshot({path:'docs/evidence/audio/fixture-host-reduced-motion.png'})
 assert.deepEqual(errors,[])
 const hash=createHash('sha256').update(await readFile('desktop/plugin.js')).digest('hex')
 await writeFile('docs/evidence/audio/focus-motion-results.json',JSON.stringify({source:'isolated Chromium; synthetic host preferences and audio frames',pluginSha256:hash,results},null,2))
 console.log(JSON.stringify({pluginSha256:hash,results},null,2))
} finally {await browser.close();await new Promise(r=>server.close(r))}
