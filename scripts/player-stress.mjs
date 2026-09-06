import {chromium} from 'playwright'
import assert from 'node:assert/strict'
import {createServer} from 'node:http'
import {readFile,mkdir,writeFile} from 'node:fs/promises'
const assets=new Map(await Promise.all(['index.html','app.js','style.css','artwork.webp'].map(async name=>['/'+(name==='index.html'?'':name),await readFile('docs/demo/'+name)])))
const server=createServer((req,res)=>{const key=req.url.split('?')[0];res.setHeader('Content-Type',key.endsWith('.js')?'text/javascript':key.endsWith('.css')?'text/css':key.endsWith('.webp')?'image/webp':'text/html');res.end(assets.get(key))})
await new Promise(r=>server.listen(0,'127.0.0.1',r))
const browser=await chromium.launch({args:['--enable-unsafe-swiftshader']})
const page=await browser.newPage({viewport:{width:1200,height:1000},deviceScaleFactor:2,reducedMotion:'reduce'})
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(5000)
const root='docs/evidence/stress';await mkdir(root,{recursive:true})
const shell=page.locator('.spotify-surface'),button=name=>shell.getByRole('button',{name,exact:true})
// Existing LCD finishes of the original player, not invented player designs.
const models=['chrome','ice','graphite'],labels=['Classic chrome','Ice blue','Graphite']
let cases=0
async function load(model,mode='on'){
 await page.goto(`http://127.0.0.1:${server.address().port}/`)
 await page.evaluate(({model,mode})=>localStorage.setItem('spotify-demo:playerPreferences',JSON.stringify({skin:model,mode})),{model,mode})
 await page.reload();await button('Pause Spotify').waitFor()
}
async function stable(){
 return shell.evaluate(async e=>{
  const frame=e.getBoundingClientRect(),scale=frame.width/320;
  const sample=()=>[...e.querySelectorAll('button,input[type=range],.spotify-display')].filter(n=>n.getBoundingClientRect().width).map(n=>{const r=n.getBoundingClientRect();return {label:n.ariaLabel||n.className,x:r.x,y:r.y,w:r.width,h:r.height}})
  const first=sample();let drift=0;
  for(let i=0;i<12;i++){await new Promise(requestAnimationFrame);const next=sample();for(let k=0;k<first.length;k++)for(const p of ['x','y','w','h'])drift=Math.max(drift,Math.abs(first[k][p]-next[k][p]))}
  return {ratio:frame.width/frame.height,drift,outside:first.filter(r=>r.x<frame.x-.5||r.y<frame.y-.5||r.x+r.w>frame.right+.5||r.y+r.h>frame.bottom+.5),overlap:first.flatMap((a,i)=>first.slice(i+1).filter(b=>Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)>.5*scale&&Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y)>.5*scale).map(b=>[a.label,b.label])),viewport:(()=>{const v=e.closest('.spotify-retro-viewport');return {width:v.clientWidth,scroll:v.scrollWidth}})()}
 })
}
try{
 for(const model of models){
  for(const mode of ['on','off','mini']){
   await load(model,mode)
   for(const width of [234,280,320,420])for(const zoom of [.8,1,1.25,1.75]){
    await page.locator('.product').evaluate((e,{width,zoom})=>{e.style.width=width+'px';e.style.zoom=zoom},{width,zoom})
    await page.waitForTimeout(60)
    const g=await stable();assert.ok(Math.abs(g.ratio-320/({on:280,off:112,mini:88}[mode]))<.001,`${model}/${mode}: aspect ratio`);assert.equal(g.drift,0,`${model}/${mode}: layout wobble`);assert.deepEqual(g.outside,[],`${model}/${mode}: controls outside shell`);assert.deepEqual(g.overlap,[],`${model}/${mode}: overlapping controls`);assert.ok(g.viewport.scroll<=g.viewport.width+1,`${model}/${mode}/${width}/${zoom}: horizontal overflow ${JSON.stringify(g.viewport)}`);cases++
   }
   await page.locator('.product').evaluate(e=>{e.style.width='340px';e.style.zoom=1})
   await page.waitForTimeout(100);await shell.screenshot({path:`${root}/${model}-${mode}.png`})
   if(mode==='mini'){
    assert.equal(await shell.locator('.spotify-metal-control').evaluate(e=>getComputedStyle(e).position),'relative','mini play rim must anchor to the button, not the entire transport')
    const meta=await shell.locator('.spotify-mini-lcd').evaluate(e=>({h:e.clientHeight,s:e.scrollHeight,w:e.clientWidth,sw:e.scrollWidth}));assert.ok(meta.s<=meta.h&&meta.sw<=meta.w,'mini metadata clipped')
    await button('Player settings').click();await shell.getByLabel('Player settings panel').waitFor()
    await shell.getByRole('radio',{name:'Compact mini'}).click();await page.waitForFunction(()=>document.querySelector('.spotify-surface').dataset.screen==='mini');await button('Player settings').click();await shell.getByLabel('Player settings panel').waitFor()
   }
  }
  await load(model)
  await button('Player settings').click();await shell.getByRole('radio',{name:labels[models.indexOf(model)]}).check();assert.equal(await shell.getAttribute('data-finish'),model)
  const panelFit=await shell.getByLabel('Player settings panel').evaluate(e=>e.scrollHeight<=e.clientHeight&&e.scrollWidth<=e.clientWidth);assert.ok(panelFit,'settings must fit LCD')
  await shell.screenshot({path:`${root}/${model}-settings.png`})
  await shell.getByRole('tab',{name:'Artwork',exact:true}).click()
  await button('Pause Spotify').click();await button('Play Spotify').waitFor();await button('Play Spotify').click();await button('Pause Spotify').waitFor()
  await button('Next track').click();await shell.getByText('Quiet signal',{exact:true}).waitFor();await button('Previous track').click();await shell.getByText('After hours',{exact:true}).waitFor()
  await button('Like current track').click();await button('Unlike current track').waitFor();await button('Unlike current track').click();await button('Like current track').waitFor()
  await button('Search Spotify').click();await shell.getByRole('textbox',{name:'Search Spotify',exact:true}).fill('After hours');await shell.getByRole('textbox',{name:'Search Spotify',exact:true}).press('Enter');await button('Play After hours by Studio session').click();await shell.locator('.spotify-panel').waitFor({state:'detached'})
  await button('Add current track to playlist').click();await button('Add to Focus sessions').click();await shell.locator('.spotify-panel').waitFor({state:'detached'})
  // Repeated mode switching must not grow DOM, duplicate handlers, or lose controls.
  const count=await shell.locator('button').count();for(let i=0;i<15;i++){await button('Turn screen off').click();await button('Turn screen on').click()};assert.equal(await shell.locator('button').count(),count)
  await page.reload();assert.equal(await shell.getAttribute('data-finish'),model)
 }
 for(const mode of ['off','mini']){
  await load('chrome',mode);await page.evaluate(()=>window.demoScenario.volume={delay:750,error:'Volume unavailable'});const slider=shell.getByRole('slider',{name:'Spotify volume'});await slider.focus();await slider.press('Home');await shell.getByRole('alert').waitFor();await page.waitForFunction(()=>document.querySelector('.spotify-surface [aria-label="Spotify volume"]').value==='45')
 }
 assert.deepEqual(errors,[])
 await writeFile(`${root}/results.json`,JSON.stringify({source:'Production plugin in Chromium; simulated Spotify backend',geometryCases:cases,models,checks:['exact aspect ratio','zero 12-frame layout drift','no hardware overlap or overflow','2x DPR and 80–175% zoom','mini settings reopening and metadata fit','finish persistence','transport, search selection, likes, playlist dispatch on every finish','45 collapse/expand cycles','collapsed error/slider rollback'],errors},null,2))
 console.log(`PASS ${cases} geometry cases; all three finish control flows, mode cycles and compact error recovery`)
}finally{await browser.close();server.close()}
