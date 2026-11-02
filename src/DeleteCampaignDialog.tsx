import { useEffect, useRef } from 'react'

export default function DeleteCampaignDialog({ name, busy, error, onCancel, onDelete }: {
  name: string; busy: boolean; error: string; onCancel: () => void; onDelete: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => { dialog.current?.showModal() }, [])
  return <dialog ref={dialog} className="delete-dialog" aria-labelledby="delete-campaign-title" aria-describedby="delete-campaign-description" aria-busy={busy} onCancel={event => { if (busy) event.preventDefault(); else onCancel() }}>
    <h2 id="delete-campaign-title">¿Eliminar la campaña «{name}»?</h2>
    <p id="delete-campaign-description">Se eliminarán la campaña, todos sus personajes y sus notas compartidas para toda la mesa. Esta acción no se puede deshacer.</p>
    {busy && <p role="status">Eliminando la campaña y sus personajes…</p>}
    {error && <p className="error" role="alert">{error}</p>}
    <div className="dialog-actions"><button type="button" className="secondary" autoFocus disabled={busy} onClick={onCancel}>Cancelar</button><button type="button" className="danger" disabled={busy} onClick={onDelete}>{busy ? 'Eliminando…' : 'Eliminar campaña definitivamente'}</button></div>
  </dialog>
}
