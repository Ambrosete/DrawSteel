import test from 'node:test'
import assert from 'node:assert/strict'
import { canEnter, charactersFor, parseCharacters, profiles, isCharacter } from '../src/characters.ts'
import type { Character } from '../src/characters.ts'
const character: Character = { id: 'test', owner: 'Gabriel', campaign: 'Tyranny', name: 'Héroe', ancestry: 'Propia', background: 'Propio', heroClass: 'Propia', kit: 'Propio', complication: '', characteristics: { Fuerza: 2, Agilidad: 1, Razón: 0, Intuición: 0, Presencia: -1 }, status: 'draft' }
test('Gabriel necesita la contraseña exacta; los demás perfiles no', () => {
  assert.equal(canEnter('Gabriel', ''), false)
  assert.equal(canEnter('Gabriel', '12345'), false)
  assert.equal(canEnter('Gabriel', '1234'), true)
  for (const profile of profiles.filter(p => p !== 'Gabriel')) assert.equal(canEnter(profile, ''), true)
})
test('no se generan personajes ni se importan registros antiguos', () => {
  assert.deepEqual(parseCharacters(null), [])
  assert.deepEqual(parseCharacters('{broken'), [])
  assert.deepEqual(parseCharacters(JSON.stringify([{ id: '1', name: 'Kael', ancestry: 'Humano', heroClass: 'Furia', level: 1, campaign: 'Las tierras del ocaso' }])), [])
})
test('los borradores se recuperan y los registros corruptos se descartan individualmente', () => {
  assert.deepEqual(parseCharacters(JSON.stringify([character, { ...character, campaign: 'Otra' }, { ...character, owner: 'Desconocido' }])), [character])
  assert.equal(isCharacter({ ...character, characteristics: { ...character.characteristics, Fuerza: 999 } }), false)
})
test('cada perfil ve solamente sus personajes de Tyranny', () => {
  const david: Character = { ...character, id: 'david', owner: 'David' }
  assert.deepEqual(charactersFor([character, david], 'Gabriel'), [character])
  assert.deepEqual(charactersFor([character, david], 'David'), [david])
  assert.deepEqual(charactersFor([character, david], 'Mateo'), [])
})
