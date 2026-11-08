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

test('se destacan todas las palabras clave de la línea y también las habilidades de una sola palabra clave', () => {
  const blocks = formatAbilityText('A description.\nArea, Magic, Melee, Weapon\nMain action\nDistance: Melee 1\nx One creature\nEffect: Ranged attacks can follow.')
  assert.deepEqual(blocks.find(b => b.kind === 'keywords'), { kind: 'keywords', text: 'Area, Magic, Melee, Weapon' })
  assert.deepEqual(formatAbilityText('A description.\nPsionic\nManeuver\nDistance: Self\nx Self').find(b => b.kind === 'keywords'), { kind: 'keywords', text: 'Psionic' })
  assert.ok(blocks.some(b => b.kind === 'text' && b.text.startsWith('Effect: Ranged')))
})

test('cada habilidad conserva su acción, Distance y Target sin mezclarlos con los efectos', () => {
  for (const ability of abilities) {
    const blocks = formatAbilityText(ability.details)
    for (const kind of ['action', 'distance', 'target']) assert.equal(blocks.filter(b => b.kind === kind).length, 1, `${ability.name}: ${kind}`)
  }
  const blocks = formatAbilityText('A description.\nMagic, Ranged\nMain action\nDistance: Melee 1 or\nranged 10\nx One enemy\nEffect: Move.')
  assert.deepEqual(blocks.find(b => b.kind === 'distance'), { kind: 'distance', text: 'Distance: Melee 1 or ranged 10' })
  assert.ok(blocks.some(b => b.kind === 'target' && b.text === 'x One enemy'))
})

test('los objetivos de varias líneas se mantienen completos y separados de la tirada', () => {
  const blocks = formatAbilityText('Description.\nMagic, Ranged\nFree triggered\nDistance: Ranged 10\nx One creature or\nobject in range\nPower Roll + Reason:\n≤11: 1 damage\n12–16: 2 damage\n17+: 3 damage')
  assert.deepEqual(blocks.find(b => b.kind === 'action'), { kind: 'action', text: 'Free triggered' })
  assert.deepEqual(blocks.find(b => b.kind === 'target'), { kind: 'target', text: 'x One creature or object in range' })
  assert.equal(blocks.filter(b => b.kind === 'roll').length, 1)
})
