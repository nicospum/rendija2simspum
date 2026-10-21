import { useEffect, useState } from 'react'
import { alignedRingAngle, buildTransfer } from './physics'
import type { Model } from './physics'

export interface Transfer {
  model: Model
  data: Float32Array
  critical: number
  unresolved: number
  ring: number
}
export function useTransfer(model: Model) {
  const [result, setResult] = useState<Transfer | null>(null)
  const [error, setError] = useState('')
  const { mass, gravity } = model
  useEffect(() => {
    let cancelled = false
    let worker: Worker | null = null
    const current = { mass, gravity }
    const fallback = () => {
      if (cancelled) return
      try {
        const transfer = buildTransfer(current)
        setResult({ model: current, ...transfer, ring: alignedRingAngle(current) })
        setError('')
      } catch {
        setError('No pudimos calcular esta imagen. Restaurá el reto para volver a intentar.')
      }
    }
    // Coalesce a slider gesture, cancel stale work and keep controls responsive.
    const timer = window.setTimeout(() => {
      try {
        worker = new Worker(new URL('./rayWorker.ts', import.meta.url), { type: 'module' })
        worker.onmessage = ({ data }: MessageEvent<Transfer & { error?: string }>) => {
          if (cancelled) return
          if (data.error) fallback()
          else {
            setResult(data)
            setError('')
          }
          worker?.terminate()
        }
        worker.onerror = () => {
          worker?.terminate()
          fallback()
        }
        worker.postMessage({ id: 1, model: current })
      } catch {
        fallback()
      }
    }, 60)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
      worker?.terminate()
    }
  }, [mass, gravity])
  return {
    result,
    error,
    pending: !result || result.model.mass !== mass || result.model.gravity !== gravity,
  }
}
