import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import {readFileSync} from 'node:fs'
const code=readFileSync(new URL('../dashboard/spotify_control.js',import.meta.url),'utf8')
test('native transport waits for the requested playback state before returning success',()=>{
 let state='paused',pending=null,delays=0
 const spotify={running:()=>true,playerState:()=>state,currentTrack:()=>null,playpause:()=>{pending=state==='paused'?'playing':'paused'},play:()=>{pending='playing'},pause:()=>{pending='paused'}}
 const s={Application:()=>spotify,delay:()=>{delays++;if(delays%2===0)state=pending}}
 vm.createContext(s);vm.runInContext(code,s)
 for(const [action,expected] of [['play','playing'],['pause','paused'],['playpause','playing']]){
  const result=JSON.parse(s.run([action]));assert.equal(result.ok,true);assert.equal(result.state,expected,'must not publish a pre-command snapshot')
 }
})
for (const action of ['volume','seek']) for (const accepted of [true,false]) {
 test(`${action}: ${accepted?'await delayed read-back':'reject ignored slider command'}`,()=>{
  let value=10,pending=10,delays=0
  const spotify={running:()=>true,playerState:()=> 'paused',currentTrack:()=>({duration:()=>200000,spotifyUrl:()=> 'spotify:track:test'})}
  Object.defineProperty(spotify,action==='volume'?'soundVolume':'playerPosition',{get:()=>()=>value,set:v=>{pending=v}})
  const s={Application:()=>spotify,delay:()=>{if(++delays===3&&accepted)value=pending}}
  vm.createContext(s);vm.runInContext(code,s)
  const result=JSON.parse(s.run([action,'40']));assert.equal(result.ok,accepted)
  assert.ok(delays>=3);assert.equal(result[action==='volume'?'volume':'positionSeconds'],accepted?40:10)
 })
}
test('an ignored native playback command is an error, never fabricated success',()=>{
 const spotify={running:()=>true,playerState:()=> 'paused',currentTrack:()=>null,play:()=>{}}
 const s={Application:()=>spotify,delay:()=>{}};vm.createContext(s);vm.runInContext(code,s)
 const result=JSON.parse(s.run(['play']));assert.equal(result.ok,false);assert.match(result.error,/confirm/i)
})
