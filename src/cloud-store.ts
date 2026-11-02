import { collection, doc, onSnapshot, runTransaction, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
import { assertRevision, isSharedCharacter } from './cloud-model'
import type { Campaign, SharedCharacter } from './cloud-model'
import type { Character } from './characters'

function database() { if (!db) throw new Error('Firebase no está configurado.'); return db }
export function watchCampaigns(receive: (campaigns: Campaign[], cached: boolean) => void, fail: (error: Error) => void) {
  return onSnapshot(collection(database(), 'campaigns'), { includeMetadataChanges: true }, snapshot => {
    receive(snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as Campaign), snapshot.metadata.fromCache)
  }, fail)
}
export function watchCharacters(campaignId: string, receive: (characters: SharedCharacter[], cached: boolean) => void, fail: (error: Error) => void) {
  return onSnapshot(collection(database(), 'campaigns', campaignId, 'characters'), { includeMetadataChanges: true }, snapshot => {
    const characters = snapshot.docs.map(d => ({ ...d.data(), id: d.id })).filter(c => isSharedCharacter(c, campaignId))
    receive(characters, snapshot.metadata.fromCache)
  }, fail)
}
export async function createCampaign(profileName: string, name: string) {
  const trimmed = name.trim()
  if (!trimmed || trimmed.length > 80) throw new Error('Escribe un nombre de 1 a 80 caracteres.')
  const ref = doc(collection(database(), 'campaigns'))
  await setDoc(ref, { name: trimmed, ownerId: profileName, notes: '', revision: 1, updatedAt: serverTimestamp() })
}
export async function editCampaign(campaign: Campaign, changes: { notes: string }) {
  await runTransaction(database(), async tx => {
    const ref = doc(database(), 'campaigns', campaign.id)
    const snapshot = await tx.get(ref)
    if (!snapshot.exists()) throw new Error('La campaña ya no está disponible.')
    assertRevision(snapshot.data().revision, campaign.revision)
    tx.update(ref, { ...changes, revision: campaign.revision + 1, updatedAt: serverTimestamp() })
  })
}
export async function saveSharedCharacter(campaignId: string, profileName: string, character: Character, expectedRevision: number) {
  const ref = doc(database(), 'campaigns', campaignId, 'characters', character.id)
  await runTransaction(database(), async tx => {
    const snapshot = await tx.get(ref)
    if (snapshot.exists()) assertRevision(snapshot.data().revision, expectedRevision)
    else if (expectedRevision !== 0) throw new Error('El personaje se ha eliminado desde otra sesión.')
    const saved = { ...character, owner: snapshot.exists() ? snapshot.data().owner : profileName, campaign: campaignId, revision: expectedRevision + 1 }
    if (!isSharedCharacter(saved, campaignId)) throw new Error('La ficha contiene datos inválidos.')
    tx.set(ref, { ...saved, updatedAt: serverTimestamp() })
  })
}
export async function deleteSharedCharacter(campaignId: string, character: SharedCharacter) {
  await runTransaction(database(), async tx => {
    const ref = doc(database(), 'campaigns', campaignId, 'characters', character.id)
    const snapshot = await tx.get(ref)
    if (!snapshot.exists()) throw new Error('Este personaje ya se ha eliminado.')
    assertRevision(snapshot.data().revision, character.revision)
    tx.delete(ref)
  })
}
