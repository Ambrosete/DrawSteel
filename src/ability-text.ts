export type AbilityTextBlock =
  | { kind: 'text' | 'quote'; text: string }
  | { kind: 'roll'; title: string; tiers: { label: string; text: string }[] }

const section = /^(?:Effect|Trigger|Special|Strained|Persistent\s+\d+|Spend\s+[^:]+|Mark Benefit)\s*:/i
const metadata = /^(?:Distance\s*:|x\s|(?:Main action|Maneuver|Triggered action|Free triggered action|Free maneuver|Free action|Move action|No action|—)$)/i
const keywords = /^(?:[A-Za-z-]+,\s*)+[A-Za-z-]+$/
const tier = /^(≤\s*11|12\s*[–-]\s*16|17\s*\+|≥\s*17)\s*:\s*(.*)$/
const reflow = (text: string) => text.replace(/\s+/g, ' ').trim()

// PDF line wraps are presentation artifacts, not the width of the web card.
export function formatAbilityText(details: string): AbilityTextBlock[] {
  const lines = details.split(/\r?\n/).map(line => line.trim())
  const blocks: AbilityTextBlock[] = []
  let paragraph: string[] = []
  const flush = () => { if (paragraph.length) { blocks.push({ kind: 'text', text: reflow(paragraph.join(' ')) }); paragraph = [] } }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line) { flush(); continue }
    const quoteEnd = line.startsWith('“') ? '”' : line.startsWith('«') ? '»' : line.startsWith('"') ? '"' : null
    if (quoteEnd) {
      let end = i
      while (end < lines.length && !(lines[end].endsWith(quoteEnd) && (end > i || lines[end].length > 1))) end++
      if (end < lines.length) {
        flush(); blocks.push({ kind: 'quote', text: reflow(lines.slice(i, end + 1).join(' ')) }); i = end; continue
      }
    }
    if (/^Power Roll\b/.test(line)) {
      flush()
      const roll: Extract<AbilityTextBlock, { kind: 'roll' }> = { kind: 'roll', title: reflow(line), tiers: [] }
      while (i + 1 < lines.length) {
        const next = lines[i + 1]
        if (/^Power Roll\b/.test(next) || section.test(next)) break
        const match = next.match(tier)
        if (match) {
          const label = match[1].includes('12') ? '12–16' : match[1].includes('11') ? '≤11' : '≥17'
          roll.tiers.push({ label, text: reflow(match[2]) })
        } else if (roll.tiers.length) {
          const current = roll.tiers[roll.tiers.length - 1]
          current.text = reflow(`${current.text} ${next}`)
        } else roll.title = reflow(`${roll.title} ${next}`)
        i++
      }
      blocks.push(roll)
      continue
    }
    if (section.test(line)) flush()
    if (metadata.test(line) || keywords.test(line)) {
      flush(); blocks.push({ kind: 'text', text: reflow(line) })
    } else paragraph.push(line)
  }
  flush()
  return blocks
}
