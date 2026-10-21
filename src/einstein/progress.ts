import { EINSTEIN_IDS } from './catalog.ts'
import { createPassportStore } from '../shared/passport.ts'
import type { Passport as SharedPassport } from '../shared/passport.ts'
export type ChapterId = (typeof EINSTEIN_IDS)[number]
export type Passport = SharedPassport<ChapterId>
export const PASSPORT_KEY = 'spum.einstein.passport.v1'
export const PASSPORT_EVENT = 'spum-einstein-passport'
export const passportStore = createPassportStore(
  EINSTEIN_IDS,
  PASSPORT_KEY,
  PASSPORT_EVENT,
)
export const {
  emptyPassport,
  decodePassport,
  readPassport,
  readCompleted,
  saveCompleted,
  completedCount,
} = passportStore
