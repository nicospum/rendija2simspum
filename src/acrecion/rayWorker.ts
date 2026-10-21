import { buildDiskMap } from './physics'
const worker = self as unknown as {
  onmessage: (() => void) | null
  postMessage: (data: unknown, transfer?: Transferable[]) => void
}
worker.onmessage = () => {
  try {
    const map = buildDiskMap()
    worker.postMessage(map, [map.data.buffer])
  } catch {
    worker.postMessage({ error: true })
  }
}
