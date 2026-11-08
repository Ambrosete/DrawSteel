import test from 'node:test'
import assert from 'node:assert/strict'
import { recoveryMaximum, recoveriesRemaining, nextRecoveriesSpent } from '../src/recoveries.ts'
import { isCharacter, parseCharacters } from '../src/characters.ts'
import type { Character } from '../src/characters.ts'

const hero: Character = {
  id: 'hero', owner: 'David', campaign: 'Tyranny', name: 'Héroe', ancestry: 'Human',
  background: 'Artisan', heroClass: 'Fury', kit: 'Warrior', complication: '',
  characteristics: { Fuerza: 2, Agilidad: 2, Razón: -1, Intuición: 1, Presencia: 1 }, status: 'draft',
}

test('las nueve clases mantienen las recoveries del manual del nivel 1 al 10', () => {
  for (const [heroClass, expected] of Object.entries({ Censor: 12, Conduit: 8, Elementalist: 8, Fury: 10, Null: 8, Shadow: 8, Tactician: 10, Talent: 8, Troubadour: 8 })) {
    for (let level = 1; level <= 10; level++) {
      assert.equal(recoveryMaximum({ ...hero, heroClass, level }), expected, `${heroClass}, nivel ${level}`)
    }
  }
  assert.equal(recoveriesRemaining(hero), 10)
  for (const heroClass of ['Clase propia', 'constructor', 'toString']) assert.equal(recoveryMaximum({ ...hero, heroClass }), null)
})

test('Master of Green suma dos a nivel 10 y conserva las recoveries ya gastadas', () => {
  const green = { ...hero, heroClass: 'Elementalist', recoveriesSpent: 3, training: { subclasses: ['Green'], choices: {} } }
  assert.equal(recoveryMaximum({ ...green, level: 9 }), 8)
  assert.equal(recoveryMaximum({ ...green, level: 10 }), 10)
  assert.equal(recoveriesRemaining({ ...green, level: 9 }), 5)
  assert.equal(recoveriesRemaining({ ...green, level: 10 }), 7)
  assert.equal(recoveryMaximum({ ...green, level: 10, training: { subclasses: ['Fire'], choices: {} } }), 8)
  assert.equal(recoveryMaximum({ ...green, heroClass: 'Conduit', level: 10 }), 8)
})

test('gastar, devolver y descansar respetan cero y máximo por personaje', () => {
  let character = { ...hero, recoveriesSpent: 0 }
  for (let i = 0; i < 15; i++) character = { ...character, recoveriesSpent: nextRecoveriesSpent(character, 'spend') }
  assert.equal(recoveriesRemaining(character), 0)
  assert.equal(character.recoveriesSpent, 10)
  character.recoveriesSpent = nextRecoveriesSpent(character, 'restore')
  assert.equal(recoveriesRemaining(character), 1)
  character.recoveriesSpent = nextRecoveriesSpent(character, 'refill')
  assert.equal(recoveriesRemaining(character), 10)
  assert.equal(nextRecoveriesSpent(character, 'restore'), 0)
  assert.equal(recoveriesRemaining(hero), 10)
  assert.throws(() => nextRecoveriesSpent({ ...hero, heroClass: 'Propia' }, 'spend'), /manual/)
})

test('se restauran las recoveries guardadas y se rechazan contadores corruptos', () => {
  assert.equal(isCharacter(hero), true)
  const restored = parseCharacters(JSON.stringify([{ ...hero, recoveriesSpent: 4 }]))[0]
  assert.equal(recoveriesRemaining(restored), 6)
  for (const recoveriesSpent of [-1, 1.5, NaN, Infinity, 1_000_000_001]) {
    assert.equal(isCharacter({ ...hero, recoveriesSpent }), false)
    assert.throws(() => nextRecoveriesSpent({ ...hero, recoveriesSpent }, 'spend'), /no es válido/)
  }
  for (const recoveriesSpent of ['2', null]) assert.equal(isCharacter({ ...hero, recoveriesSpent }), false)
  assert.equal(recoveriesRemaining({ ...hero, recoveriesSpent: 12 }), 0)
})
