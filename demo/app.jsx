import React, {useState,useEffect} from 'react'
import {createRoot} from 'react-dom/client'
import {QueryClientProvider} from '@tanstack/react-query'
import {queryClient} from './sdk.jsx'
import plugin from '../desktop/plugin.js'
const contributions=[]
let onPaneUpdate=()=>{}
const register=c=>{const existing=contributions.find(x=>x.id===c.id);if(existing)Object.assign(existing,c);else contributions.push(c);if(c.area==='panes'){window.demoPaneSizing=c.data;onPaneUpdate()}}
let player={ok:true,running:true,state:'playing',title:'After hours',artist:'Studio session',album:'Demo fixture · original artwork',artworkUrl:'artwork.webp',spotifyUrl:'spotify:track:demo123',durationMs:216000,positionSeconds:32,volume:45}
const calls=[]; window.demoCalls=calls
window.demoRefreshAuth = () => queryClient.invalidateQueries({queryKey:['spotify-player','auth-status']})
window.demoScenario = {}
let hostReducedMotion=false
const hostPreferenceListeners=new Set()
const hostPreferences={get:()=>({reducedMotion:hostReducedMotion}),subscribe:fn=>{hostPreferenceListeners.add(fn);return()=>hostPreferenceListeners.delete(fn)}}
window.demoSetHostReducedMotion=value=>{hostReducedMotion=Boolean(value);for(const fn of hostPreferenceListeners)fn()}
window.demoSetPlayer = change => {player={...player,...change};queryClient.setQueryData(['spotify-player','native-status'],{...player})}
let saved=false
async function fixture(path,{body}={}) {
 const {action,argument}=body||{}; calls.push({action:action||path,argument,body,at:Date.now()})
 const scenario=window.demoScenario[action||path]
 await new Promise(r=>setTimeout(r,scenario?.delay ?? 180))
 if(scenario?.error)throw new Error(scenario.error)
 if(scenario?.response)return scenario.response
 if(path==='/curate'){
   if(action==='create')return {ok:true,verified:true,playlistId:'bbbbbbbbbbbbbbbbbbbbbb',url:'https://open.spotify.com/playlist/bbbbbbbbbbbbbbbbbbbbbb',trackCount:1,uris:['spotify:track:aaaaaaaaaaaaaaaaaaaaaa']}
   if(action==='set-liked')return {ok:true,verified:true,trackCount:body.tracks.length,saved:body.tracks.map(()=>body.saved)}
   if(action==='taste')return {ok:true,sampleCount:0,tracks:[]}
 }
 if(path.startsWith('/visualizer/'))return {state:'unavailable',message:'This demo has no live audio source. Use the installed macOS player.'}
 if(path==='/auth/status')return {ok:true,loggedIn:true,clientConfigured:true}
 if(action==='status')return {...player}
 if(action==='saved-status')return {ok:true,uri:argument,saved}
 if(action==='set-saved'){saved=JSON.parse(argument).saved;return {ok:true,uri:player.spotifyUrl,saved}}
 if(action==='lyrics')return {ok:true,lyrics:`An original demo lyric.
Keep the music beside the work.`,syncedLyrics:`[00:00.00] An original demo lyric.
[00:32.00] Keep the music beside the work.
[00:38.00] A little less switching.
[00:44.00] A little more listening.`}
 if(action==='search')return {ok:true,results:[{...player,uri:player.spotifyUrl}]}
 if(action==='playlists')return {ok:true,playlists:[{id:'demo',name:'Focus sessions',trackCount:12}]}
 if(action==='playlist-add')return {ok:true,added:true}
 if(action==='playpause')player.state=player.state==='playing'?'paused':'playing'
 if(action==='pause'||action==='play')player.state=action==='play'?'playing':'paused'
 if(action==='next'||action==='previous'){player.title=player.title==='After hours'?'Quiet signal':'After hours';player.positionSeconds=0}
 if(action==='volume')player.volume=Number(argument)
 if(action==='seek')player.positionSeconds=Number(argument)
 if(action==='play-uri')player.state='playing'
 return {...player}
}
plugin.register({register,rest:fixture,hostPreferences,storage:{get:key=>{try{return JSON.parse(localStorage.getItem('spotify-demo:'+key))}catch{return null}},set:(key,value)=>localStorage.setItem('spotify-demo:'+key,JSON.stringify(value))},os:{openExternal:url=>window.open(url,'_blank','noopener')}})
const pane=contributions.find(c=>c.area==='panes'), status=contributions.find(c=>c.area==='statusBar.right')
function App(){const [footer,setFooter]=useState(true);window.demoUnmountFooter=()=>setFooter(false);const [size,setSize]=useState(280),[width,setWidth]=useState(340),[shown,setShown]=useState(true);const [,refresh]=useState(0);useEffect(()=>{onPaneUpdate=()=>refresh(v=>v+1);refresh(v=>v+1);return()=>{onPaneUpdate=()=>{}}},[]); return <QueryClientProvider client={queryClient}>
 <main className="composition"><header className="brand"><span>Hermes <b>×</b> Spotify</span><span className="edition">RETRO PLAYER / 1.3</span></header>
 <div className="hero"><div className="copy"><h1>Keep the music.<br/><em>Lose the switching.</em></h1><p>Native Spotify controls, beside your work.<br/>Less switching. More listening.</p><div className="features"><span>Native macOS</span><span>No web player</span><span>Default chrome FX</span></div><a href="https://github.com/janestreetshiller/hermes-spotify-player">View the source ↗</a></div>
 <div className="product" style={{width,maxWidth:"100%"}}>{shown&&<div id="player-group" data-tree-group="demo-spotify" style={{height:size,minHeight:pane.data.minHeight,maxHeight:pane.data.maxHeight,display:'flex',flexDirection:'column'}}><div className="window-bar" style={{flexShrink:0}}><span>● ● ●</span><strong>Spotify / Retro Player</strong></div><div id="player-pane" style={{flex:1,minHeight:0}}>{pane.render()}</div></div>}<div className="status-bar">{footer&&status.render()}</div></div></div>
 <footer><div className="demo-controls"><button onClick={()=>{setWidth(234);setSize(205)}}>Small</button><button onClick={()=>{setWidth(340);setSize(280)}}>Original</button><button onClick={()=>{setWidth(420);setSize(360)}}>Roomy dock</button><button onClick={()=>setShown(!shown)}>{shown?'Hide pane':'Show pane'}</button></div><p>Interactive UI demo · simulated playback · original artwork<br/>The installed plugin controls the real Spotify app. This page does not.</p></footer><p id="notice" role="status"/></main>
 </QueryClientProvider>}
createRoot(document.querySelector('#root')).render(<App/> )
