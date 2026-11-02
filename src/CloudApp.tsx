import { useEffect, useState } from 'react'
import App from './App'
import { firebaseConfigured } from './firebase'
import { profiles } from './characters'
import { createCampaign, editCampaign, watchCampaigns, watchCharacters, saveSharedCharacter, deleteSharedCharacter } from './cloud-store'
import type { Campaign, SharedCharacter } from './cloud-model'
import type { Character, Profile } from './characters'

export type CloudSession = {
  profileName: string
  displayName: string
  campaign: Campaign
  characters: SharedCharacter[]
  save: (character: Character, revision: number) => Promise<void>
  remove: (character: Character) => Promise<void>
  leave: () => void
  logout: () => void
}
function errorText(error: unknown) {
  const code = (error as { code?: string })?.code
  if (code === 'permission-denied') return 'Firestore ha rechazado el acceso. Publica las reglas sin Authentication incluidas en el proyecto.'
  if (code === 'unavailable') return 'No hay conexión con el servidor. Tus cambios no se han guardado; vuelve a intentarlo cuando recuperes la conexión.'
  return error instanceof Error ? error.message : 'No se ha podido completar la operación. Vuelve a intentarlo.'
}
export default function CloudApp() {
  const [local, setLocal] = useState(false)
  const [profileName, setProfileName] = useState<Profile | null>(null)
  const [choice, setChoice] = useState<Profile>('Gabriel')
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [characters, setCharacters] = useState<SharedCharacter[]>([])
  const [readyId, setReadyId] = useState<string | null>(null)
  const [cached, setCached] = useState(true)
  const [campaignsCached, setCampaignsCached] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [name, setName] = useState('')
  const active = campaigns.find(c => c.id === activeId)
  useEffect(() => {
    if (!firebaseConfigured || !profileName || local) return
    return watchCampaigns((data, fromCache) => { setCampaigns(data); setCampaignsCached(fromCache); setError('') }, e => { setCampaigns([]); setActiveId(null); setError(errorText(e)) })
  }, [profileName, local])
  useEffect(() => {
    setCharacters([]); setReadyId(null); setCached(true)
    if (!activeId || !profileName || local) return
    return watchCharacters(activeId, (data, fromCache) => { setCharacters(data); setCached(fromCache); setReadyId(activeId) }, e => { setCharacters([]); setReadyId(null); setError(errorText(e)) })
  }, [activeId, profileName, local])
  async function action(work: () => Promise<unknown>) {
    if (busy) return
    setBusy(true); setError('')
    try { await work() } catch (e) { setError(errorText(e)) } finally { setBusy(false) }
  }
  function changeProfile() { setProfileName(null); setActiveId(null); setCampaigns([]); setCharacters([]); setCampaignsCached(true); setError('') }
  const notice = <>{error && <p className="notice error" role="alert">{error}</p>}</>
  if (local) return <><div className="cloud-banner"><span>Modo local · Sin sincronización</span><button className="secondary" onClick={() => setLocal(false)}>Volver a la mesa compartida</button></div><App /></>
  if (!firebaseConfigured) return <div className="entry-shell"><main className="entry-panel"><h1>Tu mesa, siempre reunida.</h1><p className="intro">La conexión compartida todavía no está activada. Sigue la guía FIREBASE.md del proyecto para conectar tu mesa.</p><button onClick={() => setLocal(true)}>Abrir modo local</button></main></div>
  if (!profileName) return <div className="entry-shell"><main className="entry-panel"><h1>¿Quién se sienta<br />a la mesa?</h1><p className="intro">Elige un perfil para organizar tus personajes y entrar a las campañas compartidas.</p><form className="login-form" onSubmit={e => { e.preventDefault(); setProfileName(choice) }}><label>Perfil<select value={choice} onChange={e => setChoice(e.target.value as Profile)}>{profiles.map(p => <option key={p}>{p}</option>)}</select></label><button>Entrar a la mesa</button></form><p className="local-note">Mesa abierta, sin cuentas ni contraseñas. Cualquier visitante puede consultar y editar las campañas y sus personajes.</p><button className="secondary" onClick={() => setLocal(true)}>Consultar mis datos locales</button></main></div>
  if (active && readyId === active.id) {
    const session: CloudSession = {
      profileName, displayName: profileName, campaign: active, characters,
      save: (character, revision) => saveSharedCharacter(active.id, profileName, character, revision),
      remove: character => deleteSharedCharacter(active.id, character as SharedCharacter),
      leave: () => setActiveId(null), logout: changeProfile,
    }
    return <><div className="cloud-banner" role="status">{cached || campaignsCached ? 'Consultando datos guardados · Esperando conexión' : 'Mesa abierta · Cambios compartidos en tiempo real'}</div><App key={`${active.id}-${profileName}`} cloud={session} /><CampaignJournal key={`journal-${active.id}`} campaign={active} /></>
  }
  return <div className="entry-shell"><main className="entry-panel campaign-lobby"><div className="section-heading"><span>{profileName}</span><button className="secondary" disabled={busy} onClick={changeProfile}>Cambiar perfil</button></div><h1>Campañas de la mesa.</h1><p className="intro">Elige una historia o crea una campaña para tu grupo.</p>{notice}{activeId && <p role="status">Cargando la mesa…</p>}{campaignsCached && !error && <p role="status" className="local-note">Esperando confirmación del servidor…</p>}<div>{campaigns.map(c => <button className="campaign-choice" key={c.id} onClick={() => { setError(''); setActiveId(c.id) }}><span aria-hidden="true">⚑</span><span><strong>{c.name}</strong><small>Entrar a la campaña</small></span></button>)}</div><form className="login-form" onSubmit={e => { e.preventDefault(); void action(async () => { await createCampaign(profileName, name); setName('') }) }}><label>Nombre de la nueva campaña<input required maxLength={80} value={name} onChange={e => setName(e.target.value)} /></label><button disabled={busy}>{busy ? 'Guardando…' : 'Crear campaña'}</button></form><p className="local-note">Todos los perfiles comparten estas campañas. El perfil organiza las fichas; no limita el acceso.</p><button className="secondary" disabled={busy} onClick={() => setLocal(true)}>Consultar mis datos locales</button></main></div>
}

