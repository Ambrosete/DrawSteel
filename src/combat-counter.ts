export type CounterOperation = 'increment' | 'decrement' | 'reset'
export function nextCombatCounter(current: number | undefined, operation: CounterOperation): number {
  const value = current ?? 0
  if (!Number.isInteger(value) || Math.abs(value) > 1_000_000_000) throw new Error('El contador guardado no es válido.')
  const next = operation === 'reset' ? 0 : value + (operation === 'increment' ? 1 : -1)
  if (Math.abs(next) > 1_000_000_000) throw new Error('El contador ha alcanzado su límite.')
  return next
}
