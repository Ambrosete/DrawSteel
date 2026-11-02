import CharacterProgression from './CharacterProgression'
import DeleteCharacterDialog from './DeleteCharacterDialog'
import TransferCharacterDialog from './TransferCharacterDialog'
import { AbilityDetails } from './AbilityPicker'
import { chosenAbilities, removeOwnedCharacter, subclassOptions } from './progression'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import CharacterCreator from './CharacterCreator'
import { canEnter, charactersFor, characteristicNames, parseCharacters, profiles, storageKey } from './characters'
import type { Character, Profile } from './characters'
import type { CloudSession } from './CloudApp'
import type { Campaign, SharedCharacter } from './cloud-model'
import { localSessionKey, readSavedSession, saveSession } from './saved-session'

type Page = 'inicio' | 'personajes' | 'campanas' | 'combate' | 'reglas'
const navigation: { id: Page; label: string; icon: string }[] = [
  { id: 'inicio', label: 'Inicio', icon: '◇' }, { id: 'personajes', label: 'Personajes', icon: '♙' },
  { id: 'campanas', label: 'Campañas', icon: '⚑' }, { id: 'combate', label: 'Combate', icon: '⚔' }, { id: 'reglas', label: 'Reglas', icon: '▤' },
]
function loadCharacters(): Character[] {
  try { return parseCharacters(localStorage.getItem(storageKey)) } catch { return [] }
}
function currentPage(): Page { return navigation.find(n => n.id === location.hash.slice(1))?.id ?? 'inicio' }

