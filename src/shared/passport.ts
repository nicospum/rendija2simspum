export type Passport<Id extends string> = Record<Id, number[]>
type StorageLike = Pick<Storage, 'getItem' | 'setItem'>
function localStore(): StorageLike | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
}
export function createPassportStore<const Id extends string>(
  ids: readonly Id[],
  key: string,
  event: string,
) {
  const emptyPassport = (): Passport<Id> => {
    const passport = {} as Passport<Id>
    for (const id of ids) passport[id] = []
    return passport
  }
  const valid = (values: unknown): values is number[] =>
    Array.isArray(values) &&
    values.length <= 4 &&
    values.every((v) => Number.isInteger(v) && v >= 0 && v < 4)
  function decodePassport(text: string | null): Passport<Id> {
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
      for (const id of ids) {
        const values = data.chapters[id]
        if (valid(values)) empty[id] = [...new Set(values)].sort()
      }
    } catch {
      /* A malformed passport never blocks a laboratory. */
    }
    return empty
  }
  function readPassport(storage: StorageLike | undefined = localStore()) {
    try {
      return decodePassport(storage?.getItem(key) ?? null)
    } catch {
      return emptyPassport()
    }
  }
  function saveCompleted(
    id: Id,
    completed: readonly number[],
    storage: StorageLike | undefined = localStore(),
  ) {
    if (!ids.includes(id) || !valid(completed) || !completed.length)
      return false
    try {
      if (!storage) return false
      const chapters = decodePassport(storage.getItem(key))
      chapters[id] = [...new Set([...chapters[id], ...completed])].sort()
      storage.setItem(key, JSON.stringify({ version: 1, chapters }))
      if (typeof window !== 'undefined')
        window.dispatchEvent(new Event(event))
      return true
    } catch {
      return false
    }
  }
  return {
    key,
    event,
    emptyPassport,
    decodePassport,
    readPassport,
    saveCompleted,
    readCompleted: (id: Id) => readPassport()[id],
    completedCount: (passport: Passport<Id>) =>
      ids.reduce((sum, id) => sum + passport[id].length, 0),
  }
}
export type PassportStore<Id extends string> = ReturnType<
  typeof createPassportStore<Id>
>
