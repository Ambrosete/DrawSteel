import type { Ability } from './ability-catalog'
import { abilitySlots, slotOptions, subclassOptions } from './progression'
import type { Training } from './progression'

export function AbilityDetails({ ability, open = false }: { ability: Ability; open?: boolean }) {
  return <details className="ability-detail" open={open}><summary>{ability.name}<small>{ability.cost ? `${ability.cost} ${ability.resource}` : 'Sin coste'} · Manual p. {ability.bookPage}{ability.subclass ? ` · ${ability.subclass}` : ''}</small></summary><p className="ability-text">{ability.details}</p></details>
}
export default function AbilityPicker({ heroClass, level, value, onChange, locked }: {
  heroClass: string; level: number; value: Training; onChange: (training: Training) => void; locked?: Training
}) {
  const subclasses = subclassOptions[heroClass]
  if (!subclasses) return <p className="notice">Selecciona una clase del manual para ver sus habilidades.</p>
  function setSubclass(index: number, choice: string) {
    const next = [...value.subclasses]
    next[index] = choice
    if (index === 0 && next[1] === choice) next[1] = ''
    onChange({ subclasses: next, choices: {} })
  }
  const used = new Set(Object.values(value.choices))
  return <section className="ability-picker"><h2>Habilidades de {heroClass}</h2><p className="intro">Elecciones hasta nivel {level}. Cada habilidad incluye sus efectos, alcance, objetivos y coste, en el idioma original del manual. La ficha registra las elecciones; el Director supervisa su uso y las demás mejoras de clase.</p>
    <div className="form-grid">{Array.from({ length: heroClass === 'Conduit' ? 2 : 1 }, (_, index) => <label key={index}>{heroClass === 'Conduit' ? `Dominio ${index + 1}` : 'Subclase'}<select name={`subclass-${index}`} required disabled={!!locked} value={value.subclasses[index] ?? ''} onChange={e => setSubclass(index, e.target.value)}><option value="">Selecciona una opción…</option>{subclasses.filter(s => index === 0 || s !== value.subclasses[0]).map(s => <option key={s}>{s}</option>)}</select></label>)}</div>
    {abilitySlots(heroClass, level).map(slot => {
      const options = slotOptions(heroClass, slot, value.subclasses)
      const chosen = options.find(a => a.id === value.choices[slot.id])
      const fixed = !!locked?.choices[slot.id]
      return <fieldset className="ability-slot" key={slot.id}><legend>Nivel {slot.level} · {slot.label}</legend>
        {fixed ? <p className="source-reference">Elección anterior: {chosen?.name ?? 'No disponible'}</p> : <label>Elegir habilidad<select name={`ability-${slot.id}`} required value={chosen?.id ?? ''} onChange={e => onChange({ ...value, choices: { ...value.choices, [slot.id]: e.target.value } })}><option value="">Selecciona una habilidad…</option>{options.map(a => <option key={a.id} value={a.id} disabled={used.has(a.id) && a.id !== chosen?.id}>{a.name} {a.cost ? `(${a.cost} ${a.resource})` : ''}</option>)}</select></label>}
        {chosen && <AbilityDetails ability={chosen} open={!fixed} />}
        {!fixed && <details className="ability-compare"><summary>Consultar todas las opciones ({options.length})</summary>{options.map(a => <AbilityDetails key={a.id} ability={a} />)}</details>}
        {!options.length && <p className="intro">Elige primero tu subclase o dominios para ver las opciones.</p>}
      </fieldset>
    })}
    <p className="local-note">Might = Fuerza · Agility = Agilidad · Reason = Razón · Intuition = Intuición · Presence = Presencia. Resultados de la tirada: ≤11 / 12–16 / ≥17. Las habilidades distintivas de kit aparecen en la ficha al guardar.</p>
  </section>
}
