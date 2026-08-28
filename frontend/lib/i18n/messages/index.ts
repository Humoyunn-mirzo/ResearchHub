import type { Locale } from '../config'
import { en } from './en'
import { uz } from './uz'
import type { Messages } from './types'

export const dictionaries: Record<Locale, Messages> = {
  en,
  uz,
}

export type { Messages, MessageKey } from './types'
