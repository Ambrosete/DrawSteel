import { useState } from 'react'
import { AbilityDetails } from './AbilityPicker'
import { chosenAbilities } from './progression'
import type { Character } from './characters'
import type { CounterOperation } from './combat-counter'

export default function CombatPanel({ character, reconnecting = false, onCounterChange }: {
  character: Character; reconnecting?: boolean; onCounterChange: (operation: CounterOperation) => Promise<void>
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const abilities = chosenAbilities(character)
  async function change(operation: CounterOperation) {
    if (busy || reconnecting) return
    setBusy(true); setError('')
    try { await onCounterChange(operation) }
    catch (e) { setError((e as { code?: string })?.code === 'permission-denied'
      ? 'Publica las reglas actualizadas de Firestore para guardar el contador de combate.'
      : e instanceof Error ? e.message : 'No se ha podido guardar el contador. Vuelve a intentarlo.') }
    finally { setBusy(false) }
  }
  return <section aria-labelledby="combat-title"><h1 id="combat-title">Combate</h1><p className="intro">{character.name} · {character.heroClass} · Nivel {character.level ?? 1}</p>
    <section className="combat-counter character-sheet" aria-labelledby="counter-title" aria-busy={busy}><h2 id="counter-title">Contador de combate</h2><output className="combat-counter-value" aria-live="polite" aria-label={`Contador de ${character.name}`}>{character.combatCounter ?? 0}</output>
      <div className="combat-counter-actions"><button type="button" className="secondary" disabled={busy || reconnecting} aria-label="Restar 1 al contador" onClick={() => { void change('decrement') }}>− Restar</button><button type="button" disabled={busy || reconnecting} aria-label="Sumar 1 al contador" onClick={() => { void change('increment') }}>+ Sumar</button><button type="button" className="secondary" disabled={busy || reconnecting} onClick={() => { void change('reset') }}>Resetear a cero</button></div>
      {error && <p role="alert" className="error">{error}</p>}{busy && <p role="status">Guardando contador…</p>}
    </section>
    <div className="section-heading"><h2>Habilidades de {character.name}</h2><span>{abilities.length} habilidades</span></div>
    {abilities.length ? <div className="ability-card-grid">{abilities.map(ability => <AbilityDetails key={ability.id} ability={ability} />)}</div> : <p className="notice">Este personaje todavía no tiene habilidades registradas en el catálogo. Completa sus elecciones desde su ficha.</p>}
  </section>
}
