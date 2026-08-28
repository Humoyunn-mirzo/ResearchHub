export const LOCALES = ['en', 'uz'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

export const LOCALE_META: Record<Locale, { label: string; englishLabel: string; flag: string }> = {
  en: { label: 'English', englishLabel: 'English', flag: '🇬🇧' },
  uz: { label: "O'zbekcha", englishLabel: 'Uzbek', flag: '🇺🇿' },
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}

/** Best-effort locale from the browser, used only when nothing is stored yet. */
export function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE
  const candidates = [navigator.language, ...(navigator.languages ?? [])]
  for (const candidate of candidates) {
    const base = candidate?.toLowerCase().split('-')[0]
    if (isLocale(base)) return base
  }
  return DEFAULT_LOCALE
}
