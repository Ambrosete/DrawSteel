import { abilities } from './ability-catalog.ts'
import type { Ability } from './ability-catalog.ts'
import { hasValidKits } from './creation-rules.ts'
import { classes } from './rules-catalog.ts'
import { characteristicNames } from './characters.ts'
import type { Character, Characteristic } from './characters.ts'
export type Training = { subclasses: string[]; choices: Record<string, string> }
export const subclassOptions: Record<string, readonly string[]> = {
  Censor: ['Exorcist', 'Oracle', 'Paragon'], Conduit: ['Creation', 'Death', 'Fate', 'Knowledge', 'Life', 'Love', 'Nature', 'Protection', 'Storm', 'Sun', 'Trickery', 'War'],
  Elementalist: ['Earth', 'Fire', 'Green', 'Void'], Fury: ['Berserker', 'Reaver', 'Stormwight'], Null: ['Chronokinetic', 'Cryokinetic', 'Metakinetic'],
  Shadow: ['Black Ash', 'Caustic Alchemy', 'Harlequin Mask'], Tactician: ['Insurgent', 'Mastermind', 'Vanguard'], Talent: ['Chronopathy', 'Telekinesis', 'Telepathy'], Troubadour: ['Auteur', 'Duelist', 'Virtuoso'],
}
export type AbilitySlot = { id: string; level: number; kind: string; cost: number; label: string }
export function abilitySlots(heroClass: string, level: number): AbilitySlot[] {
  if (!subclassOptions[heroClass] || !Number.isInteger(level) || level < 1 || level > 10) return []
  const slots: AbilitySlot[] = []
  const signatureCount = heroClass === 'Tactician' ? 0 : ['Conduit', 'Elementalist', 'Null', 'Talent'].includes(heroClass) ? 2 : 1
  for (let i = 1; i <= signatureCount; i++) slots.push({ id: `signature-${i}`, level: 1, kind: 'signature', cost: 0, label: `Habilidad distintiva ${i}` })
  for (const [unlock, cost] of [[1, 3], [1, 5], [3, 7], [5, 9], [8, 11]]) {
    if (unlock <= level) slots.push({ id: `heroic-${unlock}-${cost}`, level: unlock, kind: 'heroic', cost, label: `Habilidad heroica · coste ${cost}` })
  }
  for (const [unlock, cost] of [[2, 5], [6, 9], [9, 11]]) {
    if (unlock <= level) slots.push({ id: `special-${unlock}`, level: unlock, kind: heroClass === 'Elementalist' ? 'heroic' : 'subclass', cost, label: heroClass === 'Elementalist' ? `Habilidad adicional · coste ${cost}` : `Habilidad de subclase · coste ${cost}` })
  }
  return slots.sort((a, b) => a.level - b.level)
}
export function slotOptions(heroClass: string, slot: AbilitySlot, subclasses: readonly string[]): Ability[] {
  return abilities.filter(a => a.heroClass === heroClass && a.kind === slot.kind && a.cost === slot.cost && a.level <= slot.level
    && (a.kind !== 'subclass' || (a.level === slot.level && !!a.subclass && subclasses.includes(a.subclass))))
}
export function trainingError(heroClass: string, level: number, training: Training): string | null {
  const options = subclassOptions[heroClass]
  if (!options) return 'La clase de este borrador no coincide con una clase del manual.'
  if (training.subclasses.length !== (heroClass === 'Conduit' ? 2 : 1) || new Set(training.subclasses).size !== training.subclasses.length || training.subclasses.some(s => !options.includes(s))) return 'Selecciona una subclase válida; Conduit necesita dos dominios diferentes.'
  const slots = abilitySlots(heroClass, level)
  if (!slots.length) return 'El nivel debe estar entre 1 y 10.'
  const selected = Object.values(training.choices)
  if (selected.length !== slots.length || new Set(selected).size !== selected.length) return 'Completa todas las habilidades sin repetir elecciones.'
  for (const slot of slots) if (!slotOptions(heroClass, slot, training.subclasses).some(a => a.id === training.choices[slot.id])) return `Revisa ${slot.label} de nivel ${slot.level}.`
  return null
}
export function chosenAbilities(character: Character): Ability[] {
  const selected = Object.values(character.training?.choices ?? {})
  return abilities.filter(a => selected.includes(a.id) || (a.kind === 'kit' && [character.kit, character.secondKit].includes(a.kit ?? '')))
}
export function needsBonusCharacteristic(heroClass: string, targetLevel: number): boolean {
  return [4, 10].includes(targetLevel) && classes.find(c => c.name === heroClass)?.fixed.length === 1
}
export function advanceCharacter(character: Character, targetLevel: number, training: Training, bonus?: Characteristic): Character {
  const currentLevel = character.level ?? 1
  if (targetLevel !== currentLevel && targetLevel !== currentLevel + 1) throw new Error('Solo puedes avanzar un nivel cada vez.')
  const error = trainingError(character.heroClass, targetLevel, training)
  if (error) throw new Error(error)
  if (character.heroClass === 'Fury' && training.subclasses[0] === 'Stormwight' && !hasValidKits('Fury', character.kit, character.secondKit, 'Stormwight')) throw new Error('Stormwight necesita uno de sus cuatro kits especiales.')
  if (character.training) {
    if (JSON.stringify(character.training.subclasses) !== JSON.stringify(training.subclasses)) throw new Error('La subida de nivel conserva la subclase.')
    for (const [slot, id] of Object.entries(character.training.choices)) if (training.choices[slot] !== id) throw new Error('La subida de nivel conserva las habilidades anteriores.')
  }
  const scores = { ...character.characteristics }
  const fixed: readonly Characteristic[] = classes.find(c => c.name === character.heroClass)?.fixed ?? []
  if (targetLevel > currentLevel) {
    if ([4, 10].includes(targetLevel)) {
      const limit = targetLevel === 4 ? 3 : 5
      for (const key of fixed) scores[key] = limit
      if (needsBonusCharacteristic(character.heroClass, targetLevel)) {
        if (!bonus || !characteristicNames.includes(bonus) || fixed.includes(bonus) || scores[bonus] >= limit) throw new Error('Elige otra característica para aumentar en 1.')
        scores[bonus]++
      }
    }
    if (targetLevel === 7) for (const key of characteristicNames) scores[key] = Math.min(scores[key] + 1, 4)
  }
  return { ...character, level: targetLevel, training, characteristics: scores }
}
export function removeOwnedCharacter(characters: Character[], id: string, owner: string): Character[] {
  return characters.filter(c => !(c.id === id && c.owner === owner && c.campaign === 'Tyranny'))
}
