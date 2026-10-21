import {
  useChapterProgress as useProgress,
  usePassportStore,
} from '../shared/usePassportStore'
import { passportStore } from './progress'
import type { ChapterId } from './progress'
export function useChapterProgress(
  id: ChapterId,
  completed: readonly number[],
) {
  useProgress(passportStore, id, completed)
}
export const usePassport = () => usePassportStore(passportStore)
