import { EINSTEIN_IDS } from './catalog.ts'
export type ChapterId = (typeof EINSTEIN_IDS)[number]
export type Passport = Record<ChapterId, number[]>
export const PASSPORT_KEY = 'spum.einstein.passport.v1'
export const PASSPORT_EVENT = 'spum-einstein-passport'
export const emptyPassport = (): Passport => {
  const passport = {} as Passport
  for (const id of EINSTEIN_IDS) passport[id] = []
  return passport
}
export function decodePassport(text: string | null): Passport {
  const empty = emptyPassport()
  if (!text || text.length > 4096) return empty
  try {
    const data = JSON.parse(text)
    if (
      !data ||
      data.version !== 1 ||
      !data.chapters ||
      typeof data.chapters !== 'object' ||
      Array.isArray(data.chapters)
    )
      return empty
    for (const id of EINSTEIN_IDS) {
      const values = data.chapters[id]
      if (
        Array.isArray(values) &&
        values.length <= 4 &&
        values.every((v) => Number.isInteger(v) && v >= 0 && v < 4)
      )
        empty[id] = [...new Set(values as number[])].sort()
    }
  } catch {
    /* Private browsing, old or malformed data never blocks a laboratory. */
  }
  return empty
}
type StorageLike = Pick<Storage, 'getItem' | 'setItem'>
function localStore(): StorageLike | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
}
export function readPassport(
  storage: StorageLike | undefined = localStore(),
): Passport {
  try {
    return decodePassport(storage?.getItem(PASSPORT_KEY) ?? null)
  } catch {
    return emptyPassport()
  }
}
export const readCompleted = (id: ChapterId) => readPassport()[id]
export function saveCompleted(
  id: ChapterId,
  completed: readonly number[],
  storage: StorageLike | undefined = localStore(),
): boolean {
  if (
    !EINSTEIN_IDS.includes(id) ||
    !Array.isArray(completed) ||
    !completed.length ||
    completed.length > 4 ||
    completed.some((v) => !Number.isInteger(v) || v < 0 || v > 3)
  )
    return false
  try {
    if (!storage) return false
    const chapters = decodePassport(storage.getItem(PASSPORT_KEY))
    chapters[id] = [...new Set([...chapters[id], ...completed])].sort()
    storage.setItem(PASSPORT_KEY, JSON.stringify({ version: 1, chapters }))
    if (typeof window !== 'undefined')
      window.dispatchEvent(new Event(PASSPORT_EVENT))
    return true
  } catch {
    return false
  }
}
export const completedCount = (passport: Passport) =>
  EINSTEIN_IDS.reduce((sum, id) => sum + passport[id].length, 0)
