import test from 'node:test'
import assert from 'node:assert/strict'
import { abilities } from '../src/ability-catalog.ts'
import { formatAbilityText } from '../src/ability-text.ts'

test('Hammer and Anvil separa la cita ornamental, la tirada y el efecto posterior', () => {
  const ability = abilities.find(a => a.name === 'Hammer and Anvil')!
  const blocks = formatAbilityText(ability.details)
  assert.equal(blocks[0].kind, 'quote')
  assert.match('text' in blocks[0] ? blocks[0].text : '', /Let’s not argue/)
  const roll = blocks.find(b => b.kind === 'roll')!
  assert.deepEqual(roll.tiers.map(t => t.label), ['≤11', '12–16', '≥17'])
  assert.match(roll.tiers[1].text, /gains an edge/)
  assert.equal(roll.tiers.some(t => t.text.includes('Effect:')), false)
  assert.ok(blocks.some(b => b.kind === 'text' && b.text.startsWith('Effect:')))
})

test('los 291 Power Roll del catálogo muestran los tres resultados sin perder texto', () => {
  let count = 0
  const normalize = (text: string) => text.replace(/17\s*\+/g, '≥17').replace(/\s+/g, ' ').trim()
  for (const ability of abilities) {
    const blocks = formatAbilityText(ability.details)
    for (const block of blocks) if (block.kind === 'roll') {
      count++
      assert.deepEqual(block.tiers.map(t => t.label), ['≤11', '12–16', '≥17'], ability.name)
      assert.ok(block.tiers.every(t => t.text.length > 0), ability.name)
    }
    const reconstructed = blocks.map(b => b.kind === 'roll' ? [b.title, ...b.tiers.map(t => `${t.label}: ${t.text}`)].join(' ') : b.text).join(' ')
    assert.equal(normalize(reconstructed), normalize(ability.details), ability.name)
  }
  assert.equal(count, 291)
})

test('las líneas partidas se redistribuyen y las citas multilínea no se mezclan con la mecánica', () => {
  const blocks = formatAbilityText('“A long quote\ncontinued here.”\nMelee, Weapon\nMain action\nEffect: This sentence is\nwrapped in the source.')
  assert.deepEqual(blocks[0], { kind: 'quote', text: '“A long quote continued here.”' })
  assert.deepEqual(blocks.at(-1), { kind: 'text', text: 'Effect: This sentence is wrapped in the source.' })
})
