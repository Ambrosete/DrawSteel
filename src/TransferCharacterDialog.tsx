import { useEffect, useRef, useState } from 'react'
import type { Character } from './characters'
import type { Campaign } from './cloud-model'

export default function TransferCharacterDialog({ character, source, destinations, onTransfer, onCancel }: {
  character: Character; source: string; destinations: Campaign[]
  onTransfer: (destination: Campaign) => Promise<void>; onCancel: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [destinationId, setDestinationId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { dialog.current?.showModal() }, [])
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const destination = destinations.find(c => c.id === destinationId)
    if (!destination || busy) return
    setBusy(true); setError('')
    try { await onTransfer(destination) }
    catch (e) { setError(e instanceof Error ? e.message : 'No se ha podido transferir el personaje. Vuelve a intentarlo.'); setBusy(false) }
  }
  return <dialog ref={dialog} className="delete-dialog transfer-dialog" aria-labelledby="transfer-title" aria-describedby="transfer-description" aria-busy={busy} onCancel={e => { if (busy) e.preventDefault(); else onCancel() }}>
    <form onSubmit={event => { void submit(event) }}>
      <h2 id="transfer-title">Transferir a {character.name}</h2>
      <p id="transfer-description">Se moverá desde «{source}» a la campaña que elijas. Conserva su nivel, habilidades, características y perfil. Dejará de aparecer en la campaña de origen.</p>
      {destinations.length ? <label>Campaña de destino<select autoFocus required disabled={busy} value={destinationId} onChange={e => setDestinationId(e.target.value)}><option value="">Elige una campaña…</option>{destinations.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label> : <p className="notice">No hay otra campaña disponible. Crea una desde la lista de campañas para poder transferir este personaje.</p>}
      {busy && <p role="status">Transfiriendo el personaje…</p>}{error && <p role="alert" className="error">{error}</p>}
      <div className="dialog-actions"><button type="button" className="secondary" disabled={busy} onClick={onCancel}>Cancelar</button><button type="submit" disabled={busy || !destinations.some(c => c.id === destinationId)}>{busy ? 'Transfiriendo…' : 'Transferir personaje'}</button></div>
    </form>
  </dialog>
}
