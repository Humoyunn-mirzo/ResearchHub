'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_LOCALE, detectLocale, type Locale } from './config'
import { readLocaleCookie, writeLocaleCookie } from './cookie'
import { dictionaries, type MessageKey } from './messages'

export type TranslateValues = Record<string, string | number>

type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: MessageKey, values?: TranslateValues) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function interpolate(template: string, values?: TranslateValues): string {
  if (!values) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = values[name]
    return value === undefined ? match : String(value)
  })
}

/**
 * `initialLocale` comes from the `locale` cookie read on the server, so the
 * markup React hydrates is already in the right language.
 */
export function I18nProvider({
  initialLocale = DEFAULT_LOCALE,
  children,
}: {
  initialLocale?: Locale
  children: React.ReactNode
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  // First visit: no cookie yet, so fall back to the browser language once.
  useEffect(() => {
    if (readLocaleCookie()) return
    const detected = detectLocale()
    if (detected === locale) {
      writeLocaleCookie(detected)
      return
    }
    writeLocaleCookie(detected)
    setLocaleState(detected)
    // Runs once on mount; `locale` is only read to skip a redundant update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    writeLocaleCookie(next)
    setLocaleState(next)
  }, [])

  const value = useMemo<I18nContextValue>(() => {
    const dictionary = dictionaries[locale]
    return {
      locale,
      setLocale,
      t: (key, values) => interpolate(dictionary[key], values),
    }
  }, [locale, setLocale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used inside <I18nProvider>')
  }
  return context
}

/** Shorthand for components that only need the translate function. */
export function useTranslation() {
  return useI18n()
}
