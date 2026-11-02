import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Character, Characteristic } from './characters'
import { characteristicNames } from './characters'
import { classes, stormKits } from './rules-catalog'
import { advanceCharacter, needsBonusCharacteristic } from './progression'
import type { Training } from './progression'
import AbilityPicker from './AbilityPicker'

export default function CharacterProgression({ character, targetLevel, onSave, onCancel }: {
  character: Character; targetLevel: number; onSave: (updated: Character) => void; onCancel: () => void
}) {
  const [training, setTraining] = useState<Training>(character.training ?? { subclasses: [], choices: {} })
  const [stormKit, setStormKit] = useState(stormKits.some(kit => kit.name === character.kit) ? character.kit : '')
  const [error, setError] = useState('')
  const currentLevel = character.level ?? 1
  const advancing = targetLevel > currentLevel
  const fixed: readonly string[] = classes.find(c => c.name === character.heroClass)?.fixed ?? []
  const needsBonus = advancing && needsBonusCharacteristic(character.heroClass, targetLevel)
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      const bonus = new FormData(event.currentTarget).get('bonusCharacteristic')
      const prepared = !character.training && character.heroClass === 'Fury' && training.subclasses[0] === 'Stormwight' ? { ...character, kit: stormKit, secondKit: undefined } : character
      const updated = advanceCharacter(prepared, targetLevel, training, bonus ? String(bonus) as Characteristic : undefined)
      onSave(updated)
    } catch (e) { setError(e instanceof Error ? e.message : 'Revisa las elecciones.') }
  }
  return <form className="creator" onSubmit={submit}><div className="section-heading"><h2>{advancing ? `Subir a nivel ${targetLevel}` : 'Completar habilidades'} · {character.name}</h2><button type="button" className="secondary" onClick={onCancel}>Cancelar</button></div>
    <p className="notice">{advancing ? 'Confirma con el Director que has alcanzado la experiencia o el hito necesario. Se conservan tus elecciones anteriores y se añaden las correspondientes a este nivel.' : 'Este personaje se creó antes del selector de habilidades. Completa sus elecciones sin perder los demás datos.'} Las ventajas, habilidades de pruebas y rasgos pasivos adicionales se revisan con el manual; esta pantalla registra las habilidades de combate elegidas.</p>
    {advancing && [4, 7, 10].includes(targetLevel) && <p className="notice">Se aplicará el aumento de características de nivel {targetLevel} al confirmar.</p>}
    {needsBonus && <label>Característica adicional que aumenta en 1<select name="bonusCharacteristic" required defaultValue=""><option value="">Selecciona una característica…</option>{characteristicNames.filter(key => !fixed.includes(key) && character.characteristics[key] < (targetLevel === 4 ? 3 : 5)).map(key => <option key={key}>{key}</option>)}</select></label>}
    <AbilityPicker heroClass={character.heroClass} level={targetLevel} value={training} onChange={setTraining} locked={character.training} />
    {!character.training && character.heroClass === 'Fury' && training.subclasses[0] === 'Stormwight' && <label>Kit de Stormwight<select name="stormKit" required value={stormKit} onChange={e => setStormKit(e.target.value)}><option value="">Selecciona un kit…</option>{stormKits.map(kit => <option key={kit.name}>{kit.name}</option>)}</select></label>}
    {error && <p className="error" role="alert">{error}</p>}
    <div className="creator-actions"><span>Los cambios se guardan al confirmar.</span><button type="submit">{advancing ? `Confirmar nivel ${targetLevel}` : 'Guardar habilidades'}</button></div>
  </form>
}
