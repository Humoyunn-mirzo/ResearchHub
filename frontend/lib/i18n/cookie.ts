import { DEFAULT_LOCALE, isLocale, type Locale } from './config'

export const LOCALE_COOKIE = 'locale'
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

/** Parses a locale out of a raw cookie value, falling back to the default. */
export function localeFromCookieValue(value: string | undefined): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE
}

/**
 * Persists the locale so the server can render the correct language on the
 * next request — this is what keeps SSR and the client in agreement.
 */
export function writeLocaleCookie(locale: Locale): void {
  if (typeof document === 'undefined') return
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax${secure}`
}

export function readLocaleCookie(): Locale | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`))
  const value = match?.[1] ? decodeURIComponent(match[1]) : undefined
  return isLocale(value) ? value : null
}
