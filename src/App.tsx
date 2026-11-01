import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

type Page = 'inicio' | 'personajes' | 'campanas' | 'combate' | 'reglas'
type Character = { id: string; name: string; ancestry: string; heroClass: string; level: number; campaign: string }
const navigation: { id: Page; label: string; icon: string }[] = [
  { id: 'inicio', label: 'Inicio', icon: '◇' }, { id: 'personajes', label: 'Personajes', icon: '♙' },
  { id: 'campanas', label: 'Campañas', icon: '⚑' }, { id: 'combate', label: 'Combate', icon: '⚔' }, { id: 'reglas', label: 'Reglas', icon: '▤' },
]
const examples: Character[] = [
  { id: '1', name: 'Kael de la Ceniza', ancestry: 'Humano', heroClass: 'Furia', level: 1, campaign: 'Las tierras del ocaso' },
  { id: '2', name: 'Lyra Viento de Plata', ancestry: 'Elfo', heroClass: 'Sombra', level: 2, campaign: 'Las tierras del ocaso' },
  { id: '3', name: 'Brom Escudo de Hierro', ancestry: 'Enano', heroClass: 'Táctico', level: 1, campaign: 'Sin campaña' },
]
const storageKey = 'drawsteel.characters.v1'
function loadCharacters(): Character[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(storageKey) ?? 'null')
    if (Array.isArray(data) && data.every(c => c && typeof c.id === 'string' && typeof c.name === 'string' && typeof c.ancestry === 'string' && typeof c.heroClass === 'string' && typeof c.campaign === 'string' && Number.isInteger(c.level) && c.level >= 1 && c.level <= 10)) return data
  } catch { /* Los datos de ejemplo permiten continuar si el almacenamiento no está disponible. */ }
  return examples
}
function currentPage(): Page { return navigation.find(n => n.id === location.hash.slice(1))?.id ?? 'inicio' }

