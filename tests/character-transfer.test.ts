import test from 'node:test'
import assert from 'node:assert/strict'
import { prepareCharacterTransfer } from '../src/character-transfer.ts'
import { isSharedCharacter } from '../src/cloud-model.ts'
import type { SharedCharacter } from '../src/cloud-model.ts'

const character: SharedCharacter = {
  id: 'hero-1', owner: 'David', campaign: 'source', revision: 8, name: 'Luna', level: 7, combatCounter: 7,
  ancestry: 'Human', background: 'Artisan', heroClass: 'Censor', kit: 'Warrior', secondKit: 'Archer',
  complication: 'Amnesia', status: 'draft', rulesVersion: '1.01b',
  culture: { environment: 'Urban', organization: 'Communal', upbringing: 'Academic', language: 'Anjali' },
  characteristics: { Fuerza: 3, Agilidad: 2, Razón: 1, Intuición: 1, Presencia: 4 },
  training: { subclasses: ['Oracle'], choices: { 'signature-1': 'Censor:82:Back Blasphemer!' } },
}

test('transferir conserva ficha, perfil, nivel y todas las elecciones sin mutar el origen', () => {
  const original = structuredClone(character)
  const moved = prepareCharacterTransfer(character, 'destination', false)
  assert.deepEqual(moved, { ...original, campaign: 'destination', revision: 1 })
  assert.deepEqual(character, original)
  assert.equal(isSharedCharacter(moved, 'destination'), true)
  assert.equal(isSharedCharacter(moved, 'source'), false)
})

test('un destino ocupado no se sobrescribe y una campaña igual o vacía no admite transferencia', () => {
  assert.throws(() => prepareCharacterTransfer(character, 'destination', true), /no se ha transferido|No se ha transferido/)
  assert.throws(() => prepareCharacterTransfer(character, 'source', false), /campaña diferente/)
  assert.throws(() => prepareCharacterTransfer(character, '', false), /campaña diferente/)
})

test('se rechaza transferir una ficha corrupta sin convertirla en otra ficha guardada', () => {
  assert.throws(() => prepareCharacterTransfer({ ...character, revision: 0 }, 'destination', false), /datos inválidos/)
  assert.throws(() => prepareCharacterTransfer({ ...character, level: 99 }, 'destination', false), /datos inválidos/)
})