export default function App({ cloud }: { cloud?: CloudSession }) {
  const [page, setPage] = useState<Page>(currentPage)
  const [restored] = useState(() => readSavedSession(localSessionKey))
  const [localProfile, setProfile] = useState<Profile | null>(cloud ? null : restored.profile)
  const profile = cloud?.profileName ?? localProfile
  const displayName = cloud?.displayName ?? profile ?? ''
  const campaignName = cloud?.campaign.name ?? 'Tyranny'
  const [loginChoice, setLoginChoice] = useState<Profile>('Gabriel')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [campaign, setCampaign] = useState<string | null>(cloud?.campaign.id ?? (restored.campaignId === 'Tyranny' ? 'Tyranny' : null))
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(cloud ? null : restored.characterId)
  const selectedId = cloud ? cloud.selectedCharacterId : localSelectedId
  function setSelectedId(id: string | null) { if (cloud) cloud.selectCharacter(id); else setLocalSelectedId(id) }
  const [localCharacters, setCharacters] = useState<Character[]>(loadCharacters)
  const characters = cloud?.characters ?? localCharacters
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [trainingBase, setTrainingBase] = useState<Character | null>(null)
  const [trainingTarget, setTrainingTarget] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Character | null>(null)
  const [transferTarget, setTransferTarget] = useState<Character | null>(null)
  const [transferNotice, setTransferNotice] = useState('')
  const [storageError, setStorageError] = useState(false)
  useEffect(() => { const update = () => setPage(currentPage()); window.addEventListener('hashchange', update); return () => window.removeEventListener('hashchange', update) }, [])
  useEffect(() => {
    if (!cloud) saveSession(localSessionKey, { profile: localProfile, campaignId: campaign, characterId: localSelectedId })
  }, [cloud, localProfile, campaign, localSelectedId])
  useEffect(() => {
    if (cloud) return
    try {
      // El modo local conserva sus propios datos; nunca se suben automáticamente.
      localStorage.setItem(storageKey, JSON.stringify(characters))
      setStorageError(false)
    } catch { setStorageError(true) }
  }, [characters, cloud])
  const mine = cloud ? characters : localProfile ? charactersFor(characters, localProfile) : []
  const selected = mine.find(c => c.id === selectedId)
  const filtered = mine.filter(c => `${c.name} ${c.heroClass} ${c.ancestry}`.toLocaleLowerCase('es').includes(query.toLocaleLowerCase('es')))
  function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canEnter(loginChoice, password)) { setLoginError('La contraseña de Gabriel no es correcta.'); return }
    setProfile(loginChoice); setPassword(''); setLoginError(''); setCampaign(null); setSelectedId(null); setCreating(false); setQuery('')
  }
  function logout() { if (cloud) { cloud.logout(); return } setTrainingTarget(null); setDeleteTarget(null); setProfile(null); setCampaign(null); setSelectedId(null); setPassword(''); setLoginError(''); setCreating(false); setQuery('') }
  function chooseCharacter(character: Character) { setTrainingTarget(null); setSelectedId(character.id); setCreating(false); setPage('inicio'); location.hash = 'inicio' }
  async function cloudAction(work: () => Promise<void>, success: () => void) {
    if (saving) return
    setSaving(true); setSaveError('')
    try { await work(); success() } catch (error) { setSaveError(error instanceof Error ? error.message : 'No se han guardado los cambios. Vuelve a intentarlo.') } finally { setSaving(false) }
  }
  function saveCharacter(character: Character) {
    if (cloud) { void cloudAction(() => cloud.save(character, 0), () => { setQuery(''); chooseCharacter(character) }); return }
    setCharacters(previous => [...previous, character]); setQuery(''); chooseCharacter(character)
  }
  function updateCharacter(updated: Character) {
    if (cloud) { void cloudAction(() => cloud.save(updated, (updated as SharedCharacter).revision), () => setTrainingTarget(null)); return }
    setCharacters(previous => previous.map(c => c.id === updated.id && c.owner === profile && c.campaign === 'Tyranny' ? updated : c))
    setTrainingTarget(null)
  }
  function deleteCharacter() {
    if (!deleteTarget || !profile) return
    if (cloud) { void cloudAction(() => cloud.remove(deleteTarget), () => { setDeleteTarget(null); if (selectedId === deleteTarget.id) { setSelectedId(null); setTrainingTarget(null) } }); return }
    setCharacters(previous => removeOwnedCharacter(previous, deleteTarget.id, profile))
    if (selectedId === deleteTarget.id) { setSelectedId(null); setTrainingTarget(null); setPage('personajes'); location.hash = 'personajes' }
    setDeleteTarget(null)
  }
  async function transferCharacter(destination: Campaign) {
    if (!cloud || !transferTarget) return
    await cloud.transfer(transferTarget, destination.id)
    setTransferNotice(`${transferTarget.name} se ha transferido a «${destination.name}».`)
    if (selectedId === transferTarget.id) { setSelectedId(null); setTrainingTarget(null); setPage('personajes'); location.hash = 'personajes' }
    setTransferTarget(null)
  }
  const storageNotice = <>{saveError && <p role="alert" className="notice">{saveError}</p>}{saving && <p role="status">Guardando en la mesa…</p>}{!cloud && storageError && <p role="status" className="notice">No se pueden guardar los cambios en este navegador. Se conservarán solo durante esta sesión.</p>}</>

  if (!profile) return <div className="entry-shell"><main className="entry-panel"><div className="eyebrow">DRAWSTEEL · TU MESA DE AVENTURAS</div><h1>¿Quién entra<br />a la aventura?</h1><p className="intro">Elige tu perfil para continuar.</p><form onSubmit={login} className="login-form"><label>Perfil<select name="profile" value={loginChoice} onChange={e => { setLoginChoice(e.target.value as Profile); setPassword(''); setLoginError('') }}>{profiles.map(name => <option key={name}>{name}</option>)}</select></label>{loginChoice === 'Gabriel' && <label>Contraseña<input name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" /></label>}{loginError && <p role="alert" className="error">{loginError}</p>}<button type="submit">Entrar ↗</button></form><p className="local-note">Acceso local de prototipo. Los perfiles y la contraseña no protegen los datos frente a otros usuarios de este navegador. Los demás perfiles no requieren contraseña.</p>{storageNotice}</main></div>

  if (!campaign) return <div className="entry-shell"><main className="entry-panel"><div className="eyebrow">BIENVENIDO, {profile.toLocaleUpperCase('es')}</div><h1>Elige tu campaña.</h1><p className="intro">Una historia espera a tus héroes.</p><button className="campaign-choice" onClick={() => { setCampaign('Tyranny'); setSelectedId(null); setPage('personajes'); location.hash = 'personajes' }}><span aria-hidden="true">⚑</span><span><strong>Tyranny</strong><small>Entrar a la campaña →</small></span></button><button className="secondary" onClick={logout}>Cambiar de perfil</button>{storageNotice}</main></div>

  const characterScreen = !selected || page === 'personajes'
  return <div className="app-shell"><aside className="sidebar">
    <a className="brand" href="#inicio"><span className="brand-symbol">⚔</span><span>DRAW<span className="gold">STEEL</span><small>{campaignName}</small></span></a>
    <p className="nav-heading">ESPACIO DE JUEGO</p>
    <nav aria-label="Navegación principal">{navigation.map(n => <a key={n.id} href={`#${n.id}`} className={(characterScreen ? n.id === 'personajes' : page === n.id) ? 'active' : ''} aria-current={(characterScreen ? n.id === 'personajes' : page === n.id) ? 'page' : undefined}><span aria-hidden="true">{n.icon}</span>{n.label}</a>)}</nav>
    <div className="sidebar-note"><span className="status-dot" />{displayName} · {campaignName}<small>{selected?.name ?? 'Elige o crea un personaje para continuar'}</small><button className="secondary" onClick={() => { cloud ? cloud.leave() : (setCampaign(null), setSelectedId(null), setCreating(false), setQuery('')) }}>Cambiar campaña</button><button className="secondary" onClick={logout}>Salir / cambiar perfil</button></div>
  </aside><main><header className="topbar"><span>{campaignName} <span className="breadcrumb">/ {characterScreen ? 'Personajes' : navigation.find(n => n.id === page)?.label}</span></span><span className="profile">{displayName}</span></header><div className="content">
    {storageNotice}
    {transferNotice && <p className="notice" role="status">{transferNotice}</p>}
    <fieldset className="write-lock" disabled={saving || cloud?.reconnecting}>{characterScreen ? <>
      <div className="eyebrow">{campaignName} · {displayName}</div><div className="page-heading"><div><h1>Elige a tu héroe.</h1><p className="intro">Consulta los personajes de tu mesa o crea el tuyo.</p></div><button onClick={() => setCreating(!creating)}>{creating ? 'Cerrar creador' : '+ Crear personaje'}</button></div>
      {creating ? <CharacterCreator profile={profile} campaignName={campaignName} displayName={displayName} onSave={saveCharacter} onCancel={() => setCreating(false)} /> : <>
        <label className="search-label">Buscar personajes<input type="search" placeholder="Nombre, clase o ascendencia…" value={query} onChange={e => setQuery(e.target.value)} /></label>
        <div className="section-heading"><h2>{cloud ? 'Personajes de la mesa' : 'Tus personajes'}</h2><span>{filtered.length} personajes</span></div>
        <div className="character-grid">{filtered.map((c, i) => <article className="character-card" key={c.id}><div className={`portrait portrait-${i % 3}`} aria-hidden="true">{c.name.split(' ').slice(0, 2).map(w => w[0]).join('')}<span>✦</span></div><div className="character-body"><span className="level">NIVEL {c.level ?? 1} · {campaignName}</span><h3>{c.name}</h3><p>{c.ancestry} · {c.heroClass}</p><div className="campaign-label">{c.background} · {c.kit}</div><button onClick={() => chooseCharacter(c)}>Elegir personaje ↗</button>{cloud && <button className="secondary" onClick={() => setTransferTarget(c)}>Transferir personaje</button>}{<button className="danger" aria-label={`Eliminar a ${c.name}`} onClick={() => setDeleteTarget(c)}>Eliminar personaje</button>}</div></article>)}</div>
        {filtered.length === 0 && <div className="empty-state"><h2>{mine.length ? 'No hay coincidencias' : 'Tu historia empieza en blanco'}</h2><p>{mine.length ? 'Prueba otra búsqueda.' : 'Todavía no hay personajes. Crea el primero para empezar la aventura.'}</p>{!mine.length && <button onClick={() => setCreating(true)}>Crear mi personaje</button>}</div>}
      </>}
    </> : page === 'inicio' ? <>
      <div className="eyebrow">{campaignName} · {displayName}</div><h1>Tu aventura,<br /><em>{selected.name}.</em></h1><p className="intro">Tu personaje está listo como borrador. Elige sus habilidades y revisa con el Director los rasgos y las demás mejoras de clase.</p>
      <article className="character-sheet"><div className="section-heading"><h2>{selected.name} · Nivel {selected.level ?? 1}</h2><div className="sheet-actions"><a href="#personajes" className="button">Cambiar personaje</a>{cloud && <button className="secondary" onClick={() => setTransferTarget(selected)}>Transferir personaje</button>}{<button className="danger" onClick={() => setDeleteTarget(selected)}>Eliminar personaje</button>}</div></div><dl className="detail-grid">{[['Raza / ascendencia', selected.ancestry], ['Fondo', selected.background], ['Clase', selected.heroClass], ['Subclase / dominios', selected.training?.subclasses.join(' / ') || 'Pendiente'], ['Kit', [selected.kit, selected.secondKit].filter(Boolean).join(' + ')], ['Complicación', selected.complication || 'Sin complicación'], ['Campaña', campaignName], ...(selected.culture ? [['Entorno', selected.culture.environment], ['Organización', selected.culture.organization], ['Crianza', selected.culture.upbringing], ['Idioma cultural', selected.culture.language]] : [])].map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl><div className="scores">{characteristicNames.map(key => <div className="score" key={key}><span>{key}</span><strong>{selected.characteristics[key]}</strong></div>)}</div></article>
      {trainingTarget !== null ? <CharacterProgression key={`${selected.id}-${trainingTarget}`} character={trainingBase ?? selected} targetLevel={trainingTarget} onSave={updateCharacter} onCancel={() => setTrainingTarget(null)} /> : <section className="character-sheet ability-section"><div className="section-heading"><h2>Habilidades de combate</h2>{subclassOptions[selected.heroClass] && ((selected.level ?? 1) < 10 || !selected.training) && <button onClick={() => { setTrainingBase(selected); setTrainingTarget(selected.training ? (selected.level ?? 1) + 1 : selected.level ?? 1) }}>{selected.training ? `Subir a nivel ${(selected.level ?? 1) + 1}` : 'Completar habilidades'}</button>}</div>
        {!selected.training && <p className="notice">Este borrador todavía no tiene habilidades de clase elegidas. Complétalas para poder subir de nivel.</p>}
        {!subclassOptions[selected.heroClass] && <p className="notice">La clase de este borrador es una opción propia. Para usar la progresión del manual, crea un personaje con una de sus nueve clases.</p>}
        {(selected.level ?? 1) === 10 && <p className="notice">Nivel máximo del manual: 10.</p>}
        <div className="ability-card-grid">{chosenAbilities(selected).map(ability => <AbilityDetails key={ability.id} ability={ability} />)}</div>
      </section>}
      <div className="section-heading"><h2>Tu mesa de juego</h2></div><div className="feature-grid">{navigation.slice(1).map(n => <a className="feature-card" href={`#${n.id}`} key={n.id}><span className="feature-icon">{n.icon}</span><h3>{n.label}<span>↗</span></h3><small>{n.id === 'personajes' ? `${mine.length} personajes` : n.id === 'campanas' ? campaignName : 'Próximamente'}</small></a>)}</div>
    </> : page === 'campanas' ? <><h1>{campaignName}</h1><p className="intro">{cloud ? 'Consulta el cuaderno compartido al final de la página. Todos los perfiles pueden consultar y editar la mesa.' : 'Esta campaña se guarda solo en este navegador.'}</p><button onClick={() => cloud ? cloud.leave() : setCampaign(null)}>Volver a elegir campaña</button></> : <><div className="eyebrow">CONSTRUYENDO LA AVENTURA</div><h1>{page === 'combate' ? 'Combate' : 'Reglas'}</h1><div className="placeholder"><h2>{page === 'combate' ? 'Prepara tu próximo encuentro.' : 'El manual, junto a tu mesa.'}</h2><p>{page === 'combate' ? 'El tablero, las tiradas y los combates supervisados por el Director se incorporarán en próximas versiones.' : 'El creador incorpora 12 ascendencias, 18 carreras, 9 clases, 21 kits y 100 complicaciones de Draw Steel Heroes v1.01b, con referencias de página. Valida características iniciales y acceso a kits. Los efectos de rasgos, habilidades y complicaciones se consultan con el Director.'}</p><a className="button" href="#inicio">Volver a mi personaje</a></div></>}
    </fieldset>{deleteTarget && <DeleteCharacterDialog name={deleteTarget.name} shared={!!cloud} busy={saving} onCancel={() => setDeleteTarget(null)} onDelete={deleteCharacter} />}
    {transferTarget && cloud && <TransferCharacterDialog character={transferTarget} source={campaignName} destinations={cloud.campaigns.filter(c => c.id !== cloud.campaign.id && !c.deleting)} onTransfer={transferCharacter} onCancel={() => setTransferTarget(null)} />}
    <footer>DRAWSTEEL <span>{campaignName} · {displayName}</span><small>{cloud ? 'Mesa compartida' : 'Modo local · Datos en este navegador'}</small></footer>
  </div></main></div>
}