export default function App() {
  const [page, setPage] = useState<Page>(currentPage)
  const [characters, setCharacters] = useState<Character[]>(loadCharacters)
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [storageError, setStorageError] = useState(false)
  useEffect(() => { const update = () => setPage(currentPage()); window.addEventListener('hashchange', update); return () => window.removeEventListener('hashchange', update) }, [])
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(characters)); setStorageError(false) } catch { setStorageError(true) } }, [characters])
  function createCharacter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = String(data.get('name') ?? '').trim()
    const ancestry = String(data.get('ancestry') ?? '').trim()
    if (!name || !ancestry) return
    setCharacters(previous => [...previous, { id: crypto.randomUUID(), name, ancestry, heroClass: String(data.get('heroClass')), level: 1, campaign: 'Sin campaña' }])
    setCreating(false)
    setQuery('')
  }
  const filtered = characters.filter(c => `${c.name} ${c.heroClass} ${c.ancestry}`.toLocaleLowerCase('es').includes(query.toLocaleLowerCase('es')))
  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#inicio"><span className="brand-symbol">⚔</span><span>DRAW<span className="gold">STEEL</span><small>TU MESA DE AVENTURAS</small></span></a>
      <p className="nav-heading">ESPACIO DE JUEGO</p>
      <nav aria-label="Navegación principal">{navigation.map(n => <a key={n.id} href={`#${n.id}`} className={page === n.id ? 'active' : ''} aria-current={page === n.id ? 'page' : undefined}><span aria-hidden="true">{n.icon}</span>{n.label}</a>)}</nav>
      <div className="sidebar-note"><span className="status-dot" />Tu próxima historia empieza aquí.<small>Prototipo · Datos guardados en este navegador</small></div>
    </aside>
    <main>
      <header className="topbar"><span>Tu espacio de juego <span className="breadcrumb">/ {navigation.find(n => n.id === page)?.label}</span></span><span className="profile">AV <span>Aventurero</span></span></header>
      <div className="content">
        {storageError && <p role="status" className="notice">No se pueden guardar los cambios en este navegador. Se conservarán solo durante esta sesión.</p>}
        {page === 'inicio' && <>
          <div className="eyebrow">EL SIGUIENTE CAPÍTULO TE ESPERA</div>
          <h1>Las grandes historias<br />se construyen <em>juntos.</em></h1>
          <p className="intro">Reúne a tus héroes, prepara tu campaña y lleva la aventura a tu mesa.<br />Todo empieza con una buena historia. La tuya.</p>
          <div className="hero-banner"><div><span className="eyebrow">TU AVENTURA, EN UN SOLO LUGAR</span><h2>Prepara tu próximo héroe.</h2><p>Dale un nombre. Encuentra su camino.<br />El resto está por escribir.</p><a className="button" href="#personajes">Explorar personajes <span>↗</span></a></div><div className="hero-art" aria-hidden="true"><span>✦</span><div className="sword">⚔</div><small>FORJA TU LEYENDA</small></div></div>
          <div className="section-heading"><h2>Tu mesa, a un paso</h2><span>Un lugar para cada parte de la aventura</span></div>
          <div className="feature-grid">{navigation.slice(1).map((n, i) => <a className="feature-card" href={`#${n.id}`} key={n.id}><span className="feature-icon">{n.icon}</span><h3>{n.label}<span>↗</span></h3><p>{['Crea héroes y reúne a tus protagonistas.', 'El punto de encuentro de tus próximas historias.', 'Prepara el terreno para tus enfrentamientos.', 'Organiza las referencias de tu mesa.'][i]}</p><small>{i === 0 ? `${characters.length} personajes disponibles` : 'Próximamente'}</small></a>)}</div>
          <div className="bottom-note"><span>✧</span><p><strong>La aventura es mejor en compañía.</strong><br />Esta es la primera versión de tu futura mesa de Draw Steel.</p></div>
        </>}
        {page === 'personajes' && <>
          <div className="eyebrow">LOS PROTAGONISTAS DE TU HISTORIA</div><div className="page-heading"><div><h1>Personajes</h1><p className="intro">Reúne a tus héroes y empieza a dar forma a su aventura.</p></div><button onClick={() => setCreating(!creating)}>{creating ? 'Cancelar' : '+ Nuevo personaje'}</button></div>
          <p className="notice">Datos de ejemplo editables. Los personajes se guardan en este navegador. La ficha completa y la progresión llegarán en próximas versiones.</p>
          {creating && <form className="character-form" onSubmit={createCharacter}><h2>Un nuevo comienzo</h2><label>Nombre<input name="name" required maxLength={80} autoFocus /></label><label>Ascendencia<input name="ancestry" required maxLength={60} placeholder="Ej. Humano" /></label><label>Clase<select name="heroClass">{['Furia', 'Sombra', 'Táctico', 'Censor', 'Conducto', 'Elemento', 'Talento', 'Trovador', 'Nulo'].map(c => <option key={c}>{c}</option>)}</select></label><button type="submit">Crear personaje de nivel 1</button></form>}
          <label className="search-label">Buscar personajes<input type="search" placeholder="Busca por nombre, clase o ascendencia…" value={query} onChange={e => setQuery(e.target.value)} /></label>
          <div className="section-heading"><h2>Tus héroes</h2><span>{filtered.length} personajes</span></div>
          <div className="character-grid">{filtered.map((c, i) => <article className="character-card" key={c.id}><div className={`portrait portrait-${i % 3}`} aria-hidden="true">{c.name.split(' ').slice(0, 2).map(w => w[0]).join('')}<span>✦</span></div><div className="character-body"><span className="level">NIVEL {c.level}</span><h3>{c.name}</h3><p>{c.ancestry} · {c.heroClass}</p><div className="campaign-label">⚑ {c.campaign}</div></div></article>)}</div>
          {filtered.length === 0 && <p className="empty-state">No hay personajes que coincidan con tu búsqueda.</p>}
        </>}
        {page === 'campanas' && <Placeholder title="Campañas" icon="⚑" description="Cada mesa tiene una historia que contar." details="Aquí podrás crear campañas, reunir a los jugadores y organizar las sesiones. La gestión de campañas todavía no está disponible." />}
        {page === 'combate' && <Placeholder title="Combate" icon="⚔" description="El escenario de tus próximos encuentros." details="El tablero interactivo, las tiradas y los combates semiautomáticos supervisados por el Director se implementarán en próximas versiones." />}
        {page === 'reglas' && <Placeholder title="Reglas" icon="▤" description="Más tiempo jugando, menos tiempo buscando." details="Este espacio reunirá referencias y ayudas de juego. Todavía no incluye reglas oficiales ni validación de personajes conforme al sistema Draw Steel." />}
        <footer>DRAWSTEEL <span>Una mesa. Infinitas historias.</span><small>Proyecto de aficionados · Prototipo inicial</small></footer>
      </div>
    </main>
  </div>
}
function Placeholder({ title, icon, description, details }: { title: string; icon: string; description: string; details: string }) {
  return <><div className="eyebrow">CONSTRUYENDO LA AVENTURA</div><h1>{title}</h1><div className="placeholder"><span aria-hidden="true">{icon}</span><h2>{description}</h2><p>{details}</p><a className="button" href="#personajes">Ir a personajes ↗</a></div></>
}
