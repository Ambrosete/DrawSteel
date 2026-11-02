import { isSharedCharacter } from './cloud-model.ts'
import type { SharedCharacter } from './cloud-model.ts'

export function prepareCharacterTransfer(character: SharedCharacter, destinationId: string, destinationOccupied: boolean): SharedCharacter {
  if (!isSharedCharacter(character, character.campaign)) throw new Error('La ficha de origen contiene datos inválidos.')
  if (!destinationId || destinationId === character.campaign) throw new Error('Elige una campaña diferente a la de origen.')
  if (destinationOccupied) throw new Error('La campaña de destino ya contiene un personaje con este identificador. No se ha transferido ni sobrescrito ninguna ficha.')
  return { ...character, campaign: destinationId, revision: 1 }
}
