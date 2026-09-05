import React, {useState} from 'react'
import {createRoot} from 'react-dom/client'
import {QueryClientProvider} from '@tanstack/react-query'
import {queryClient} from './sdk.jsx'
import plugin from '../desktop/plugin.js'
const contributions=[]
let player={ok:true,running:true,state:'playing',title:'After hours',artist:'Studio session',album:'Demo fixture · original artwork',artworkUrl:'artwork.webp',spotifyUrl:'spotify:track:demo123',durationMs:216000,positionSeconds:32,volume:45}
const calls=[]; window.demoCalls=calls
let saved=false
async function fixture(path,{body}={}) {
 const {action,argument}=body||{}; calls.push({action:action||path,at:Date.now()})
 await new Promise(r=>setTimeout(r,180))
 if(path==='/auth/status')return {ok:true,loggedIn:false,clientConfigured:false}
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
plugin.register({register:c=>contributions.push(c),rest:fixture,storage:{get:()=>false,set:()=>{}},os:{openExternal:url=>window.open(url,'_blank','noopener')}})
const pane=contributions.find(c=>c.area==='panes'), status=contributions.find(c=>c.area==='statusBar.right')
function App(){const [size,setSize]=useState(440),[shown,setShown]=useState(true); return <QueryClientProvider client={queryClient}>
 <main className="composition"><header className="brand"><span>Hermes <b>×</b> Spotify</span><span className="edition">PLAYER / 1.3</span></header>
 <div className="hero"><div className="copy"><h1>Keep the music.<br/><em>Lose the switching.</em></h1><p>Native Spotify controls, beside your work.<br/>A smaller footprint. A familiar Nokie glow.</p><div className="features"><span>Native macOS</span><span>No web player</span><span>Effects optional</span></div><a href="https://github.com/janestreetshiller/hermes-spotify-player">View the source ↗</a></div>
 <div className="product"><div className="window-bar"><span>● ● ●</span><strong>Spotify / Hermes pane</strong></div>{shown&&<div id="player-pane" style={{height:size}}>{pane.render()}</div>}<div className="status-bar">{status.render()}</div></div></div>
 <footer><div className="demo-controls"><button onClick={()=>setSize(76)}>Compact</button><button onClick={()=>setSize(176)}>Standard</button><button onClick={()=>setSize(440)}>Expanded</button><button onClick={()=>setShown(!shown)}>{shown?'Hide pane':'Show pane'}</button></div><p>Interactive UI demo · simulated playback · original artwork<br/>The installed plugin controls the real Spotify app. This page does not.</p></footer><p id="notice" role="status"/></main>
 </QueryClientProvider>}
createRoot(document.querySelector('#root')).render(<App/> )
