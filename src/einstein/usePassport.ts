import { useEffect, useState } from 'react'
import {
  PASSPORT_EVENT,
  PASSPORT_KEY,
  readPassport,
  saveCompleted,
} from './progress'
import type { ChapterId } from './progress'
export function useChapterProgress(
  id: ChapterId,
  completed: readonly number[],
) {
  useEffect(() => {
    saveCompleted(id, completed)
  }, [id, completed])
}
export function usePassport() {
  const [passport, setPassport] = useState(() => readPassport())
  useEffect(() => {
    const update = () => setPassport(readPassport())
    const storage = (event: StorageEvent) => {
      if (event.key === PASSPORT_KEY || event.key === null) update()
    }
    window.addEventListener(PASSPORT_EVENT, update)
    window.addEventListener('storage', storage)
    return () => {
      window.removeEventListener(PASSPORT_EVENT, update)
      window.removeEventListener('storage', storage)
    }
  }, [])
  return passport
}
