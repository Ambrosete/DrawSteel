export const profiles = ['Gabriel', 'David', 'Mateo', 'Adrián', 'Andrés', 'Quique'] as const
export type Profile = typeof profiles[number]
export const characteristicNames = ['Fuerza', 'Agilidad', 'Razón', 'Intuición', 'Presencia'] as const
export type Characteristic = typeof characteristicNames[number]
export type Character = {
  id: string
  owner: Profile
  campaign: 'Tyranny'
  name: string
  ancestry: string
  background: string
  heroClass: string
  kit: string
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
    && profiles.includes(c.owner as Profile) && c.campaign === 'Tyranny' && c.status === 'draft'
    && !!scores && characteristicNames.every(key => typeof scores[key] === 'number' && Number.isInteger(scores[key]) && Number(scores[key]) >= -2 && Number(scores[key]) <= 3)
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
