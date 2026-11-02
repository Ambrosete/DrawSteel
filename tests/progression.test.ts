import test from 'node:test'
import assert from 'node:assert/strict'
import { abilities } from '../src/ability-catalog.ts'
import { abilitySlots, slotOptions, subclassOptions, trainingError, advanceCharacter, chosenAbilities, removeOwnedCharacter } from '../src/progression.ts'
import type { Training } from '../src/progression.ts'
import { characteristicChoices } from '../src/creation-rules.ts'
import { parseCharacters } from '../src/characters.ts'
import type { Character } from '../src/characters.ts'
function fill(heroClass: string, level: number, subclasses: string[], previous: Training = { subclasses, choices: {} }): Training {
  const choices = { ...previous.choices }
  for (const slot of abilitySlots(heroClass, level)) {
    if (!choices[slot.id]) {
      const option = slotOptions(heroClass, slot, subclasses).find(a => !Object.values(choices).includes(a.id))
      assert.ok(option, `${heroClass}/${subclasses.join(',')} nivel ${level}: ${slot.id}`)
      choices[slot.id] = option.id
    }
  }
  return { subclasses, choices }
}
function base(heroClass = 'Censor'): Character {
  return { id: 'one', owner: 'David', campaign: 'Tyranny', name: 'Prueba', ancestry: 'Human', background: 'Soldier', heroClass, kit: 'Shining Armor', complication: '', characteristics: characteristicChoices(heroClass)[0], status: 'draft' }
}
test('427 habilidades con detalle, referencias e identificadores únicos; incluyen 25 kits', () => {
  assert.equal(abilities.length, 427)
  assert.equal(new Set(abilities.map(a => a.id)).size, abilities.length)
  assert.equal(abilities.filter(a => a.kind === 'kit').length, 25)
  for (const a of abilities) {
    assert.ok(a.details.length > 80, a.name)
    assert.ok(a.bookPage >= 79 && a.bookPage <= 224)
    if (a.kind === 'subclass') assert.ok(subclassOptions[a.heroClass].includes(a.subclass!), `${a.heroClass}: ${a.name}`)
    if (a.kind === 'kit') assert.ok(a.kit, a.name)
  }
  const war = abilities.find(a => a.name === 'Blade of the Heavens')!
  assert.equal(war.subclass, 'War'); assert.equal(war.level, 6)
})
test('todas las subclases de las nueve clases permiten avanzar del nivel 1 al 10', () => {
  for (const [heroClass, subclasses] of Object.entries(subclassOptions)) for (const subclass of subclasses) {
    const selected = heroClass === 'Conduit' ? [subclass, subclasses.find(s => s !== subclass)!] : [subclass]
    let training: Training = { subclasses: selected, choices: {} }
    for (let level = 1; level <= 10; level++) {
      training = fill(heroClass, level, selected, training)
      assert.equal(trainingError(heroClass, level, training), null)
    }
  }
})
test('se rechazan habilidades repetidas, futuras, de otra clase o subclase y dominios iguales', () => {
  const initial = fill('Censor', 1, ['Exorcist'])
  const duplicate = { ...initial, choices: { ...initial.choices, 'heroic-1-5': initial.choices['heroic-1-3'] } }
  assert.ok(trainingError('Censor', 1, duplicate))
  const future = abilities.find(a => a.heroClass === 'Censor' && a.level === 8)!
  assert.ok(trainingError('Censor', 1, { ...initial, choices: { ...initial.choices, 'heroic-1-5': future.id } }))
  assert.ok(trainingError('Fury', 1, initial))
  const advanced = fill('Censor', 2, ['Exorcist'])
  assert.ok(trainingError('Censor', 2, { ...advanced, subclasses: ['Paragon'] }))
  assert.ok(trainingError('Conduit', 1, { subclasses: ['War', 'War'], choices: {} }))
})
test('subir nivel conserva elecciones y aplica los aumentos de características en 4, 7 y 10', () => {
  let c = base()
  for (let level = 1; level <= 10; level++) {
    const training = fill('Censor', level, ['Exorcist'], c.training)
    c = advanceCharacter(c, level, training)
    assert.equal(c.level, level)
    assert.equal(c.characteristics.Fuerza, level < 4 ? 2 : level < 7 ? 3 : level < 10 ? 4 : 5)
    assert.equal(c.characteristics.Presencia, c.characteristics.Fuerza)
  }
  assert.throws(() => advanceCharacter(c, 11, c.training!))
  assert.equal(parseCharacters(JSON.stringify([c])).length, 1)
})
test('Conduit requiere elegir su característica adicional y no permite saltar niveles', () => {
  let c = base('Conduit')
  for (let level = 1; level <= 3; level++) c = advanceCharacter(c, level, fill('Conduit', level, ['War', 'Life'], c.training))
  const training = fill('Conduit', 4, ['War', 'Life'], c.training)
  assert.throws(() => advanceCharacter(c, 4, training))
  assert.throws(() => advanceCharacter(c, 4, training, 'Intuición'))
  const next = advanceCharacter(c, 4, training, 'Fuerza')
  assert.equal(next.characteristics.Intuición, 3)
  assert.equal(next.characteristics.Fuerza, c.characteristics.Fuerza + 1)
  assert.throws(() => advanceCharacter(c, 5, training))
})
test('las habilidades de kit se adjuntan sin consumir elecciones de clase', () => {
  const c = { ...base('Tactician'), secondKit: 'Sniper' }
  const list = chosenAbilities(c)
  assert.equal(list.length, 2)
  assert.ok(list.every(a => a.kind === 'kit'))
})
test('completar un borrador antiguo conserva los campos y eliminar respeta propietario y campaña', () => {
  const old = base()
  const enriched = advanceCharacter(old, 1, fill('Censor', 1, ['Oracle']))
  assert.equal(enriched.name, old.name); assert.equal(enriched.kit, old.kit)
  const other = { ...old, id: 'other', owner: 'Gabriel' as const }
  assert.deepEqual(removeOwnedCharacter([old, other], 'one', 'Gabriel'), [old, other])
  assert.deepEqual(removeOwnedCharacter([old, other], 'one', 'David'), [other])
  assert.deepEqual(removeOwnedCharacter([old, other], 'other', 'David'), [old, other])
})

test('un borrador Fury que elige Stormwight requiere un kit especial', () => {
  const c = base('Fury')
  const training = fill('Fury', 1, ['Stormwight'])
  assert.throws(() => advanceCharacter(c, 1, training))
  const updated = advanceCharacter({ ...c, kit: 'Boren' }, 1, training)
  assert.equal(updated.kit, 'Boren')
  assert.ok(chosenAbilities(updated).some(a => a.name === 'Bear Claws'))
})
