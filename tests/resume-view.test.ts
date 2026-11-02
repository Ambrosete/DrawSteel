import test from 'node:test'
import assert from 'node:assert/strict'
import { parseResumeView } from '../src/resume-view.ts'

const view = { profile: 'David', campaign: { id: 'campaign-a', name: 'Aventura', ownerId: 'David', notes: 'Sesión 1', revision: 3 }, characters: [] }

test('la ficha guardada permite restaurar la misma mesa sin esperar al primer snapshot', () => {
  assert.deepEqual(parseResumeView(JSON.stringify(view), 'David', 'campaign-a'), view)
})

test('no se restaura una mesa de otro perfil, otra campaña, eliminándose o con datos corruptos', () => {
  assert.equal(parseResumeView(JSON.stringify(view), 'Mateo', 'campaign-a'), null)
  assert.equal(parseResumeView(JSON.stringify(view), 'David', 'campaign-b'), null)
  assert.equal(parseResumeView(JSON.stringify({ ...view, campaign: { ...view.campaign, deleting: true } }), 'David', 'campaign-a'), null)
  assert.equal(parseResumeView('{broken', 'David', 'campaign-a'), null)
  assert.deepEqual(parseResumeView(JSON.stringify({ ...view, characters: [{ id: 'broken' }] }), 'David', 'campaign-a')?.characters, [])
})
