import { profiles } from './characters.ts'
import type { Profile } from './characters.ts'

export type SavedSession = { profile: Profile | null; campaignId: string | null; characterId: string | null }
export const sharedSessionKey = 'drawsteel.shared-session.v1'
export const localSessionKey = 'drawsteel.local-session.v1'
const modeKey = 'drawsteel.session-mode.v1'
const empty: SavedSession = { profile: null, campaignId: null, characterId: null }

export function parseSavedSession(raw: string | null): SavedSession {
  try {
    const data = JSON.parse(raw ?? 'null')
    if (!data || !profiles.includes(data.profile)) return { ...empty }
    const validId = (id: unknown): id is string => typeof id === 'string' && id.length > 0 && id.length <= 1500 && !id.includes('/')
    const campaignId = validId(data.campaignId) ? data.campaignId : null
    return { profile: data.profile, campaignId, characterId: campaignId && validId(data.characterId) ? data.characterId : null }
  } catch { return { ...empty } }
}
export function readSavedSession(key: string): SavedSession {
  try { return parseSavedSession(localStorage.getItem(key)) } catch { return { ...empty } }
}
export function saveSession(key: string, session: SavedSession) {
  try { localStorage.setItem(key, JSON.stringify(session)) } catch { /* Retain the in-memory session when storage is unavailable. */ }
}
export function readLocalMode(): boolean {
  try { return localStorage.getItem(modeKey) === 'local' } catch { return false }
}
export function saveLocalMode(local: boolean) {
  try { localStorage.setItem(modeKey, local ? 'local' : 'shared') } catch { /* Optional browser preference. */ }
}
