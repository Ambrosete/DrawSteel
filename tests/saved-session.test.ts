import test from 'node:test'
import assert from 'node:assert/strict'
import { localSessionKey, sharedSessionKey, parseSavedSession, readSavedSession, saveSession } from '../src/saved-session.ts'

test('la sesión recupera perfil, campaña y personaje sin almacenar contraseñas', () => {
  assert.deepEqual(parseSavedSession(JSON.stringify({ profile: 'David', campaignId: 'campaign-a', characterId: 'hero-a', password: 'ignored' })), {
    profile: 'David', campaignId: 'campaign-a', characterId: 'hero-a',
  })
})

test('datos corruptos o perfiles desconocidos no bloquean la entrada', () => {
  for (const raw of [null, '{broken', 'null', '[]', JSON.stringify({ profile: 'Otro', campaignId: 'campaign-a', characterId: 'hero-a' })]) {
    assert.deepEqual(parseSavedSession(raw), { profile: null, campaignId: null, characterId: null })
  }
  assert.deepEqual(parseSavedSession(JSON.stringify({ profile: 'Gabriel', campaignId: null, characterId: 'hero-a' })), { profile: 'Gabriel', campaignId: null, characterId: null })
  assert.deepEqual(parseSavedSession(JSON.stringify({ profile: 'David', campaignId: 'invalid/path', characterId: 'hero-a' })), { profile: 'David', campaignId: null, characterId: null })
})

test('las selecciones sobreviven a una nueva lectura, salir las limpia y el modo local queda separado', () => {
  const values = new Map<string, string>()
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) } })
  try {
    const session = { profile: 'David' as const, campaignId: 'campaign-a', characterId: 'hero-a' }
    saveSession(sharedSessionKey, session)
    saveSession(localSessionKey, { profile: 'Mateo', campaignId: 'Tyranny', characterId: 'local-hero' })
    assert.deepEqual(readSavedSession(sharedSessionKey), session)
    saveSession(sharedSessionKey, { profile: null, campaignId: null, characterId: null })
    assert.deepEqual(readSavedSession(sharedSessionKey), { profile: null, campaignId: null, characterId: null })
    assert.equal(readSavedSession(localSessionKey).characterId, 'local-hero')
  } finally {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous)
    else Reflect.deleteProperty(globalThis, 'localStorage')
  }
})
