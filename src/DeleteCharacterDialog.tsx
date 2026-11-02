import { useEffect, useRef } from 'react'
export default function DeleteCharacterDialog({ name, shared = false, busy = false, onCancel, onDelete }: { name: string; shared?: boolean; busy?: boolean; onCancel: () => void; onDelete: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => { dialog.current?.showModal() }, [])
  return <dialog ref={dialog} className="delete-dialog" aria-labelledby="delete-title" aria-describedby="delete-description" onCancel={onCancel}>
    <h2 id="delete-title">¿Eliminar a {name}?</h2><p id="delete-description">Se borrarán su ficha, su nivel y sus habilidades {shared ? 'de la campaña para todos sus miembros' : 'guardadas en este navegador'}. Esta acción no se puede deshacer.</p>
    <div className="dialog-actions"><button className="secondary" disabled={busy} autoFocus onClick={onCancel}>Cancelar</button><button className="danger" disabled={busy} onClick={onDelete}>{busy ? 'Eliminando…' : 'Eliminar definitivamente'}</button></div>
  </dialog>
}
