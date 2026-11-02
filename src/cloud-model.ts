import { isCharacter } from './characters.ts'
import type { Character } from './characters.ts'

export type Campaign = {
  id: string
  name: string
  ownerId: string
  notes: string
  revision: number
}
export type SharedCharacter = Character & { revision: number }
// Reuse the complete draft validator, replacing only the legacy identity fields.
export function isSharedCharacter(value: unknown, campaignId: string): value is SharedCharacter {
  if (!value || typeof value !== 'object') return false
  const c = value as SharedCharacter
  return typeof c.owner === 'string' && !!c.owner && c.campaign === campaignId
    && Number.isInteger(c.revision) && c.revision >= 1
    && isCharacter({ ...c, owner: 'Gabriel', campaign: 'Tyranny' })
}
export function assertRevision(actual: number, expected: number) {
  if (actual !== expected) throw new Error('Otra persona ha actualizado estos datos. Revisa la versión recibida antes de volver a guardar.')
}
