import {chromium} from 'playwright'
import {createServer} from 'node:http'
import {readFile,writeFile,mkdir} from 'node:fs/promises'
import {execFileSync} from 'node:child_process'
import path from 'node:path'
const root=path.resolve('docs')
const server=createServer(async(req,res)=>{try{const p=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));if(!p.startsWith(root+path.sep))throw Error();res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp','.png':'image/png'})[path.extname(p)]||'application/octet-stream');res.end(await readFile(p))}catch{res.statusCode=404;res.end()}})
await new Promise(r=>server.listen(0,'127.0.0.1',r))
await mkdir('.test-output/video',{recursive:true})
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']})
const context=await browser.newContext({viewport:{width:1280,height:850},recordVideo:{dir:'.test-output/video',size:{width:1280,height:850}}})
const page=await context.newPage()
try{
 const base=`http://127.0.0.1:${server.address().port}`
 await page.goto(base+'/demo/index.html')
 await page.getByRole('tab',{name:'Artwork',exact:true}).waitFor()
 await page.waitForTimeout(1000)
 await page.locator('.product').screenshot({path:'docs/media/player-1.3-product.png'})
 await page.getByRole('button',{name:'Pause Spotify',exact:true}).first().click()
 await page.waitForTimeout(800)
 await page.getByRole('button',{name:'Play Spotify',exact:true}).first().click()
 await page.getByRole('button',{name:'Enable visual effects',exact:true}).click()
 await page.waitForTimeout(2500)
 await page.getByRole('tab',{name:'Lyrics',exact:true}).click()
 await page.waitForTimeout(2200)
 await page.getByRole('button',{name:'Compact',exact:true}).click()
 await page.waitForTimeout(1700)
 await page.getByRole('button',{name:'Standard',exact:true}).click()
 await page.waitForTimeout(1700)
 await page.getByRole('button',{name:'Expanded',exact:true}).click()
 await page.getByRole('tab',{name:'Artwork',exact:true}).click()
 await page.waitForTimeout(1800)
 const video=page.video();await context.close()
 const videoPath=await video.path()
 execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',videoPath,'-an','-c:v','libx264','-pix_fmt','yuv420p','-movflags','+faststart','-crf','22','docs/media/player-1.3-demo.mp4'])
 const social=await browser.newPage({viewport:{width:1200,height:675},deviceScaleFactor:1})
 await social.goto(base+'/media/social-1.3.html')
 await social.locator('img').evaluate(el=>el.decode())
 await social.screenshot({path:'docs/media/player-1.3-social.png'})
 console.log('Rendered social PNG and actual interactive-demo MP4 (silent, simulated playback).')
}finally{await browser.close();server.close()}
