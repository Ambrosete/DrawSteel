import { classes, kits } from './rules-catalog.ts'
import type { Characteristic } from './characters.ts'
import { characteristicNames } from './characters.ts'
export type Scores = Record<Characteristic, number>
function permutations(values: readonly number[]): number[][] {
  if (!values.length) return [[]]
  return [...new Set(values)].flatMap(value => {
    const remaining = [...values]
    remaining.splice(remaining.indexOf(value), 1)
    return permutations(remaining).map(rest => [value, ...rest])
  })
}
export function characteristicChoices(className: string): Scores[] {
  const heroClass = classes.find(c => c.name === className)
  if (!heroClass) return []
  const fixed: readonly Characteristic[] = heroClass.fixed
  const remaining = characteristicNames.filter(key => !fixed.includes(key))
  const patterns = fixed.length === 2 ? [[2, -1, -1], [1, 1, -1], [1, 0, 0]] : [[2, 2, -1, -1], [2, 1, 1, -1], [2, 1, 0, 0], [1, 1, 1, 0]]
  return patterns.flatMap(permutations).map(values => Object.fromEntries([
    ...fixed.map(key => [key, 2]), ...remaining.map((key, i) => [key, values[i]]),
  ]) as Scores)
}
export function hasValidScores(className: string, scores: Scores): boolean {
  return characteristicChoices(className).some(option => characteristicNames.every(key => scores[key] === option[key]))
}
export function hasValidKits(className: string, first: string, second = ''): boolean {
  const heroClass = classes.find(c => c.name === className)
  if (!heroClass) return false
  if (heroClass.kitCount === 0) return first === 'Sin kit' && !second
  if (!kits.some(kit => kit.name === first)) return false
  return heroClass.kitCount === 1 ? !second : first !== second && kits.some(kit => kit.name === second)
}
