import type { MessageKey } from './en'

/**
 * Every locale must supply a string for every key in `en.ts`.
 * A missing or misspelled key is a type error, not a runtime fallback.
 */
export type Messages = Record<MessageKey, string>

export type { MessageKey }
