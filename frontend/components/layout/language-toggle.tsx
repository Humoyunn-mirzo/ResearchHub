'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Globe } from 'lucide-react'
import { Button } from '@/components/ui'
import { LOCALES, LOCALE_META, useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

type LanguageToggleProps = {
  /** `inline` renders the options side by side, e.g. inside the settings card. */
  variant?: 'menu' | 'inline'
}

export function LanguageToggle({ variant = 'menu' }: LanguageToggleProps) {
  const { locale, setLocale, t } = useI18n()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (variant === 'inline') {
    return (
      <div className="flex flex-wrap gap-2">
        {LOCALES.map((option) => (
          <Button
            key={option}
            type="button"
            variant={locale === option ? 'default' : 'outline'}
            onClick={() => setLocale(option)}
            aria-pressed={locale === option}
          >
            <span aria-hidden="true" className="mr-2">
              {LOCALE_META[option].flag}
            </span>
            {LOCALE_META[option].label}
          </Button>
        ))}
      </div>
    )
  }

  return (
    <div className="relative" ref={containerRef}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        aria-label={t('language.change')}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Globe className="h-5 w-5" />
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-44 rounded-lg border bg-popover p-1 shadow-lg"
        >
          {LOCALES.map((option) => (
            <button
              key={option}
              type="button"
              role="menuitemradio"
              aria-checked={locale === option}
              onClick={() => {
                setLocale(option)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent',
                locale === option && 'font-medium'
              )}
            >
              <span aria-hidden="true">{LOCALE_META[option].flag}</span>
              <span className="flex-1 text-left">{LOCALE_META[option].label}</span>
              {locale === option && <Check className="h-4 w-4 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
