import { useMemo } from 'react'
import {
  useChapterProgress,
  usePassportStore,
} from '../shared/usePassportStore'
import { lessonIndices, passportStore } from './progress'
import type { ChapterId } from './progress'
export const useBlackHolePassport = () => usePassportStore(passportStore)
export function useBlackHoleProgress(
  id: ChapterId,
  completed: readonly (number | string)[],
  lessons?: readonly { id: string }[],
) {
  const indices = useMemo(
    () => lessonIndices(completed, lessons),
    [completed, lessons],
  )
  useChapterProgress(passportStore, id, indices)
}
