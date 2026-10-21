import { BLACK_HOLE_IDS } from './catalog.ts'
import { createPassportStore } from '../shared/passport.ts'
export type ChapterId = (typeof BLACK_HOLE_IDS)[number]
export const passportStore = createPassportStore(
  BLACK_HOLE_IDS,
  'spum.black-holes.passport.v1',
  'spum-black-holes-passport',
)
export const {
  readCompleted,
  readPassport,
  saveCompleted,
  completedCount,
} = passportStore
export function lessonIndices(
  completed: readonly (number | string)[],
  lessons?: readonly { id: string }[],
) {
  return completed.flatMap((value) => {
    const index =
      typeof value === 'number'
        ? value
        : (lessons?.findIndex((lesson) => lesson.id === value) ?? -1)
    return Number.isInteger(index) && index >= 0 && index < 4 ? [index] : []
  })
}
