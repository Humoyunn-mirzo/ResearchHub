'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui'
import { useTranslation } from '@/lib/i18n'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { t } = useTranslation()
  const { theme, setTheme, resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label={t('theme.toggle')}>
        <span className="h-5 w-5" />
      </Button>
    )
  }

  const isDark = (resolvedTheme ?? theme) === 'dark'
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={t('theme.toggle')}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  )
}
