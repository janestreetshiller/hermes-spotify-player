import {chromium} from 'playwright'
import {fileURLToPath, pathToFileURL} from 'node:url'
import path from 'node:path'
import assert from 'node:assert/strict'
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
const browser=await chromium.launch({headless:true})
try {
  for (const [name,width,height] of [['retro-poster',1080,1350],['retro-social',1200,630]]) {
    const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1})
    const errors=[]
    page.on('pageerror',error=>errors.push(error.message))
    await page.goto(pathToFileURL(path.join(root,'docs/media/retro-poster.html')).href)
    await page.locator('.photo').evaluate(image=>image.decode())
    await page.evaluate(()=>document.fonts.ready)
    assert.deepEqual(errors,[])
    const overflow=await page.evaluate(()=>[...document.querySelectorAll('.headline,.masthead,.description,.meta,.url,.photo')].filter(el=>{
      const r=el.getBoundingClientRect();return r.left<0||r.top<0||r.right>innerWidth||r.bottom>innerHeight||el.scrollWidth>el.clientWidth+1
    }).map(el=>el.className))
    assert.deepEqual(overflow,[],`Poster overflow: ${overflow}`)
    const separated=await page.evaluate(()=>document.querySelector('.bottom').getBoundingClientRect().bottom+8<=document.querySelector('.url').getBoundingClientRect().top)
    assert.ok(separated,'Bottom copy must not overlap the footer')
    const output=path.join(root,`docs/media/${name}.png`)
    await page.screenshot({path:output})
    console.log(`Rendered ${output}: ${width}×${height}, image decoded, no page errors or element overflow`)
    await page.close()
  }
} finally {await browser.close()}
