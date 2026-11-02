import AbilityPicker from './AbilityPicker'
import { trainingError } from './progression'
import type { Training } from './progression'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { characteristicNames } from './characters'
import type { Character, Profile } from './characters'
import { ancestries, careers, classes, kits, stormKits, complications, environments, organizations, upbringings, cultureLanguages } from './rules-catalog'
import type { CatalogOption } from './rules-catalog'
import { characteristicChoices, hasValidKits, hasValidScores } from './creation-rules'

function Source({ option }: { option?: CatalogOption }) {
  return option ? <small className="source-reference">Manual p. {option.bookPage} · PDF completo p. {option.sourcePage}</small> : null
}
function CatalogSelect({ name, label, options, optional = false, value, onChange }: {
  name: string; label: string; options: readonly CatalogOption[]; optional?: boolean; value?: string; onChange?: (value: string) => void
}) {
  const [localValue, setLocalValue] = useState('')
  const selected = value ?? localValue
  return <div><label htmlFor={name}>{label}<select id={name} name={name} required={!optional} value={selected} onChange={e => { setLocalValue(e.target.value); onChange?.(e.target.value) }}><option value="">{optional ? 'Sin complicación' : 'Selecciona una opción…'}</option>{options.map(option => <option key={option.name} value={option.name}>{option.name}</option>)}</select></label><Source option={options.find(option => option.name === selected)} /></div>
}
export default function CharacterCreator({ profile, onSave, onCancel }: {
  profile: Profile; onSave: (character: Character) => void; onCancel: () => void
}) {
  const [heroClass, setHeroClass] = useState('')
  const [training, setTraining] = useState<Training>({ subclasses: [], choices: {} })
  const [kit, setKit] = useState('')
  const [secondKit, setSecondKit] = useState('')
  const [scoreIndex, setScoreIndex] = useState(0)
  const [error, setError] = useState('')
  const classOption = classes.find(c => c.name === heroClass)
  const scoreOptions = characteristicChoices(heroClass)
  const scores = scoreOptions[scoreIndex]
  const kitOptions = heroClass === 'Fury' && training.subclasses[0] === 'Stormwight' ? stormKits : kits
  const effectiveKit = classOption?.kitCount === 0 ? 'Sin kit' : kit
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') ?? '').trim()
    const ancestry = String(form.get('ancestry') ?? '')
    const background = String(form.get('background') ?? '')
    const complication = String(form.get('complication') ?? '')
    if (!name || !ancestries.some(a => a.name === ancestry) || !careers.some(c => c.name === background) || !scores || !hasValidScores(heroClass, scores) || !hasValidKits(heroClass, effectiveKit, secondKit, training.subclasses[0]) || (complication && !complications.some(c => c.name === complication))) {
      setError('Revisa las opciones. El Tactician necesita dos kits diferentes.'); return
    }
    const abilityError = trainingError(heroClass, 1, training)
    if (abilityError) { setError(abilityError); return }
    const culture = { environment: String(form.get('environment')), organization: String(form.get('organization')), upbringing: String(form.get('upbringing')), language: String(form.get('language')) }
    onSave({ id: crypto.randomUUID(), owner: profile, campaign: 'Tyranny', name, ancestry, background, heroClass,
      kit: effectiveKit, ...(secondKit ? { secondKit } : {}), culture, complication, characteristics: scores, rulesVersion: '1.01b', level: 1, training, status: 'draft' })
  }
  return <form className="creator" onSubmit={submit}>
    <div className="section-heading"><h2>Forja tu personaje</h2><button className="secondary" type="button" onClick={onCancel}>Cancelar</button></div>
    <p className="notice">Opciones de Draw Steel Heroes v1.01b, páginas 21–283 del PDF completo. Nombres originales en inglés para consultar el manual. Se validan las características iniciales y el acceso a kits; la ficha sigue siendo un borrador hasta completar rasgos y otras mejoras con el Director. Las habilidades de combate se eligen más abajo.</p>
    <label>Nombre del personaje<input name="name" required maxLength={80} autoFocus /></label>
    <fieldset><legend>Origen y carrera</legend><div className="form-grid"><CatalogSelect name="ancestry" label="Raza / ascendencia" options={ancestries} /><CatalogSelect name="background" label="Fondo: carrera" options={careers} /></div></fieldset>
    <fieldset><legend>Fondo: cultura</legend><p className="intro">El fondo combina carrera y cultura. Elige sus aspectos por separado; no están limitados por tu ascendencia. Idioma cultural adicional a Caelian. Manual pp. 53–57.</p><div className="form-grid">{[
      { name: 'environment', label: 'Entorno', options: environments }, { name: 'organization', label: 'Organización', options: organizations },
      { name: 'upbringing', label: 'Crianza', options: upbringings }, { name: 'language', label: 'Idioma cultural', options: cultureLanguages.filter(language => language !== 'Caelian') },
    ].map(field => <label key={field.name}>{field.label}<select name={field.name} required defaultValue=""><option value="" disabled>Selecciona una opción…</option>{field.options.map(option => <option key={option}>{option}</option>)}</select></label>)}</div></fieldset>
    <fieldset><legend>Clase y kits</legend><div className="form-grid"><CatalogSelect name="heroClass" label="Clase" options={classes} value={heroClass} onChange={value => { setHeroClass(value); setTraining({ subclasses: [], choices: {} }); setScoreIndex(0); setKit(''); setSecondKit(''); setError('') }} />
      {!!classOption?.kitCount && <CatalogSelect name="kit" label={classOption.kitCount === 2 ? 'Primer kit' : 'Kit'} options={kitOptions} value={kit} onChange={value => { setKit(value); if (secondKit === value) setSecondKit('') }} />}
      {classOption?.kitCount === 2 && <CatalogSelect name="secondKit" label="Segundo kit (diferente del primero)" options={kits.filter(option => option.name !== kit)} value={secondKit} onChange={setSecondKit} />}
    </div>{classOption?.kitCount === 0 && <p className="notice">{heroClass} no utiliza kit a nivel 1. Sus opciones de equipo y rasgos de clase se completarán por separado.</p>}{classOption?.kitCount === 2 && <p className="intro">Field Arsenal permite al Tactician dos kits distintos. Sus bonificaciones no se suman automáticamente. Manual p. 177.</p>}</fieldset>
    <AbilityPicker heroClass={heroClass} level={1} value={training} onChange={next => { if (next.subclasses[0] !== training.subclasses[0]) setKit(''); setTraining(next) }} />
    <fieldset><legend>Características iniciales</legend>{classOption && scores ? <>
      <p className="intro">{classOption.fixed.join(' y ')}: 2. Distribuye el resto según los conjuntos permitidos por esta clase. <Source option={classOption} /></p>
      <label>Distribución<select name="scoreDistribution" value={scoreIndex} onChange={e => setScoreIndex(Number(e.target.value))}>{scoreOptions.map((option, index) => <option key={index} value={index}>{characteristicNames.map(key => `${key.slice(0, 3)} ${option[key]}`).join(' · ')}</option>)}</select></label>
      <div className="scores score-summary">{characteristicNames.map(key => <div className="score" key={key}><span>{key}</span><strong>{scores[key]}</strong></div>)}</div>
    </> : <p className="intro">Selecciona una clase para ver sus distribuciones válidas de nivel 1.</p>}</fieldset>
    <fieldset><legend>Complicación</legend><p className="intro">Opcional. Cada complicación tiene un beneficio y una contrapartida: consulta su página y acuerda sus efectos con el Director.</p><CatalogSelect name="complication" label="Complicación" options={complications} optional /></fieldset>
    {error && <p className="error" role="alert">{error}</p>}
    <div className="creator-actions"><span>Tyranny · {profile} · Nivel 1 · Borrador</span><button type="submit">Guardar y elegir personaje ↗</button></div>
  </form>
}
