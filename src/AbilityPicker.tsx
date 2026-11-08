import { useId } from 'react'
import type { Ability } from './ability-catalog'
import { abilitySlots, slotOptions, subclassOptions } from './progression'
import type { Training } from './progression'
import { formatAbilityText } from './ability-text'
import type { AbilityTextBlock } from './ability-text'

function AbilityText({ blocks }: { blocks: AbilityTextBlock[] }) {
  const body = blocks.filter(block => block.kind !== 'action')
  const targetIndex = body.findIndex(block => block.kind === 'target')
  const distanceIndex = body.findIndex(block => block.kind === 'distance')
  if (targetIndex >= 0 && targetIndex < distanceIndex) {
    const [target] = body.splice(targetIndex, 1)
    body.splice(body.findIndex(block => block.kind === 'distance') + 1, 0, target)
  }
  return <span className="ability-card-text">{body.map((block, index) => block.kind === 'roll'
    ? <span className="ability-roll" role="group" aria-label={block.title} key={index}><span className="ability-roll-title">{block.title}</span>{block.tiers.map((result, tierIndex) => <span className="ability-roll-result" key={tierIndex}><strong className="ability-roll-label">{result.label}</strong><span>{result.text}</span></span>)}</span>
    : block.kind === 'quote'
      ? <span className="ability-flavor" key={index}><em>{block.text}</em></span>
      : block.kind === 'keywords'
        ? <strong className="ability-keywords" key={index}>{block.text}</strong>
        : block.kind === 'distance'
          ? <span className="ability-distance" key={index}><strong>Distance:</strong>{' '}{block.text.replace(/^Distance\s*:\s*/i, '')}</span>
          : block.kind === 'target'
            ? <span className="ability-target" key={index}><strong>Target:</strong>{' '}{block.text.replace(/^x\s+/i, '')}</span>
            : <span className="ability-paragraph" key={index}>{block.text}</span>)}</span>
}

function AbilityCardContent({ ability }: { ability: Ability }) {
  const blocks = formatAbilityText(ability.details)
  const actions = blocks.filter(block => block.kind === 'action')
  return <span className="ability-card-content">{actions.map((block, index) => <strong className="ability-action" key={index}>{'text' in block ? block.text : ''}</strong>)}<span className="ability-card-heading"><span className="ability-card-name">{ability.name}</span><span className="ability-card-cost">{ability.cost ? `${ability.cost} ${ability.resource}` : 'Sin coste'}</span></span><span className="ability-card-meta">{ability.heroClass}{ability.subclass ? ` · ${ability.subclass}` : ''}{ability.kit ? ` · ${ability.kit}` : ''} · Manual p. {ability.bookPage}</span><AbilityText blocks={blocks} /></span>
}
export function AbilityDetails({ ability }: { ability: Ability }) {
  return <article className="ability-card" aria-label={ability.name}><AbilityCardContent ability={ability} /></article>
}
export default function AbilityPicker({ heroClass, level, value, onChange, locked }: {
  heroClass: string; level: number; value: Training; onChange: (training: Training) => void; locked?: Training
}) {
  const pickerId = useId()
  const subclasses = subclassOptions[heroClass]
  if (!subclasses) return <p className="notice">Selecciona una clase del manual para ver sus habilidades.</p>
  function setSubclass(index: number, choice: string) {
    const next = [...value.subclasses]
    next[index] = choice
    if (index === 0 && next[1] === choice) next[1] = ''
    onChange({ subclasses: next, choices: {} })
  }
  const used = new Set(Object.values(value.choices))
  return <section className="ability-picker"><h2>Habilidades de {heroClass}</h2><p className="intro">Todas las opciones están desplegadas en cartas. Pulsa una carta para elegirla; puedes cambiar la selección antes de confirmar. Se conservan las habilidades de niveles anteriores.</p>
    <div className="form-grid">{Array.from({ length: heroClass === 'Conduit' ? 2 : 1 }, (_, index) => <label key={index}>{heroClass === 'Conduit' ? `Dominio ${index + 1}` : 'Subclase'}<select name={`subclass-${index}`} required disabled={!!locked} value={value.subclasses[index] ?? ''} onChange={e => setSubclass(index, e.target.value)}><option value="">Selecciona una opción…</option>{subclasses.filter(s => index === 0 || s !== value.subclasses[0]).map(s => <option key={s}>{s}</option>)}</select></label>)}</div>
    {abilitySlots(heroClass, level).map(slot => {
      const options = slotOptions(heroClass, slot, value.subclasses)
      const chosen = options.find(a => a.id === value.choices[slot.id])
      const fixed = !!locked?.choices[slot.id]
      return <fieldset className={`ability-slot ability-slot-cards${fixed ? ' ability-slot-fixed' : ''}`} key={slot.id}><legend>Nivel {slot.level} · {slot.label}</legend>
        {fixed ? <><p className="source-reference">Elección anterior · Se conserva</p>{chosen ? <AbilityDetails ability={chosen} /> : <p className="notice">La habilidad guardada no está disponible en el catálogo.</p>}</> : <>
          <p className="ability-selection-status" role="status">{chosen ? `Seleccionada: ${chosen.name}` : 'Elige una de estas cartas'}</p>
          <div className="ability-card-grid">{options.map(ability => {
            const selected = chosen?.id === ability.id
            const unavailable = used.has(ability.id) && !selected
            return <label className={`ability-choice${selected ? ' is-selected' : ''}${unavailable ? ' is-unavailable' : ''}`} key={ability.id}>
              <span className="ability-card-selection"><input type="radio" name={`${pickerId}-${slot.id}`} value={ability.id} required checked={selected} disabled={unavailable} aria-label={ability.name} onChange={() => onChange({ ...value, choices: { ...value.choices, [slot.id]: ability.id } })} /><span>{selected ? '✓ Seleccionada' : unavailable ? 'Ya elegida en otra elección' : 'Elegir esta carta'}</span></span>
              <AbilityCardContent ability={ability} />
            </label>
          })}</div>
          {!options.length && <p className="intro">Elige primero tu subclase o dominios para ver las opciones.</p>}
        </>}
      </fieldset>
    })}
    <p className="local-note">Might = Fuerza · Agility = Agilidad · Reason = Razón · Intuition = Intuición · Presence = Presencia. Resultados de la tirada: ≤11 / 12–16 / ≥17. Las habilidades distintivas de kit aparecen en la ficha al guardar.</p>
  </section>
}
