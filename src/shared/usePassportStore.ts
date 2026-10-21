import { useEffect, useState } from 'react'
import type { PassportStore } from './passport'
export function useChapterProgress<Id extends string>(
  store: PassportStore<Id>,
  id: Id,
  completed: readonly number[],
) {
  useEffect(() => {
    store.saveCompleted(id, completed)
  }, [store, id, completed])
}
export function usePassportStore<Id extends string>(
  store: PassportStore<Id>,
) {
  const [passport, setPassport] = useState(() => store.readPassport())
  useEffect(() => {
    const update = () => setPassport(store.readPassport())
    const onStorage = (event: StorageEvent) => {
      if (event.key === store.key || event.key === null) update()
    }
    window.addEventListener(store.event, update)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(store.event, update)
      window.removeEventListener('storage', onStorage)
    }
  }, [store])
  return passport
}
