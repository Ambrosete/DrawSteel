import { useEffect, useRef } from 'react'
export default function DeleteCharacterDialog({ name, onCancel, onDelete }: { name: string; onCancel: () => void; onDelete: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => { dialog.current?.showModal() }, [])
  return <dialog ref={dialog} className="delete-dialog" aria-labelledby="delete-title" aria-describedby="delete-description" onCancel={onCancel}>
    <h2 id="delete-title">¿Eliminar a {name}?</h2><p id="delete-description">Se borrarán su ficha, su nivel y sus habilidades guardadas en este navegador. Esta acción no se puede deshacer.</p>
    <div className="dialog-actions"><button className="secondary" autoFocus onClick={onCancel}>Cancelar</button><button className="danger" onClick={onDelete}>Eliminar definitivamente</button></div>
  </dialog>
}
