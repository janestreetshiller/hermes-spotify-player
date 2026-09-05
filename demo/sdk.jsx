// Demo-only adapter. Production imports Hermes' real SDK, never this file.
import React, {createContext, useContext, useEffect} from 'react'
import {QueryClient} from '@tanstack/react-query'
export {useQuery} from '@tanstack/react-query'
export {atom} from 'nanostores'
export {useStore as useValue} from '@nanostores/react'
export const queryClient = new QueryClient()
export const PALETTE_AREA = 'commands'
export const host = {notify: ({message}) => {document.querySelector('#notice').textContent = message}}
export function Button({size,variant,children,...props}) {return <button {...props} className={'demo-button '+(variant||'')+' '+(props.className||'')}>{children}</button>}
export const Input = props => <input {...props}/>
export const SearchField = ({onValueChange,...props}) => <input {...props} onChange={e => onValueChange?.(e.target.value)}/>
export const Tip = ({children,label}) => <span title={label}>{children}</span>
export const StatusDot = ({tone}) => <span className={'dot '+tone}/>
export const GlyphSpinner = ({ariaLabel}) => <span role="status" aria-label={ariaLabel}>⋯</span>
const DialogContext=createContext(null)
export function Dialog({open,onOpenChange,children}) {
 useEffect(()=>{if(!open)return; const f=e=>{if(e.key==='Escape')onOpenChange(false)};document.addEventListener('keydown',f);return()=>document.removeEventListener('keydown',f)},[open,onOpenChange])
 return open?<DialogContext.Provider value={onOpenChange}><div className="modal-backdrop">{children}</div></DialogContext.Provider>:null
}
export function DialogContent({children,...props}) {const close=useContext(DialogContext);return <div role="dialog" aria-modal="true" {...props}><button className="close" aria-label="Close dialog" onClick={()=>close(false)}>×</button>{children}</div>}
export const DialogHeader = ({children,...props})=><header {...props}>{children}</header>
export const DialogTitle = ({children})=><h2>{children}</h2>
export const DialogDescription = ({children})=><p>{children}</p>
const paths={Play:'M7 4l14 8-14 8z',Pause:'M8 4v16M16 4v16',ChevronLeft:'M15 5l-7 7 7 7',ChevronRight:'M9 5l7 7-7 7',Plus:'M12 4v16M4 12h16',Search:'M20 20l-5-5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',Lock:'M6 10h12v11H6zM8 10V6a4 4 0 0 1 8 0v4',AudioLines:'M4 9v6M8 4v16M12 7v10M16 3v18M20 9v6',CheckCircle:'M6 12l4 4 8-8'}
export const icons=Object.fromEntries(Object.entries(paths).map(([name,d])=>[name,props=><svg {...props} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>]))
