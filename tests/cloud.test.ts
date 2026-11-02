import test from 'node:test'
import assert from 'node:assert/strict'
import { assertRevision, isSharedCharacter } from '../src/cloud-model.ts'
const character = {
  id: 'hero', owner: 'David', campaign: 'campaign-a', revision: 1,
  name: 'Luna', ancestry: 'Human', background: 'Artisan', heroClass: 'Fury', kit: 'Warrior', complication: '',
  characteristics: { Fuerza: 2, Agilidad: 1, Razón: 0, Intuición: 0, Presencia: -1 }, status: 'draft',
}
test('las fichas compartidas aceptan perfiles sin cuentas y respetan su campaña', () => {
  assert.equal(isSharedCharacter(character, 'campaign-a'), true)
  assert.equal(isSharedCharacter(character, 'campaign-b'), false)
  assert.equal(isSharedCharacter({ ...character, owner: '' }, 'campaign-a'), false)
})
test('las fichas compartidas conservan la validación de características y progresión', () => {
  for (const revision of [undefined, 0, -1, 1.5, '1']) assert.equal(isSharedCharacter({ ...character, revision }, 'campaign-a'), false)
  assert.equal(isSharedCharacter({ ...character, level: 11 }, 'campaign-a'), false)
  assert.equal(isSharedCharacter({ ...character, training: { subclasses: [], choices: { one: 12 } } }, 'campaign-a'), false)
  assert.equal(isSharedCharacter({ ...character, characteristics: { ...character.characteristics, Fuerza: 100 } }, 'campaign-a'), false)
})
test('un guardado obsoleto falla en vez de sobrescribir una versión más reciente', () => {
  assert.doesNotThrow(() => assertRevision(2, 2))
  assert.throws(() => assertRevision(3, 2), /Otra persona ha actualizado/)
})
