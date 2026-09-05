import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import vm from 'node:vm'
import test from 'node:test'
// Execute the shipped module with the supported SDK boundary, not source regexes.
const code=readFileSync(new URL('./plugin.js',import.meta.url),'utf8').replace(/^import .* from .*$/gm,'').replace('export default','globalThis.plugin =')
function load(rest=async()=>({ok:true,state:'paused'})){
 const calls=[],writes=[],contributions=[]
 const s={console,PALETTE_AREA:'commands',atom:value=>({get:()=>value,set:next=>{value=next}}),jsx:(type,props)=>({type,props}),queryClient:{cancelQueries:async()=>{},setQueryData:(key,value)=>writes.push({key,value})}}
 vm.createContext(s);vm.runInContext(code,s)
 s.plugin.register({storage:{get:()=>null},os:{openExternal:()=>true},register:c=>contributions.push(c),rest:(path,options)=>{calls.push({path,options});return rest(path,options)}})
 return {s,calls,writes,contributions}
}
test('registers a single side pocket, persistent footer, and a working search command',()=>{
 const {s,contributions}=load();const pane=contributions.find(c=>c.area==='panes'),footer=contributions.find(c=>c.area==='statusBar.right'),command=contributions.find(c=>c.area==='commands')
 assert.ok(pane.render());assert.ok(footer.render());assert.equal(pane.data.dock.pane,'sessions');assert.equal(pane.data.dock.pos,'bottom');command.data.run();assert.equal(vm.runInContext('$searchOpen.get()',s),true)
})
test('all native commands travel through the scoped control route and publish returned truth',async()=>{
 const {s,calls,writes}=load(async(_,{body})=>({ok:true,state:body.action==='play'?'playing':'paused'}))
 for(const [action,argument] of [['play',''],['pause',''],['next',''],['previous',''],['seek','17'],['volume','42'],['play-uri','spotify:track:aaaaaaaaaaaaaaaaaaaaaa']]){
  const result=await s.runNativeSpotify(action,argument);assert.equal(calls.at(-1).path,'/control');assert.equal(calls.at(-1).options.method,'POST');assert.equal(calls.at(-1).options.body.action,action);assert.equal(calls.at(-1).options.body.argument,argument);assert.equal(writes.at(-1).value,result)
 }
})
test('native failures never publish a success snapshot and release the busy lock',async()=>{
 const {s,writes}=load(async()=>({ok:false,error:'Native unavailable'}));await assert.rejects(s.runNativeSpotify('play'),/Native unavailable/);assert.equal(writes.length,0);assert.equal(vm.runInContext('$commandBusy.get()',s),false)
})
test('overlapping playback requests cannot accidentally double-toggle',async()=>{
 let release;const {s,calls}=load(()=>new Promise(r=>release=r));const pending=s.runNativeSpotify('play');await Promise.resolve();await assert.rejects(s.runNativeSpotify('pause'),/already running/);release({ok:true,state:'playing'});await pending;assert.equal(calls.length,1)
})
test('library and search operations do not overwrite native playback snapshots',async()=>{
 const {s,calls,writes}=load(async()=>({ok:true,results:[],saved:true}));for(const action of ['search','saved-status','set-saved','playlists','playlist-add','lyrics'])await s.runNativeSpotify(action,'payload');assert.equal(writes.length,0);assert.equal(calls.length,6)
})
test('faceplate scales uniformly and bounds narrow docks instead of crushing controls',()=>{
 const {s}=load();for(const width of [100,234,280,320,640]){const scale=s.retroPlayerScale(width);assert.ok(scale>=234/320&&scale<=1);assert.equal(320*scale/(280*scale),8/7)}
})
test('timeline interpolation advances only playing tracks and stops at duration',()=>{
 const {s}=load();assert.equal(s.nextTimelinePosition({state:'playing',positionSeconds:111.2,durationMs:219000}),112);assert.equal(s.nextTimelinePosition({state:'paused',positionSeconds:112,durationMs:219000}),112);assert.equal(s.nextTimelinePosition({state:'playing',positionSeconds:219,durationMs:219000}),219)
})
test('snapshot reconciliation accepts real seeks and track changes without small backwards jitter',()=>{
 const {s}=load(),p={state:'playing',spotifyUrl:'spotify:track:a',positionSeconds:112,durationMs:219000};assert.equal(s.mergePlayerSnapshot(p,{...p,positionSeconds:111.4}).positionSeconds,112);assert.equal(s.mergePlayerSnapshot(p,{...p,positionSeconds:130}).positionSeconds,130);assert.equal(s.mergePlayerSnapshot(p,{...p,spotifyUrl:'spotify:track:b',positionSeconds:5}).positionSeconds,5)
})
