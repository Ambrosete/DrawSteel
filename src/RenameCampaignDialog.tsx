import { useEffect, useRef, useState } from 'react'

export default function RenameCampaignDialog({ name, onSave, onCancel }: {
  name: string; onSave: (name: string) => Promise<void>; onCancel: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState(name)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { dialog.current?.showModal(); input.current?.select() }, [])
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = draft.trim()
    if (busy || !trimmed || trimmed === name) return
    setBusy(true); setError('')
    try { await onSave(trimmed) }
    catch (e) {
      setError((e as { code?: string })?.code === 'permission-denied'
        ? 'Publica la nueva versión de firestore.rules en Firebase → Firestore Database → Reglas para permitir cambiar nombres.'
        : e instanceof Error ? e.message : 'No se ha podido cambiar el nombre. Vuelve a intentarlo.')
      setBusy(false)
    }
  }
  return <dialog ref={dialog} className="delete-dialog rename-dialog" aria-labelledby="rename-campaign-title" aria-busy={busy} onCancel={e => { if (busy) e.preventDefault(); else onCancel() }}>
    <form onSubmit={event => { void submit(event) }}><h2 id="rename-campaign-title">Cambiar nombre de campaña</h2><label>Nuevo nombre<input ref={input} autoFocus required maxLength={80} value={draft} disabled={busy} onChange={e => setDraft(e.target.value)} /></label>
      {error && <p className="error" role="alert">{error}</p>}{busy && <p role="status">Guardando el nuevo nombre…</p>}
      <div className="dialog-actions"><button type="button" className="secondary" disabled={busy} onClick={onCancel}>Cancelar</button><button type="submit" disabled={busy || !draft.trim() || draft.trim() === name}>{busy ? 'Guardando…' : 'Guardar nombre'}</button></div>
    </form>
  </dialog>
}
