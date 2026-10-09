import {chromium} from 'playwright'
import {readFile,writeFile} from 'node:fs/promises'
import {createServer} from 'node:http'
const files=new Map(await Promise.all([['/','index.html','text/html'],['/app.js','app.js','text/javascript'],['/style.css','style.css','text/css'],['/artwork.webp','artwork.webp','image/webp']].map(async([url,f,type])=>[url,{body:await readFile('docs/demo/'+f),type}])))
const server=createServer((req,res)=>{const f=files.get(req.url);res.writeHead(f?200:404,{'Content-Type':f?.type||'text/plain'});res.end(f?.body)})
await new Promise(r=>server.listen(0,'127.0.0.1',r))
const browser=await chromium.launch({headless:true})
try{
 const page=await browser.newPage({viewport:{width:1100,height:850}})
 await page.goto(`http://127.0.0.1:${server.address().port}/`)
 await page.getByRole('tab',{name:'Artwork',exact:true}).waitFor()
 const result=await page.locator('.spotify-surface').evaluate(e=>{
  const url=getComputedStyle(e).backgroundImage.slice(5,-2),xml=new DOMParser().parseFromString(decodeURIComponent(url.split(',')[1]),'image/svg+xml');
  const ctx=document.createElement('canvas').getContext('2d'),shape=new Path2D(xml.querySelectorAll('path')[1].getAttribute('d'));
  const inside=(x,y)=>ctx.isPointInPath(shape,x,y);
  const roundFits=(x,y,w,h,r,pad)=>{for(let i=0;i<72;i++){const a=i*Math.PI/36,cx=x+(Math.cos(a)>=0?w-r:r),cy=y+(Math.sin(a)>=0?h-r:r);if(!inside(cx+Math.cos(a)*(r+pad),cy+Math.sin(a)*(r+pad)))return false}return true};
  // Preserve display top=40 and fixed 320×280 faceplate. Reserve four pixels
  // before display, three between painted controls, and the real inner SVG edge.
  const top=[];for(let w=48;w<=64;w+=2)for(let h=20;h<=28;h+=2)for(let y=10;y<=16;y++){
   const gap=4,pad=1,span=3*w+2*gap,x=(320-span)/2;
   if(span>180||y+h+pad>36)continue;
   if([0,1,2].every(i=>roundFits(x+i*(w+gap),y,w,h,8,pad)))top.push({width:w,height:h,top:y,span,area:w*h});
  }
  const side=[];for(let size=26;size<=36;size+=2)for(let cx=36;cx<=48;cx++){const pad=3,gap=8,bottom=187,topY=bottom-(3*size+2*gap);const fits=[cx,320-cx].every(center=>[0,1,2].every(i=>roundFits(center-size/2,topY+i*(size+gap),size,size,size/2,pad)));const displayLeft=Math.ceil(cx+size/2+pad+2);if(fits&&320-2*displayLeft>=192)side.push({size,center:cx,displayLeft,screenWidth:320-2*displayLeft,top:topY,minRendered:size*234/320})}side.sort((a,b)=>a.size-b.size||b.displayLeft-a.displayLeft);
  top.sort((a,b)=>b.area-a.area||b.top-a.top);return {constraints:{faceplate:[320,280],minimumWidth:234,displayTop:40,displaySides:[55,265],maxTopSpan:180,topPaintAllowance:1,sidePaintAllowance:3},topCandidates:top,sideCandidates:side,recommended:{top:top[0],side:side.at(-1)}}
 });
 await writeFile('docs/evidence/ui-audit/button-sizing.json',JSON.stringify(result,null,2));console.log(JSON.stringify({constraints:result.constraints,recommended:result.recommended,feasibleTopSizes:result.topCandidates.length,sideCandidates:result.sideCandidates},null,2))
}finally{await browser.close();server.close()}
