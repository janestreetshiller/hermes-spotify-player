// Real renderer with synthetic account data; never accesses a personal Spotify account.
import {chromium} from 'playwright'
import assert from 'node:assert/strict'
import {createServer} from 'node:http'
import {readFile,mkdir,writeFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
const assets=new Map(await Promise.all([['/','index.html','text/html'],['/app.js','app.js','text/javascript'],['/style.css','style.css','text/css'],['/artwork.webp','artwork.webp','image/webp']].map(async([url,file,type])=>[url,{body:await readFile('docs/demo/'+file),type}])))
const server=createServer((req,res)=>{const a=assets.get(req.url);res.writeHead(a?200:404,{'Content-Type':a?.type||'text/plain'});res.end(a?.body)})
await new Promise(r=>server.listen(0,'127.0.0.1',r))
const browser=await chromium.launch({headless:true})
const page=await browser.newPage({viewport:{width:1100,height:850},deviceScaleFactor:2})
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(5000)
const shell=page.locator('.spotify-surface'),button=name=>shell.getByRole('button',{name,exact:true}).first()
const results=[]
async function fit(name){
 const menu=page.locator('.spotify-screen').first()
 const geometry=await menu.evaluate(root=>{
  const r=root.getBoundingClientRect();return [...root.querySelectorAll('*')].filter(e=>e.getClientRects().length&&!e.closest('svg')&&(getComputedStyle(e).position!=='absolute'||e.tagName==='BUTTON')).map(e=>{const b=e.getBoundingClientRect(),s=getComputedStyle(e);return {tag:e.tagName,label:e.getAttribute('aria-label')||e.className,overflow:!['INPUT','TEXTAREA','SELECT','OPTION','STYLE'].includes(e.tagName)&&(e.scrollHeight>e.clientHeight+1||(e.scrollWidth>e.clientWidth+1&&!(s.textOverflow==='ellipsis'&&e.closest('[title]')))),outside:b.top<r.top-1||b.bottom>r.bottom+1||b.left<r.left-1||b.right>r.right+1,bounds:{x:b.x,y:b.y,w:b.width,h:b.height,screen:r.toJSON()},button:e.tagName==='BUTTON',background:s.backgroundImage,shadow:s.boxShadow,before:getComputedStyle(e,'::before').content}}
 )})
 assert.deepEqual(geometry.filter(e=>e.overflow||e.outside),[],name+' must fit, not hide overflow')
 for(const b of geometry.filter(e=>e.button)){assert.equal(b.background,'none',name+' digital action cannot inherit chrome');assert.equal(b.shadow,'none');assert.ok(['none','normal','""'].includes(b.before))}
 await shell.screenshot({path:`${name.startsWith('silver-')&&name.endsWith('-234')?'docs/evidence/menus':'.test-output/menu-matrix'}/${name}.png`});results.push(name)
}
try{
 await mkdir('docs/evidence/menus',{recursive:true});await mkdir('.test-output/menu-matrix',{recursive:true})
 await page.goto(`http://127.0.0.1:${server.address().port}/`)
 for(const style of ['silver','quicktime','wmp-curved','handheld','droplet','wmp-classic','wmp-glass','jetaudio','organic','dark-playlist','wmp-library']){
 await button('Player settings').click();await shell.getByRole('combobox',{name:'Player style',exact:true}).selectOption(style);await page.keyboard.press('Escape')
 for(const width of [234,340,640]){
  await page.locator('.product').evaluate((e,w)=>e.style.width=w+'px',width)
  await button('Taste palette').click();await fit(style+'-taste-'+width)
  await button('Taste tracks').click();await fit(style+'-tracks-'+width)
  await shell.getByRole('textbox',{name:'Playlist tracks',exact:true}).fill('spotify:track:0000000000000000000001')
  await button('Add another track').click();await fit(style+'-tracks-next-'+width)
  await button('Taste actions').click();await fit(style+'-actions-'+width)
  await button('Read taste').click();await page.getByText('Taste sample · 0 recent liked songs',{exact:true}).waitFor();await fit(style+'-taste-result-'+width)
  await button('Back to taste').click();await button('LLM prompt').click();await fit(style+'-prompt-'+width)
  await button('Next message').click();await fit(style+'-prompt-next-'+width)
  await button('Back to taste').click();await button('Create private playlist').click();await shell.getByRole('link',{name:'Open playlist',exact:true}).waitFor();await fit(style+'-created-playlist-'+width)
  await button('Player settings').click();await fit(style+'-settings-'+width);await button('Player settings').click()
  await page.evaluate(()=>window.demoScenario.playlists={delay:0,response:{ok:true,playlists:Array.from({length:30},(_,i)=>({id:'p'+i,name:'Playlist '+i}))}})
  await button('Add current track to playlist').click();await button('Add to Playlist 0').waitFor();await fit(style+'-playlists-'+width)
  await button('Next playlists').click();await fit(style+'-playlists-next-'+width)
  await button('Close screen panel').click()
  await page.evaluate(()=>window.demoScenario.playlists={error:'The playlist service is unavailable. This is a deliberately long error; please retry rather than assuming your account has no playlists.'})
  await button('Add current track to playlist').click();await button('Reload playlists').waitFor();await fit(style+'-playlist-error-'+width);await button('Close screen panel').click()
  await button('Search Spotify').click();const input=shell.getByRole('textbox',{name:'Search Spotify',exact:true});await input.fill('test');await input.press('Enter');await page.locator('.spotify-search-results button').first().waitFor();await fit(style+'-search-'+width)
  await button('Close screen panel').click()
  await page.evaluate(()=>window.demoScenario['/auth/status']={response:{ok:true,loggedIn:false,clientConfigured:false,phase:'idle',redirectUri:'http://127.0.0.1:43827/spotify/callback'}})
  await button('Player settings').click();await shell.getByRole('link',{name:'Spotify connection',exact:true}).click();await shell.getByRole('textbox',{name:'Spotify Client ID'}).waitFor();await fit(style+'-new-account-'+width)
  await button('Set up your Spotify app').click();await fit(style+'-account-setup-'+width)
  await button('Close screen panel').click()
  await page.evaluate(()=>{window.demoScenario['/auth/status']={response:{ok:true,loggedIn:true,clientConfigured:true,phase:'connected'}};window.demoRefreshAuth()})
 }
 }
 assert.deepEqual(errors,[])
 await writeFile('docs/evidence/menus/results.json',JSON.stringify({source:'production renderer; synthetic fresh-user and playlist fixtures',pluginSha256:createHash('sha256').update(await readFile('desktop/plugin.js')).digest('hex'),cases:results.length,results},null,2))
 console.log('Menu fit and digital-only controls passed:',results.length,'cases')
}finally{await browser.close();await new Promise(r=>server.close(r))}
