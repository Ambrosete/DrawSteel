import type { Character } from './characters.ts'

export type RecoveryOperation = 'spend' | 'restore' | 'refill'
type RecoveryCharacter = Pick<Character, 'heroClass' | 'level' | 'training' | 'recoveriesSpent'>

// Draw Steel Heroes v1.01b: class basics pp. 79, 95, 113, 131,
// 147, 161, 175, 187, 203; Master of Green p. 128.
const classRecoveries: Record<string, number> = {
  Censor: 12, Conduit: 8, Elementalist: 8, Fury: 10, Null: 8,
  Shadow: 8, Tactician: 10, Talent: 8, Troubadour: 8,
}

export function recoveryMaximum(character: RecoveryCharacter): number | null {
  if (!Object.hasOwn(classRecoveries, character.heroClass)) return null
  const greenBonus = character.heroClass === 'Elementalist'
    && (character.level ?? 1) >= 10 && character.training?.subclasses.includes('Green')
  return classRecoveries[character.heroClass] + (greenBonus ? 2 : 0)
}

export function recoveriesRemaining(character: RecoveryCharacter): number | null {
  const maximum = recoveryMaximum(character)
  return maximum === null ? null : Math.max(0, maximum - (character.recoveriesSpent ?? 0))
}

export function nextRecoveriesSpent(character: RecoveryCharacter, operation: RecoveryOperation): number {
  const maximum = recoveryMaximum(character)
  if (maximum === null) throw new Error('Esta clase no tiene recoveries registradas en el manual.')
  const spent = character.recoveriesSpent ?? 0
  if (!Number.isInteger(spent) || spent < 0 || spent > 1_000_000_000) throw new Error('El contador de recoveries no es válido.')
  if (operation === 'refill') return 0
  const capped = Math.min(maximum, spent)
  return operation === 'spend' ? Math.min(maximum, capped + 1) : Math.max(0, capped - 1)
}
