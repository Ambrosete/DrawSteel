import { collection, doc, onSnapshot, runTransaction, setDoc, serverTimestamp, query, limit, getDocsFromServer, writeBatch } from 'firebase/firestore'
import { db } from './firebase'
import { assertRevision, isSharedCharacter } from './cloud-model'
import type { Campaign, SharedCharacter } from './cloud-model'
import type { Character } from './characters'
import { deleteCampaignInStages } from './campaign-deletion'
import { prepareCharacterTransfer } from './character-transfer'

function database() { if (!db) throw new Error('Firebase no está configurado.'); return db }
export async function transferSharedCharacter(sourceId: string, destinationId: string, character: SharedCharacter) {
  if (sourceId === destinationId) throw new Error('Elige una campaña diferente a la de origen.')
  await runTransaction(database(), async tx => {
    const source = await tx.get(doc(database(), 'campaigns', sourceId))
    const destination = await tx.get(doc(database(), 'campaigns', destinationId))
    if (!source.exists() || source.data().deleting) throw new Error('La campaña de origen no está disponible o se está eliminando.')
    if (!destination.exists() || destination.data().deleting) throw new Error('La campaña de destino no está disponible o se está eliminando.')
    const sourceRef = doc(database(), 'campaigns', sourceId, 'characters', character.id)
    const destinationRef = doc(database(), 'campaigns', destinationId, 'characters', character.id)
    const current = await tx.get(sourceRef)
    const occupied = await tx.get(destinationRef)
    if (!current.exists()) throw new Error('El personaje ya se ha transferido o eliminado desde otra sesión.')
    assertRevision(current.data().revision, character.revision)
    const moved = prepareCharacterTransfer({ ...current.data(), id: current.id } as SharedCharacter, destinationId, occupied.exists())
    tx.set(destinationRef, { ...moved, updatedAt: serverTimestamp() })
    tx.delete(sourceRef)
  })
}
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
    if (snapshot.data().deleting) throw new Error('Esta campaña se está eliminando.')
    assertRevision(snapshot.data().revision, campaign.revision)
    tx.update(ref, { ...changes, revision: campaign.revision + 1, updatedAt: serverTimestamp() })
  })
}
export async function saveSharedCharacter(campaignId: string, profileName: string, character: Character, expectedRevision: number) {
  const ref = doc(database(), 'campaigns', campaignId, 'characters', character.id)
  await runTransaction(database(), async tx => {
    const campaign = await tx.get(doc(database(), 'campaigns', campaignId))
    if (!campaign.exists() || campaign.data().deleting) throw new Error('Esta campaña se está eliminando o ya no está disponible.')
    const snapshot = await tx.get(ref)
    if (snapshot.exists()) assertRevision(snapshot.data().revision, expectedRevision)
    else if (expectedRevision !== 0) throw new Error('El personaje se ha eliminado desde otra sesión.')
    const saved = { ...character, owner: snapshot.exists() ? snapshot.data().owner : profileName, campaign: campaignId, revision: expectedRevision + 1 }
    if (!isSharedCharacter(saved, campaignId)) throw new Error('La ficha contiene datos inválidos.')
    tx.set(ref, { ...saved, updatedAt: serverTimestamp() })
  })
}
export async function deleteSharedCampaign(campaign: Campaign) {
  const ref = doc(database(), 'campaigns', campaign.id)
  await deleteCampaignInStages({
    lock: () => runTransaction(database(), async tx => {
      const current = await tx.get(ref)
      if (!current.exists() || current.data().deleting) return
      assertRevision(current.data().revision, campaign.revision)
      tx.update(ref, { deleting: true, revision: campaign.revision + 1, updatedAt: serverTimestamp() })
    }),
    readBatch: async () => (await getDocsFromServer(query(collection(database(), 'campaigns', campaign.id, 'characters'), limit(400)))).docs,
    deleteBatch: async items => {
      const batch = writeBatch(database())
      for (const item of items) batch.delete(item.ref)
      await batch.commit()
    },
    deleteParent: () => runTransaction(database(), async tx => {
      const current = await tx.get(ref)
      if (!current.exists()) return
      if (!current.data().deleting) throw new Error('No se ha podido iniciar la eliminación de la campaña.')
      tx.delete(ref)
    }),
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