function CampaignJournal({ campaign }: { campaign: Campaign }) {
  const [draft, setDraft] = useState(campaign.notes)
  const [base, setBase] = useState(campaign)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  useEffect(() => { if (!dirty) { setDraft(campaign.notes); setBase(campaign) } }, [campaign, dirty])
  async function save() {
    if (busy) return
    setBusy(true); setMessage('')
    try { await editCampaign(base, { notes: draft }); setDirty(false); setMessage('Notas guardadas.') }
    catch (e) { setMessage(errorText(e)) } finally { setBusy(false) }
  }
  return <section className="shared-journal" aria-labelledby="journal-title"><h2 id="journal-title">Cuaderno de {campaign.name}</h2><p>Notas compartidas con toda la mesa.</p>{dirty && base.revision !== campaign.revision && <p className="notice">La campaña ha cambiado desde que empezaste a escribir. Copia tu borrador antes de cargar la versión compartida.</p>}<form onSubmit={e => { e.preventDefault(); void save() }}><label>Sesiones, objetivos y notas<textarea disabled={busy} maxLength={30000} rows={8} value={draft} onChange={e => { setDirty(true); setDraft(e.target.value) }} /></label><div className="sheet-actions"><button disabled={busy || !dirty}>Guardar notas compartidas</button><button type="button" className="secondary" disabled={busy} onClick={() => { setDraft(campaign.notes); setBase(campaign); setDirty(false) }}>Cargar versión compartida</button></div></form><p role="status">{message}</p></section>
}
