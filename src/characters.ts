import type { Training } from './progression.ts'
export const profiles = ['Gabriel', 'David', 'Mateo', 'Adrián', 'Andrés', 'Quique'] as const
export type Profile = typeof profiles[number]
export const characteristicNames = ['Fuerza', 'Agilidad', 'Razón', 'Intuición', 'Presencia'] as const
export type Characteristic = typeof characteristicNames[number]
export type Character = {
  id: string
  level?: number
  combatCounter?: number
  training?: Training
  owner: string
  campaign: string
  name: string
  ancestry: string
  background: string
  heroClass: string
  kit: string
  secondKit?: string
  culture?: { environment: string; organization: string; upbringing: string; language: string }
  rulesVersion?: '1.01b'
  complication: string
  characteristics: Record<Characteristic, number>
  status: 'draft'
}
export const storageKey = 'drawsteel.characters.v2'
export const legacyStorageKey = 'drawsteel.characters.v1'

export function isCharacter(value: unknown): value is Character {
  if (!value || typeof value !== 'object') return false
  const c = value as Record<string, unknown>
  const scores = c.characteristics as Record<string, unknown> | undefined
  return ['id', 'name', 'ancestry', 'background', 'heroClass', 'kit'].every(key => typeof c[key] === 'string' && (c[key] as string).trim().length > 0)
    && typeof c.complication === 'string'
    && (c.level === undefined || (typeof c.level === 'number' && Number.isInteger(c.level) && c.level >= 1 && c.level <= 10))
    && (c.training === undefined || (!!c.training && typeof c.training === 'object' && Array.isArray((c.training as Training).subclasses) && (c.training as Training).subclasses.every(s => typeof s === 'string') && !!(c.training as Training).choices && typeof (c.training as Training).choices === 'object' && !Array.isArray((c.training as Training).choices) && Object.values((c.training as Training).choices).every(id => typeof id === 'string')))
    && (c.secondKit === undefined || typeof c.secondKit === 'string')
    && (c.combatCounter === undefined || (typeof c.combatCounter === 'number' && Number.isInteger(c.combatCounter) && Math.abs(c.combatCounter) <= 1_000_000_000))
    && (c.culture === undefined || (!!c.culture && typeof c.culture === 'object' && ['environment', 'organization', 'upbringing', 'language'].every(key => typeof (c.culture as Record<string, unknown>)[key] === 'string')))
    && (c.rulesVersion === undefined || c.rulesVersion === '1.01b')
    && profiles.includes(c.owner as Profile) && c.campaign === 'Tyranny' && c.status === 'draft'
    && !!scores && characteristicNames.every(key => typeof scores[key] === 'number' && Number.isInteger(scores[key]) && Number(scores[key]) >= -2 && Number(scores[key]) <= 5)
}
export function parseCharacters(raw: string | null): Character[] {
  try {
    const data: unknown = JSON.parse(raw ?? '[]')
    return Array.isArray(data) ? data.filter(isCharacter) : []
  } catch { return [] }
}
export function charactersFor(characters: Character[], profile: Profile): Character[] {
  return characters.filter(c => c.owner === profile && c.campaign === 'Tyranny')
}
// Control de entrada local. Este código se entrega al navegador y no autentica contra un servidor.
export function canEnter(profile: Profile, password: string): boolean {
  return profile !== 'Gabriel' || password === '1234'
}
