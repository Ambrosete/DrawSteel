// Lock writes before removing children, and remove the parent only after cleanup.
// If any step fails, the parent stays marked so deletion can be retried safely.
export async function deleteCampaignInStages<T>(operations: {
  lock: () => Promise<void>
  readBatch: () => Promise<T[]>
  deleteBatch: (items: T[]) => Promise<void>
  deleteParent: () => Promise<void>
}) {
  await operations.lock()
  for (;;) {
    const items = await operations.readBatch()
    if (!items.length) break
    await operations.deleteBatch(items)
  }
  await operations.deleteParent()
}
