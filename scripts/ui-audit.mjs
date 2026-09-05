import {chromium} from 'playwright'
import assert from 'node:assert/strict'
import {createServer} from 'node:http'
import {readFile,writeFile,mkdir} from 'node:fs/promises'
const assets=new Map(await Promise.all([['/','index.html','text/html'],['/app.js','app.js','text/javascript'],['/style.css','style.css','text/css'],['/artwork.webp','artwork.webp','image/webp']].map(async([url,file,type])=>[url,{body:await readFile('docs/demo/'+file),type}])))
const server=createServer((req,res)=>{const a=assets.get(req.url);res.writeHead(a?200:404,{'Content-Type':a?.type||'text/plain'});res.end(a?.body)})
await new Promise(r=>server.listen(0,'127.0.0.1',r))
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']})
const results=[]
await mkdir('docs/evidence/ui-audit',{recursive:true})
async function check(name,fn){const page=await browser.newPage({viewport:{width:1100,height:850}});page.setDefaultTimeout(3000);const errors=[];page.on('pageerror',e=>errors.push(e.message));try{await page.goto(`http://127.0.0.1:${server.address().port}/`);await page.locator('.spotify-title').getByText('After hours',{exact:true}).waitFor();await fn(page);assert.deepEqual(errors,[]);results.push({name,status:'passed'});console.log('PASS',name)}catch(e){results.push({name,status:'failed',error:e.message});console.log('FAIL',name,e.message);await page.screenshot({path:`docs/evidence/ui-audit/${results.length}-failure.png`})}finally{await page.close()}}
const shell=p=>p.locator('.spotify-surface')
const button=(p,name)=>shell(p).getByRole('button',{name,exact:true})
const tab=(p,name)=>shell(p).getByRole('tab',{name,exact:true})
const scenario=(p,action,value)=>p.evaluate(({action,value})=>window.demoScenario[action]=value,{action,value})
const state=(p,value)=>p.evaluate(v=>window.demoSetPlayer(v),value)
const actionCount=(p,action)=>p.evaluate(a=>window.demoCalls.filter(c=>c.action===a).length,action)
try{
await check('Default FX: no effects toggle, painted ring, all hardware hover/focus/press treatments',async p=>{
 assert.equal(await shell(p).getByRole('button',{name:/visual effects/i}).count(),0,'FX is a default finish, not a user toggle')
 await shell(p).locator('.spotify-metal canvas').waitFor()
 for(const b of await shell(p).locator('button:not(:disabled)').all()){
  await b.hover();await p.waitForTimeout(200);const effect=await b.evaluate(e=>({label:e.ariaLabel,filter:getComputedStyle(e).filter,title:e.getAttribute('title')||e.closest('[title]')?.title}));assert.ok(effect.title,effect.label+' needs hover text');assert.notEqual(effect.filter,'none',effect.label+' needs hover feedback')
  await b.focus();assert.notEqual(await b.evaluate(e=>getComputedStyle(e).outlineStyle),'none')
  await b.hover();await p.mouse.down();await p.waitForTimeout(160);assert.notEqual(await b.evaluate(e=>getComputedStyle(e).transform),'none',effect.label+' needs pressed feedback');await p.mouse.move(1000,800);await p.mouse.up()
 }
 await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(100);assert.equal(await p.locator('.spotify-metal canvas').count(),0)
 await shell(p).screenshot({path:'docs/evidence/ui-audit/default-treatment.png'})
})
await check('Lyrics: loading, missing, instrumental, network error/retry and no-track states are distinct',async p=>{
 await scenario(p,'lyrics',{delay:700,response:{ok:true,instrumental:true}});await tab(p,'Lyrics').click();await p.getByRole('status',{name:'Loading lyrics'}).waitFor();await p.getByText('This track is instrumental.',{exact:true}).waitFor()
 await tab(p,'Artwork').click();await scenario(p,'lyrics',{response:{ok:true,lyrics:'',syncedLyrics:''}});await tab(p,'Lyrics').click();await p.getByText('Lyrics are not available for this track.',{exact:true}).waitFor()
 await tab(p,'Artwork').click();await scenario(p,'lyrics',{error:'Lyrics service offline'});await tab(p,'Lyrics').click();await p.getByText('Could not load lyrics.',{exact:true}).waitFor();await scenario(p,'lyrics',{response:{ok:true,lyrics:'Recovered lyric'}});await button(p,'Retry lyrics').click();await p.getByText('Recovered lyric',{exact:true}).waitFor()
 await state(p,{title:'',artist:'',spotifyUrl:'',durationMs:0,state:'stopped'});await p.getByText('Play a track to see lyrics.',{exact:true}).waitFor()
})
await check('Pane keeps authoritative playback fresh when footer is absent',async p=>{
 await p.evaluate(()=>window.demoUnmountFooter());await button(p,'Pause Spotify').waitFor();const before=await actionCount(p,'status');await p.waitForTimeout(4300);assert.ok(await actionCount(p,'status')>before,'pane must not depend on footer mounting to poll Spotify')
})
await check('Account controls open connection inside screen when Spotify account is disconnected',async p=>{
 await scenario(p,'/auth/status',{response:{ok:true,loggedIn:false,clientConfigured:false}});await p.evaluate(()=>window.demoRefreshAuth());await button(p,'Connect Spotify to use Liked Songs').click();await shell(p).getByText('Connect Spotify',{exact:true}).first().waitFor();assert.equal(await p.getByRole('dialog').count(),0)
 await tab(p,'Artwork').click();await button(p,'Search Spotify').click();await shell(p).getByRole('textbox',{name:'Spotify Client ID'}).waitFor();await tab(p,'Artwork').click();await button(p,'Add current track to playlist').click();await shell(p).getByRole('textbox',{name:'Spotify Client ID'}).waitFor()
})
await check('Transport and account buttons dispatch exact actions and synchronize confirmed states',async p=>{
 await button(p,'Pause Spotify').click();await button(p,'Play Spotify').waitFor();assert.equal(await actionCount(p,'pause'),1,'Pause must request pause, not blindly toggle');assert.equal(await p.locator('.status-bar').getByRole('button',{name:'Play Spotify'}).count(),1)
 await button(p,'Play Spotify').click();await button(p,'Pause Spotify').waitFor()
 await button(p,'Next track').click();await shell(p).getByText('Quiet signal',{exact:true}).waitFor();await button(p,'Previous track').click();await shell(p).getByText('After hours',{exact:true}).waitFor()
 await button(p,'Like current track').click();await button(p,'Unlike current track').waitFor();assert.equal(await button(p,'Unlike current track').getAttribute('aria-pressed'),'true');await button(p,'Unlike current track').click();await button(p,'Like current track').waitFor()
 const seek=shell(p).getByRole('slider',{name:'Seek Spotify'});await seek.focus();await seek.press('Home');await p.waitForTimeout(250);assert.equal((await p.evaluate(()=>window.demoCalls.filter(c=>c.action==='seek').at(-1))).argument,'0')
 const volume=shell(p).getByRole('slider',{name:'Spotify volume'});await volume.focus();await volume.press('Home');await p.waitForTimeout(250);assert.equal((await p.evaluate(()=>window.demoCalls.filter(c=>c.action==='volume').at(-1))).argument,'0')
 await scenario(p,'search',{response:{ok:true,results:[{uri:'spotify:track:bbbbbbbbbbbbbbbbbbbbbb',title:'Selected song',artist:'Artist',album:'Album'}]}})
 await button(p,'Search Spotify').click();await shell(p).getByRole('textbox',{name:'Search Spotify',exact:true}).fill('Selected song');await shell(p).getByRole('textbox',{name:'Search Spotify',exact:true}).press('Enter');await button(p,'Play Selected song by Artist').click();await p.waitForTimeout(250);assert.equal(await shell(p).locator('.spotify-panel').count(),0);assert.equal((await p.evaluate(()=>window.demoCalls.filter(c=>c.action==='play-uri').at(-1))).argument,'spotify:track:bbbbbbbbbbbbbbbbbbbbbb')
 await button(p,'Add current track to playlist').click();await button(p,'Add to Focus sessions').click();await p.waitForTimeout(250);assert.equal(await shell(p).locator('.spotify-panel').count(),0);assert.equal(await actionCount(p,'playlist-add'),1)
})
await check('Screen tabs have keyboard selection and accurately expose selection while settings are open',async p=>{
 await tab(p,'Artwork').focus();await p.keyboard.press('ArrowRight');assert.equal(await tab(p,'Visualizer').getAttribute('aria-selected'),'true');await p.keyboard.press('ArrowRight');assert.equal(await tab(p,'Lyrics').getAttribute('aria-selected'),'true');await button(p,'Player settings').click();assert.equal(await shell(p).locator('[role=tab][aria-selected=true]').count(),0);await button(p,'Player settings').click();assert.equal(await tab(p,'Lyrics').getAttribute('aria-selected'),'true')
})
await check('Lyrics fit narrow and normal screens, expose active line, and permit manual reading',async p=>{
 const long='LongUnbrokenLyric'.repeat(12);const lines=Array.from({length:30},(_,i)=>`[00:${String(i*2).padStart(2,'0')}.00] ${i===10?long:'Lyric line '+i}`).join('\n');await scenario(p,'lyrics',{response:{ok:true,syncedLyrics:lines}});await state(p,{state:'paused',positionSeconds:22});await tab(p,'Lyrics').click();await p.getByLabel('Synced lyrics').waitFor()
 for(const width of [234,280,340]){await p.locator('.product').evaluate((e,w)=>e.style.width=w+'px',width);await p.waitForTimeout(150);const geometry=await p.getByLabel('Synced lyrics').evaluate(e=>({scrollWidth:e.scrollWidth,width:e.clientWidth,active:e.querySelector('[data-active=true]')?.textContent}));assert.ok(geometry.scrollWidth<=geometry.width+1,'lyrics must wrap rather than clip horizontally');assert.equal(geometry.active,'Lyric line 11')}
 await p.getByLabel('Synced lyrics').hover();await p.mouse.wheel(0,160);await button(p,'Follow current lyric').waitFor();await button(p,'Follow current lyric').click();assert.equal(await button(p,'Follow current lyric').count(),0);await shell(p).screenshot({path:'docs/evidence/ui-audit/lyrics-fit.png'})
})
await check('Settings and taste palette controls: persistence, curation, prompt selection and hover inventory',async p=>{
 await button(p,'Player settings').click();for(const [label,finish] of [['Classic chrome','chrome'],['Ice blue','ice'],['Graphite','graphite']]){await p.getByRole('radio',{name:label}).check();assert.equal(await shell(p).getAttribute('data-finish'),finish)}
 await button(p,'Player settings').click();await button(p,'Turn screen off').click();assert.equal(await shell(p).locator('.spotify-screen').count(),0);await button(p,'Turn screen on').click();await button(p,'Taste palette').click()
 await shell(p).getByRole('textbox',{name:'Playlist tracks'}).fill('spotify:track:aaaaaaaaaaaaaaaaaaaaaa');await button(p,'Read taste').click();await p.getByText('Taste sample · 0 recent liked songs',{exact:true}).waitFor();await button(p,'Create private playlist').click();await p.getByText('Verified · 1 track saved',{exact:true}).waitFor();await button(p,'Like draft tracks').click();await p.getByText('Verified · 1 liked state updated',{exact:true}).waitFor();await button(p,'Remove draft likes').click();await p.waitForTimeout(250)
 await button(p,'LLM prompt').click();await button(p,'Select prompt').click();assert.ok(await shell(p).getByRole('textbox',{name:'Curation prompt'}).evaluate(e=>e.selectionEnd>e.selectionStart));await button(p,'Back to tracks').click()
 const inventory=[]
 for(const mode of ['taste','settings','search','playlists','auth']){
  if(mode==='settings'||mode==='auth')await button(p,'Player settings').click();if(mode==='search')await button(p,'Search Spotify').click();if(mode==='playlists')await button(p,'Add current track to playlist').click();if(mode==='auth')await shell(p).getByRole('link',{name:'Spotify connection',exact:true}).click()
  await p.waitForTimeout(250)
  for(const b of await shell(p).locator('button').all()){const row=await b.evaluate(e=>({label:e.ariaLabel||e.textContent,title:e.title,disabled:e.disabled,pressed:e.getAttribute('aria-pressed')}));inventory.push({mode,...row});assert.ok(row.title,`${mode}: ${row.label} needs explicit hover text`)}
 }
 await writeFile('docs/evidence/ui-audit/control-inventory.json',JSON.stringify(inventory,null,2));await shell(p).screenshot({path:'docs/evidence/ui-audit/account-screen.png'})
})
await check('Failed slider commands restore confirmed values and show an in-player error',async p=>{
 const v=shell(p).getByRole('slider',{name:'Spotify volume'});
 // The fixture intentionally exceeds the former 300ms sleep. Await the
 // response/error and confirmed rollback, not a machine-dependent deadline.
 await scenario(p,'volume',{error:'Volume control unavailable',delay:750});
 await v.focus();await v.press('Home');
 await shell(p).getByRole('alert').getByText('Volume control unavailable',{exact:true}).waitFor();
 await p.waitForFunction(()=>document.querySelector('.spotify-surface input[aria-label="Spotify volume"]')?.value==='45',null,{timeout:5000});
 assert.equal(await v.inputValue(),'45','failed commands must not leave optimistic volume');
})
await check('Playlist and search errors are not falsely reported as empty results',async p=>{
 await scenario(p,'playlists',{error:'Playlist service unavailable'});await button(p,'Add current track to playlist').click();await shell(p).getByText('Playlist service unavailable',{exact:true}).waitFor();assert.equal(await shell(p).getByText('No playlists found.',{exact:true}).count(),0);await button(p,'Close screen panel').click()
 await scenario(p,'search',{error:'Search service unavailable'});await button(p,'Search Spotify').click();const input=shell(p).getByRole('textbox',{name:'Search Spotify',exact:true});await input.fill('Anything');await input.press('Enter');await shell(p).getByText('Search service unavailable',{exact:true}).waitFor();assert.equal(await shell(p).getByText('No tracks found.',{exact:true}).count(),0)
})
await check('View controls sit on top chrome rather than consuming the display',async p=>{
 const placement=await shell(p).evaluate(e=>{const tabs=e.querySelector('[role=tablist]'),display=e.querySelector('.spotify-display'),r=tabs.getBoundingClientRect(),d=display.getBoundingClientRect();return {inside:display.contains(tabs),bottom:r.bottom,screenTop:d.top}});assert.equal(placement.inside,false,'move ribbon controls onto the physical shell');assert.ok(placement.bottom<=placement.screenTop+1,'top controls must not cover screen pixels');await shell(p).screenshot({path:'docs/evidence/ui-audit/final-placement.png'})
})
await check('Like response cannot overwrite the next song state',async p=>{
 await button(p,'Like current track').waitFor();await scenario(p,'set-saved',{delay:900,response:{ok:true,uri:'spotify:track:demo123',saved:true}});await button(p,'Like current track').click();await state(p,{spotifyUrl:'spotify:track:bbbbbbbbbbbbbbbbbbbbbb',title:'Next song'});await p.waitForTimeout(1150);assert.equal(await button(p,'Like current track').count(),1,'late previous-song response must not strand current song in checking state')
})
await check('Unavailable Liked Songs states and failed writes are honest and recoverable',async p=>{
 await scenario(p,'saved-status',{error:'Library offline'});await state(p,{spotifyUrl:'spotify:track:cccccccccccccccccccccc'});await button(p,'Retry Liked Songs status').waitFor();await scenario(p,'saved-status',{});await button(p,'Retry Liked Songs status').click();await button(p,'Like current track').waitFor();await scenario(p,'set-saved',{error:'Library write denied',delay:500});await button(p,'Like current track').click();assert.equal(await button(p,'Like current track').isDisabled(),true);await p.getByText('Library write denied',{exact:true}).waitFor();assert.equal(await button(p,'Like current track').getAttribute('aria-pressed'),'false');await state(p,{spotifyUrl:'',title:'',state:'stopped'});assert.equal(await button(p,'Play a track to use Liked Songs').isDisabled(),true)
})
await check('Top controls and their finish stay inset; side icons are consistently legible',async p=>{
 for(const width of [234,280,340]){
  await p.locator('.product').evaluate((e,w)=>e.style.width=w+'px',width);await p.waitForTimeout(180);
  const g=await shell(p).evaluate(e=>{const r=e.getBoundingClientRect(),scale=r.width/320,d=e.querySelector('.spotify-display').getBoundingClientRect(),tabs=[...e.querySelectorAll('[role=tab]')].map(b=>b.getBoundingClientRect());return {top:Math.min(...tabs.map(b=>b.top-r.top))/scale,bottom:(d.top-Math.max(...tabs.map(b=>b.bottom)))/scale,width:(tabs.at(-1).right-tabs[0].left)/scale,icons:[...e.querySelectorAll('.spotify-side-controls button')].map(b=>{const s=b.querySelector('svg');return {label:b.ariaLabel,svg:!!s,size:s?parseFloat(getComputedStyle(s).width):0,stroke:s?Number(s.getAttribute('stroke-width')):0}})}});
  assert.ok(g.top>=10.9,'top buttons need an inset from the drawn chrome roof');assert.ok(g.bottom>=4,'button finish must clear the screen');assert.ok(g.width<=178,'top strip must be tighter');assert.equal(g.icons.length,6);for(const icon of g.icons){assert.ok(icon.svg,icon.label+' must use a recognizable vector icon');assert.ok(icon.size>=18,icon.label+' icon too small');assert.ok(icon.stroke>=2,icon.label+' icon too faint')}
  const containment=await shell(p).evaluate(e=>{
   const image=getComputedStyle(e).backgroundImage.slice(5,-2),xml=new DOMParser().parseFromString(decodeURIComponent(image.split(',')[1]),'image/svg+xml'),ctx=document.createElement('canvas').getContext('2d'),shape=new Path2D(xml.querySelectorAll('path')[1].getAttribute('d')),box=e.getBoundingClientRect(),scale=box.width/320;
   return [...e.querySelectorAll('.spotify-view-tabs button,.spotify-side-controls button')].map(b=>{const q=b.getBoundingClientRect(),x=(q.x-box.x)/scale,y=(q.y-box.y)/scale,w=q.width/scale,h=q.height/scale,r=parseFloat(getComputedStyle(b).borderRadius),radius=Math.min(h/2,w/2,r),pad=b.closest('.spotify-view-tabs')?1:3;let inside=true;for(let i=0;i<72;i++){const a=i*Math.PI/36,cx=x+(Math.cos(a)>=0?w-radius:radius),cy=y+(Math.sin(a)>=0?h-radius:radius);inside&&=ctx.isPointInPath(shape,cx+Math.cos(a)*(radius+pad),cy+Math.sin(a)*(radius+pad))}return {label:b.ariaLabel,inside}})
  });for(const c of containment)assert.ok(c.inside,c.label+' painted rim escapes inner frame')
  await shell(p).screenshot({path:`docs/evidence/ui-audit/tight-frame-${width}.png`})
 }
})
await check('Settings is text-only and fully fits without scrolling',async p=>{
 await button(p,'Player settings').click();const settings=shell(p).getByLabel('Player settings panel');assert.equal(await settings.locator('button,svg,select').count(),0,'no hardware widgets inside settings');
 for(const width of [234,280,340]){await p.locator('.product').evaluate((e,w)=>e.style.width=w+'px',width);await p.waitForTimeout(150);const fit=await settings.evaluate(e=>{const r=e.getBoundingClientRect();return {height:e.clientHeight,content:e.scrollHeight,width:e.clientWidth,contentWidth:e.scrollWidth,overflow:getComputedStyle(e).overflowY,children:[...e.querySelectorAll('label,a,header')].map(n=>{const b=n.getBoundingClientRect();return b.top>=r.top&&b.bottom<=r.bottom&&b.left>=r.left&&b.right<=r.right})}});assert.ok(fit.content<=fit.height,'all settings must fit; clipping is not a fix');assert.ok(fit.contentWidth<=fit.width);assert.equal(fit.overflow,'hidden');assert.ok(fit.children.every(Boolean));await shell(p).screenshot({path:`docs/evidence/ui-audit/text-settings-${width}.png`})}
 await settings.getByRole('radio',{name:'Ice blue'}).check();assert.equal(await shell(p).getAttribute('data-finish'),'ice');await settings.getByRole('radio',{name:'Ice blue'}).focus();await p.keyboard.press('ArrowRight');assert.equal(await shell(p).getAttribute('data-finish'),'graphite');await p.keyboard.press('Escape');assert.equal(await settings.count(),0);await button(p,'Player settings').click();await settings.getByRole('link',{name:'Spotify connection',exact:true}).click();await shell(p).getByText('Spotify connected',{exact:true}).waitFor()
})
await check('Song play automatically paints authoritative liked/unliked state without a heart click',async p=>{
 const a='spotify:track:aaaaaaaaaaaaaaaaaaaaaa',b='spotify:track:bbbbbbbbbbbbbbbbbbbbbb';
 await scenario(p,'saved-status',{delay:600,response:{ok:true,uri:a,saved:true}});await state(p,{spotifyUrl:a,title:'Already liked song',state:'playing',positionSeconds:0});await button(p,'Checking Liked Songs status').waitFor();const pending=button(p,'Checking Liked Songs status');assert.equal(await pending.getAttribute('aria-pressed'),null);assert.equal(await pending.locator('[data-like-indicator]').textContent(),'…');
 const liked=button(p,'Unlike current track');await liked.waitFor();assert.equal(await liked.getAttribute('aria-pressed'),'true');assert.equal(await liked.locator('svg').getAttribute('fill'),'currentColor');await shell(p).screenshot({path:'docs/evidence/ui-audit/auto-liked.png'});
 await scenario(p,'saved-status',{response:{ok:true,uri:b,saved:false}});await state(p,{spotifyUrl:b,title:'Not liked song',state:'playing',positionSeconds:0});const unliked=button(p,'Like current track');await unliked.waitFor();assert.equal(await unliked.getAttribute('aria-pressed'),'false');assert.equal(await unliked.locator('svg').getAttribute('fill'),'none');await shell(p).screenshot({path:'docs/evidence/ui-audit/auto-unliked.png'});
 assert.equal(await actionCount(p,'set-saved'),0,'playing a song must only read likes, never modify them');const reads=await p.evaluate(()=>window.demoCalls.filter(c=>c.action==='saved-status').map(c=>c.argument));assert.ok(reads.includes(a)&&reads.includes(b));
 await scenario(p,'/auth/status',{response:{ok:true,loggedIn:false,clientConfigured:false}});await p.evaluate(()=>window.demoRefreshAuth());const unknown=button(p,'Connect Spotify to use Liked Songs');await unknown.waitFor();assert.equal(await unknown.getAttribute('aria-pressed'),null);assert.equal(await unknown.locator('[data-like-indicator]').textContent(),'?');
})
// AUDIT CASES
}finally{await writeFile('docs/evidence/ui-audit/results.json',JSON.stringify({source:'Actual plugin in Chromium; simulated backend, not live Spotify',results},null,2));await browser.close();server.close()}
if(results.some(r=>r.status==='failed'))process.exitCode=1
