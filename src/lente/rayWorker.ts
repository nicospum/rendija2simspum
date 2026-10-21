import { alignedRingAngle, buildTransfer } from './physics'
import type { Model } from './physics'

const worker = self as unknown as {
  onmessage: ((event: MessageEvent<{ id: number; model: Model }>) => void) | null
  postMessage: (value: unknown, transfer?: Transferable[]) => void
}
worker.onmessage = ({ data: { id, model } }) => {
  try {
    const transfer = buildTransfer(model)
    worker.postMessage({ id, model, ...transfer, ring: alignedRingAngle(model) }, [
      transfer.data.buffer,
    ])
  } catch (error) {
    worker.postMessage({
      id,
      error: error instanceof Error ? error.message : 'No se pudo calcular la imagen',
    })
  }
}
