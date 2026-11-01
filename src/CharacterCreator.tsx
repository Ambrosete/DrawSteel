import { useState } from 'react'
import type { FormEvent } from 'react'
import { characteristicNames } from './characters'
import type { Character, Profile } from './characters'

type CatalogField = 'ancestry' | 'background' | 'heroClass' | 'kit' | 'complication'
const fields: { key: CatalogField; label: string; optional?: boolean }[] = [
  { key: 'ancestry', label: 'Raza / ascendencia' },
  { key: 'background', label: 'Fondo' },
  { key: 'heroClass', label: 'Clase' },
  { key: 'kit', label: 'Kit' },
  { key: 'complication', label: 'Complicación', optional: true },
]

export default function CharacterCreator({ profile, characters, onSave, onCancel }: {
  profile: Profile; characters: Character[]; onSave: (character: Character) => void; onCancel: () => void
}) {
  const [choices, setChoices] = useState<Record<CatalogField, string>>({ ancestry: '__manual', background: '__manual', heroClass: '__manual', kit: '__manual', complication: '' })
  const [error, setError] = useState('')
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const values = Object.fromEntries(fields.map(({ key }) => [key, choices[key] === '__manual' ? String(form.get(`${key}-manual`) ?? '').trim() : choices[key]])) as Record<CatalogField, string>
    const name = String(form.get('name') ?? '').trim()
    if (!name || fields.some(f => !f.optional && !values[f.key])) { setError('Completa el nombre y todas las opciones obligatorias.'); return }
    onSave({ id: crypto.randomUUID(), owner: profile, campaign: 'Tyranny', name, ...values,
      characteristics: Object.fromEntries(characteristicNames.map(key => [key, Number(form.get(key))])) as Character['characteristics'], status: 'draft' })
  }
  return <form className="creator" onSubmit={submit}>
    <div className="section-heading"><h2>Forja tu personaje</h2><button className="secondary" type="button" onClick={onCancel}>Cancelar</button></div>
    <p className="notice">Catálogo del manual pendiente de importar: el PDF adjunto supera el límite de lectura. Puedes guardar un borrador con opciones introducidas por ti o reutilizar las de tus borradores. No se aplican todavía las reglas de creación ni sus restricciones.</p>
    <label>Nombre del personaje<input name="name" required maxLength={80} autoFocus /></label>
    <fieldset><legend>Origen y camino</legend><div className="form-grid">{fields.map(({ key, label, optional }) => {
      const options = [...new Set(characters.map(c => c[key]).filter(Boolean))]
      return <div key={key}><label htmlFor={key}>{label}{optional ? ' (opcional)' : ''}</label>
        <select id={key} name={key} value={choices[key]} onChange={e => setChoices({ ...choices, [key]: e.target.value })}>
          <option disabled>Catálogo oficial pendiente del PDF</option>
          {optional && <option value="">Sin complicación</option>}
          {options.map(option => <option key={option} value={option}>{option} · opción propia</option>)}
          <option value="__manual">Introducir opción propia…</option>
        </select>
        {choices[key] === '__manual' && <label className="manual-label">{label}: opción propia<input name={`${key}-manual`} required maxLength={120} placeholder="Escribe la opción de tu manual" /></label>}
      </div>
    })}</div></fieldset>
    <fieldset><legend>Características</legend><p className="intro">Valores provisionales para el borrador. La distribución permitida por cada clase está pendiente de verificar con el manual.</p><div className="scores">{characteristicNames.map(key => <label key={key}>{key}<select name={key} defaultValue="0">{[-2, -1, 0, 1, 2, 3].map(value => <option key={value} value={value}>{value > 0 ? '+' : ''}{value}</option>)}</select></label>)}</div></fieldset>
    {error && <p role="alert">{error}</p>}
    <div className="creator-actions"><span>Tyranny · {profile} · Borrador</span><button type="submit">Guardar y elegir personaje ↗</button></div>
  </form>
}
