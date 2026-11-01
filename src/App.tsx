import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import CharacterCreator from './CharacterCreator'
import { canEnter, charactersFor, characteristicNames, legacyStorageKey, parseCharacters, profiles, storageKey } from './characters'
import type { Character, Profile } from './characters'

type Page = 'inicio' | 'personajes' | 'campanas' | 'combate' | 'reglas'
const navigation: { id: Page; label: string; icon: string }[] = [
  { id: 'inicio', label: 'Inicio', icon: '◇' }, { id: 'personajes', label: 'Personajes', icon: '♙' },
  { id: 'campanas', label: 'Campañas', icon: '⚑' }, { id: 'combate', label: 'Combate', icon: '⚔' }, { id: 'reglas', label: 'Reglas', icon: '▤' },
]
function loadCharacters(): Character[] {
  try { return parseCharacters(localStorage.getItem(storageKey)) } catch { return [] }
}
function currentPage(): Page { return navigation.find(n => n.id === location.hash.slice(1))?.id ?? 'inicio' }

export default function App() {
  const [page, setPage] = useState<Page>(currentPage)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loginChoice, setLoginChoice] = useState<Profile>('Gabriel')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [campaign, setCampaign] = useState<'Tyranny' | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [characters, setCharacters] = useState<Character[]>(loadCharacters)
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [storageError, setStorageError] = useState(false)
  useEffect(() => { const update = () => setPage(currentPage()); window.addEventListener('hashchange', update); return () => window.removeEventListener('hashchange', update) }, [])
  useEffect(() => {
    try {
      // La colección anterior se elimina a petición del usuario. No se importan ejemplos ni personajes antiguos.
      localStorage.removeItem(legacyStorageKey)
      localStorage.setItem(storageKey, JSON.stringify(characters))
      setStorageError(false)
    } catch { setStorageError(true) }
  }, [characters])
  const mine = profile ? charactersFor(characters, profile) : []
  const selected = mine.find(c => c.id === selectedId)
  const filtered = mine.filter(c => `${c.name} ${c.heroClass} ${c.ancestry}`.toLocaleLowerCase('es').includes(query.toLocaleLowerCase('es')))
  function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canEnter(loginChoice, password)) { setLoginError('La contraseña de Gabriel no es correcta.'); return }
    setProfile(loginChoice); setPassword(''); setLoginError(''); setCampaign(null); setSelectedId(null); setCreating(false); setQuery('')
  }
  function logout() { setProfile(null); setCampaign(null); setSelectedId(null); setPassword(''); setLoginError(''); setCreating(false); setQuery('') }
  function chooseCharacter(character: Character) { setSelectedId(character.id); setCreating(false); setPage('inicio'); location.hash = 'inicio' }
  function saveCharacter(character: Character) { setCharacters(previous => [...previous, character]); setQuery(''); chooseCharacter(character) }
  const storageNotice = storageError && <p role="status" className="notice">No se pueden guardar los cambios en este navegador. Se conservarán solo durante esta sesión.</p>

  if (!profile) return <div className="entry-shell"><main className="entry-panel"><div className="eyebrow">DRAWSTEEL · TU MESA DE AVENTURAS</div><h1>¿Quién entra<br />a la aventura?</h1><p className="intro">Elige tu perfil para continuar.</p><form onSubmit={login} className="login-form"><label>Perfil<select name="profile" value={loginChoice} onChange={e => { setLoginChoice(e.target.value as Profile); setPassword(''); setLoginError('') }}>{profiles.map(name => <option key={name}>{name}</option>)}</select></label>{loginChoice === 'Gabriel' && <label>Contraseña<input name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" /></label>}{loginError && <p role="alert" className="error">{loginError}</p>}<button type="submit">Entrar ↗</button></form><p className="local-note">Acceso local de prototipo. Los perfiles y la contraseña no protegen los datos frente a otros usuarios de este navegador. Los demás perfiles no requieren contraseña.</p>{storageNotice}</main></div>

  if (!campaign) return <div className="entry-shell"><main className="entry-panel"><div className="eyebrow">BIENVENIDO, {profile.toLocaleUpperCase('es')}</div><h1>Elige tu campaña.</h1><p className="intro">Una historia espera a tus héroes.</p><button className="campaign-choice" onClick={() => { setCampaign('Tyranny'); setSelectedId(null); setPage('personajes'); location.hash = 'personajes' }}><span aria-hidden="true">⚑</span><span><strong>Tyranny</strong><small>Entrar a la campaña →</small></span></button><button className="secondary" onClick={logout}>Cambiar de perfil</button>{storageNotice}</main></div>

  const characterScreen = !selected || page === 'personajes'
  return <div className="app-shell"><aside className="sidebar">
    <a className="brand" href="#inicio"><span className="brand-symbol">⚔</span><span>DRAW<span className="gold">STEEL</span><small>CAMPAÑA TYRANNY</small></span></a>
    <p className="nav-heading">ESPACIO DE JUEGO</p>
    <nav aria-label="Navegación principal">{navigation.map(n => <a key={n.id} href={`#${n.id}`} className={(characterScreen ? n.id === 'personajes' : page === n.id) ? 'active' : ''} aria-current={(characterScreen ? n.id === 'personajes' : page === n.id) ? 'page' : undefined}><span aria-hidden="true">{n.icon}</span>{n.label}</a>)}</nav>
    <div className="sidebar-note"><span className="status-dot" />{profile} · Tyranny<small>{selected?.name ?? 'Elige o crea un personaje para continuar'}</small><button className="secondary" onClick={() => { setCampaign(null); setSelectedId(null); setCreating(false); setQuery('') }}>Cambiar campaña</button><button className="secondary" onClick={logout}>Salir / cambiar perfil</button></div>
  </aside><main><header className="topbar"><span>Tyranny <span className="breadcrumb">/ {characterScreen ? 'Personajes' : navigation.find(n => n.id === page)?.label}</span></span><span className="profile">{profile}</span></header><div className="content">
    {storageNotice}
    {characterScreen ? <>
      <div className="eyebrow">TYRANNY · {profile.toLocaleUpperCase('es')}</div><div className="page-heading"><div><h1>Elige a tu héroe.</h1><p className="intro">Selecciona uno de tus personajes o empieza una nueva historia.</p></div><button onClick={() => setCreating(!creating)}>{creating ? 'Cerrar creador' : '+ Crear personaje'}</button></div>
      {creating ? <CharacterCreator profile={profile} characters={mine} onSave={saveCharacter} onCancel={() => setCreating(false)} /> : <>
        <label className="search-label">Buscar personajes<input type="search" placeholder="Nombre, clase o ascendencia…" value={query} onChange={e => setQuery(e.target.value)} /></label>
        <div className="section-heading"><h2>Tus personajes</h2><span>{filtered.length} personajes</span></div>
        <div className="character-grid">{filtered.map((c, i) => <article className="character-card" key={c.id}><div className={`portrait portrait-${i % 3}`} aria-hidden="true">{c.name.split(' ').slice(0, 2).map(w => w[0]).join('')}<span>✦</span></div><div className="character-body"><span className="level">BORRADOR · TYRANNY</span><h3>{c.name}</h3><p>{c.ancestry} · {c.heroClass}</p><div className="campaign-label">{c.background} · {c.kit}</div><button onClick={() => chooseCharacter(c)}>Elegir personaje ↗</button></div></article>)}</div>
        {filtered.length === 0 && <div className="empty-state"><h2>{mine.length ? 'No hay coincidencias' : 'Tu historia empieza en blanco'}</h2><p>{mine.length ? 'Prueba otra búsqueda.' : 'No hay personajes en este perfil. Crea el primero para entrar a Tyranny.'}</p>{!mine.length && <button onClick={() => setCreating(true)}>Crear mi personaje</button>}</div>}
      </>}
    </> : page === 'inicio' ? <>
      <div className="eyebrow">TYRANNY · {profile.toLocaleUpperCase('es')}</div><h1>Tu aventura,<br /><em>{selected.name}.</em></h1><p className="intro">Tu personaje está listo como borrador. Su ficha todavía no está validada con las reglas del manual.</p>
      <article className="character-sheet"><div className="section-heading"><h2>{selected.name}</h2><a href="#personajes" className="button">Cambiar personaje</a></div><dl className="detail-grid">{[['Raza / ascendencia', selected.ancestry], ['Fondo', selected.background], ['Clase', selected.heroClass], ['Kit', selected.kit], ['Complicación', selected.complication || 'Sin complicación'], ['Campaña', selected.campaign]].map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl><div className="scores">{characteristicNames.map(key => <div className="score" key={key}><span>{key}</span><strong>{selected.characteristics[key]}</strong></div>)}</div></article>
      <div className="section-heading"><h2>Tu mesa de juego</h2></div><div className="feature-grid">{navigation.slice(1).map(n => <a className="feature-card" href={`#${n.id}`} key={n.id}><span className="feature-icon">{n.icon}</span><h3>{n.label}<span>↗</span></h3><small>{n.id === 'personajes' ? `${mine.length} personajes` : n.id === 'campanas' ? 'Tyranny' : 'Próximamente'}</small></a>)}</div>
    </> : page === 'campanas' ? <><div className="eyebrow">TU CAMPAÑA</div><h1>Tyranny</h1><p className="intro">Has entrado como {profile} con {selected.name}.</p><p className="notice">Tyranny es la única campaña disponible. Las sesiones y la gestión compartida se incorporarán más adelante.</p><button onClick={() => { setCampaign(null); setSelectedId(null) }}>Volver a elegir campaña</button></> : <><div className="eyebrow">CONSTRUYENDO LA AVENTURA</div><h1>{page === 'combate' ? 'Combate' : 'Reglas'}</h1><div className="placeholder"><h2>{page === 'combate' ? 'Prepara tu próximo encuentro.' : 'El manual, junto a tu mesa.'}</h2><p>{page === 'combate' ? 'El tablero, las tiradas y los combates supervisados por el Director se incorporarán en próximas versiones.' : 'El catálogo de creación de las páginas 21–283 está pendiente de importar desde una copia legible del PDF. Las opciones propias de los borradores no son reglas oficiales verificadas.'}</p><a className="button" href="#inicio">Volver a mi personaje</a></div></>}
    <footer>DRAWSTEEL <span>Tyranny · {profile}</span><small>Prototipo local · Datos en este navegador</small></footer>
  </div></main></div>
}
