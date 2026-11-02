import { isSharedCharacter } from './cloud-model.ts'
import type { Campaign, SharedCharacter } from './cloud-model.ts'
const viewKey = 'drawsteel.resume-view.v1'
export type ResumeView = { profile: string; campaign: Campaign; characters: SharedCharacter[] }

export function parseResumeView(raw: string | null, profile: string | null, campaignId: string | null): ResumeView | null {
  try {
    const data = JSON.parse(raw ?? 'null')
    const campaign = data?.campaign
    if (!profile || !campaignId || data?.profile !== profile || campaign?.id !== campaignId || campaign.deleting
      || typeof campaign.name !== 'string' || typeof campaign.ownerId !== 'string' || typeof campaign.notes !== 'string'
      || !Number.isInteger(campaign.revision) || campaign.revision < 1 || !Array.isArray(data.characters)) return null
    return { profile, campaign, characters: data.characters.filter((c: unknown) => isSharedCharacter(c, campaignId)) }
  } catch { return null }
}
export function readResumeView(profile: string | null, campaignId: string | null): ResumeView | null {
  try { return parseResumeView(localStorage.getItem(viewKey), profile, campaignId) } catch { return null }
}
export function saveResumeView(view: ResumeView | null) {
  try { if (view) localStorage.setItem(viewKey, JSON.stringify(view)); else localStorage.removeItem(viewKey) } catch { /* Session IDs still restore when the view cannot be cached. */ }
}
