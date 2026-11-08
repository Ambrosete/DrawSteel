import { useState } from 'react'
import type { Character } from './characters'
import { recoveriesRemaining, recoveryMaximum } from './recoveries'
import type { RecoveryOperation } from './recoveries'

export default function RecoveriesCounter({ character, reconnecting = false, onChange }: {
  character: Character; reconnecting?: boolean; onChange: (operation: RecoveryOperation) => Promise<void>
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const maximum = recoveryMaximum(character)
  const remaining = recoveriesRemaining(character)
  async function change(operation: RecoveryOperation) {
    if (busy || reconnecting) return
    setBusy(true); setError('')
    try { await onChange(operation) }
    catch (e) { setError((e as { code?: string })?.code === 'permission-denied'
      ? 'Publica las reglas actualizadas de Firestore para guardar las recoveries.'
      : e instanceof Error ? e.message : 'No se han podido guardar las recoveries. Vuelve a intentarlo.') }
    finally { setBusy(false) }
  }
  return <section className="combat-counter character-sheet" aria-labelledby="recoveries-title" aria-busy={busy}>
    <h2 id="recoveries-title">Recoveries</h2>
    {maximum === null ? <p>Esta clase no tiene recoveries registradas en el manual.</p> : <>
      <output className="combat-counter-value" aria-live="polite" aria-label={`Recoveries de ${character.name}: ${remaining} de ${maximum}`}>
        {remaining}<span className="recovery-maximum"> / {maximum}</span>
      </output>
      <p>Disponibles · Máximo por clase y nivel</p>
      <div className="combat-counter-actions">
        <button type="button" className="secondary" disabled={busy || reconnecting || remaining === 0} onClick={() => { void change('spend') }}>− Gastar recovery</button>
        <button type="button" disabled={busy || reconnecting || remaining === maximum} onClick={() => { void change('restore') }}>+ Devolver recovery</button>
        <button type="button" className="secondary" disabled={busy || reconnecting || remaining === maximum} onClick={() => { void change('refill') }}>Descanso: recuperar todas</button>
      </div>
      <p className="recovery-source">Heroes v1.01b · {character.heroClass}, nivel {character.level ?? 1}{character.heroClass === 'Elementalist' && maximum === 10 ? ' · Master of Green +2' : ''}. Otros modificadores de rasgos, complicaciones y efectos no están incluidos.</p>
    </>}
    {error && <p role="alert" className="error">{error}</p>}{busy && <p role="status">Guardando recoveries…</p>}
  </section>
}
