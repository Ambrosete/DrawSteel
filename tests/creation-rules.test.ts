import test from 'node:test'
import assert from 'node:assert/strict'
import { ancestries, careers, classes, kits, complications, environments, organizations, upbringings } from '../src/rules-catalog.ts'
import { characteristicChoices, hasValidScores, hasValidKits } from '../src/creation-rules.ts'
import { characteristicNames, isCharacter } from '../src/characters.ts'
test('catálogo completo de los encabezados del manual, sin duplicados y con referencias coherentes', () => {
  for (const [options, count] of [[ancestries, 12], [careers, 18], [classes, 9], [kits, 21], [complications, 100]] as const) {
    assert.equal(options.length, count)
    assert.equal(new Set(options.map(option => option.name)).size, count)
    for (const option of options) assert.equal(option.sourcePage, option.bookPage + 15)
  }
  assert.equal(environments.length, 5); assert.equal(organizations.length, 2); assert.equal(upbringings.length, 6)
})
test('todas las clases ofrecen exactamente las permutaciones de sus conjuntos iniciales', () => {
  for (const heroClass of classes) {
    const options = characteristicChoices(heroClass.name)
    assert.equal(options.length, heroClass.fixed.length === 2 ? 9 : 34)
    assert.equal(new Set(options.map(option => JSON.stringify(characteristicNames.map(key => option[key])))).size, options.length)
    for (const option of options) {
      for (const key of heroClass.fixed) assert.equal(option[key], 2)
      assert.equal(hasValidScores(heroClass.name, option), true)
    }
    assert.equal(hasValidScores(heroClass.name, { Fuerza: 2, Agilidad: 2, Razón: 2, Intuición: 2, Presencia: 2 }), false)
  }
  assert.deepEqual(characteristicChoices('Inexistente'), [])
})
test('solo las clases marciales tienen kits y el Tactician necesita dos distintos', () => {
  for (const name of ['Conduit', 'Elementalist', 'Null', 'Talent']) {
    assert.equal(hasValidKits(name, 'Sin kit'), true)
    assert.equal(hasValidKits(name, 'Arcane Archer'), false)
  }
  for (const name of ['Censor', 'Fury', 'Shadow', 'Troubadour']) {
    assert.equal(hasValidKits(name, 'Shining Armor'), true)
    assert.equal(hasValidKits(name, 'Sin kit'), false)
    assert.equal(hasValidKits(name, 'Shining Armor', 'Sniper'), false)
  }
  assert.equal(hasValidKits('Tactician', 'Shining Armor'), false)
  assert.equal(hasValidKits('Tactician', 'Shining Armor', 'Shining Armor'), false)
  assert.equal(hasValidKits('Tactician', 'Shining Armor', 'Sniper'), true)
  assert.equal(hasValidKits('Tactician', 'Inventado', 'Sniper'), false)
})
test('los borradores enriquecidos conservan cultura y segundo kit sin aceptar datos dañados', () => {
  const c = { id: 'test', name: 'Héroe', owner: 'Gabriel', campaign: 'Tyranny', ancestry: 'Human', background: 'Soldier', heroClass: 'Tactician', kit: 'Shining Armor', secondKit: 'Sniper', complication: '', culture: { environment: 'Urban', organization: 'Communal', upbringing: 'Martial', language: 'Vaslorian' }, characteristics: characteristicChoices('Tactician')[0], rulesVersion: '1.01b', status: 'draft' }
  assert.equal(isCharacter(c), true)
  assert.equal(isCharacter({ ...c, culture: { environment: null } }), false)
  assert.equal(isCharacter({ ...c, secondKit: 3 }), false)
})
