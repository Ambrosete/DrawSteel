import test from 'node:test'
import assert from 'node:assert/strict'
import { deleteCampaignInStages } from '../src/campaign-deletion.ts'

test('borrar una campaña vacía bloquea las escrituras antes de eliminarla', async () => {
  const events: string[] = []
  await deleteCampaignInStages({
    lock: async () => { events.push('lock') },
    readBatch: async () => { events.push('read'); return [] },
    deleteBatch: async () => { assert.fail('No hay personajes que borrar') },
    deleteParent: async () => { events.push('parent') },
  })
  assert.deepEqual(events, ['lock', 'read', 'parent'])
})

test('una campaña con más de 1000 personajes se limpia por lotes antes de borrar sus notas y documento', async () => {
  let children = Array.from({ length: 1001 }, (_, i) => i)
  let locked = false
  let parentExists = true
  const batches: number[] = []
  await deleteCampaignInStages({
    lock: async () => { locked = true },
    readBatch: async () => { assert.equal(locked, true); return children.slice(0, 400) },
    deleteBatch: async items => { assert.equal(parentExists, true); batches.push(items.length); children = children.filter(id => !items.includes(id)) },
    deleteParent: async () => { assert.equal(children.length, 0); parentExists = false },
  })
  assert.deepEqual(batches, [400, 400, 201])
  assert.equal(parentExists, false)
})

test('si las reglas rechazan el bloqueo, no se borra ningún personaje ni la campaña', async () => {
  await assert.rejects(deleteCampaignInStages({
    lock: async () => { throw new Error('permission-denied') },
    readBatch: async () => { assert.fail('No debe leer para borrar antes de bloquear') },
    deleteBatch: async () => { assert.fail('No debe borrar personajes') },
    deleteParent: async () => { assert.fail('No debe borrar la campaña') },
  }), /permission-denied/)
})

test('una interrupción conserva el documento y permite reanudar los lotes pendientes', async () => {
  let children = [1, 2, 3]
  let parentExists = true
  let interrupted = true
  const operations = {
    lock: async () => {},
    readBatch: async () => children.slice(0, 2),
    deleteBatch: async (items: number[]) => {
      if (items[0] === 3 && interrupted) throw new Error('sin conexión')
      children = children.filter(id => !items.includes(id))
    },
    deleteParent: async () => { parentExists = false },
  }
  await assert.rejects(deleteCampaignInStages(operations), /sin conexión/)
  assert.equal(parentExists, true)
  assert.deepEqual(children, [3])
  interrupted = false
  await deleteCampaignInStages(operations)
  assert.deepEqual(children, [])
  assert.equal(parentExists, false)
})
