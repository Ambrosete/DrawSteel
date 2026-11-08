import test from 'node:test'
import assert from 'node:assert/strict'
import { nextCombatCounter } from '../src/combat-counter.ts'
import { isCharacter, parseCharacters } from '../src/characters.ts'

test('el contador de una ficha antigua parte de cero y permite sumar, restar y resetear', () => {
  assert.equal(nextCombatCounter(undefined, 'reset'), 0)
  assert.equal(nextCombatCounter(undefined, 'increment'), 1)
  assert.equal(nextCombatCounter(undefined, 'decrement'), -1)
  const first = nextCombatCounter(undefined, 'increment')
  const second = nextCombatCounter(first, 'increment')
  assert.equal(second, 2)
  assert.equal(nextCombatCounter(second, 'decrement'), 1)
  assert.equal(nextCombatCounter(second, 'reset'), 0)
})

test('un contador corrupto o fuera de los límites no se guarda', () => {
  for (const current of [NaN, Infinity, 1.5, 1_000_000_001]) assert.throws(() => nextCombatCounter(current, 'increment'), /no es válido/)
  assert.throws(() => nextCombatCounter(1_000_000_000, 'increment'), /límite/)
  assert.throws(() => nextCombatCounter(-1_000_000_000, 'decrement'), /límite/)
})

test('los personajes recuperan el contador al recargar y siguen aceptando fichas anteriores', () => {
  const character = { id:'hero', owner:'David', campaign:'Tyranny', name:'Héroe', ancestry:'Human', background:'Artisan', heroClass:'Fury', kit:'Warrior', complication:'', characteristics:{Fuerza:2,Agilidad:2,Razón:-1,Intuición:1,Presencia:1}, status:'draft' }
  assert.equal(isCharacter(character), true)
  assert.equal(parseCharacters(JSON.stringify([{ ...character, combatCounter: 12 }]))[0]?.combatCounter, 12)
  assert.equal(parseCharacters(JSON.stringify([{ ...character, combatCounter: -2 }]))[0]?.combatCounter, -2)
  for (const combatCounter of ['12', 1.5, null, 1_000_000_001]) assert.equal(isCharacter({ ...character, combatCounter }), false)
})
