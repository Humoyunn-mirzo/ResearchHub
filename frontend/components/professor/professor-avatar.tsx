'use client'

import { useEffect, useState } from 'react'
import { User } from 'lucide-react'
import { professorAvatarUrl } from '@/core/services'
import { useTranslation } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const SIZES = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-14 w-14 text-lg',
  lg: 'h-24 w-24 text-2xl',
  xl: 'h-32 w-32 text-3xl',
} as const

type ProfessorAvatarProps = {
  professorId: string
  name: string
  hasPicture: boolean
  size?: keyof typeof SIZES
  /** Changing this forces the browser to refetch after an upload. */
  version?: string | number
  className?: string
}

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '?'
  )
}

export function ProfessorAvatar({
  professorId,
  name,
  hasPicture,
  size = 'md',
  version,
  className,
}: ProfessorAvatarProps) {
  const { t } = useTranslation()
  const [failed, setFailed] = useState(false)

  // A new upload replaces the image; clear the previous load failure.
  useEffect(() => {
    setFailed(false)
  }, [version, hasPicture])

  const showImage = hasPicture && !failed

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-semibold text-primary',
        SIZES[size],
        className
      )}
    >
      {showImage ? (
        // Served by the API as raw bytes, so next/image optimisation is skipped.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={professorAvatarUrl(professorId, version)}
          alt={t('professorProfile.avatarAlt', { name })}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : name ? (
        <span aria-hidden="true">{initials(name)}</span>
      ) : (
        <User className="h-1/2 w-1/2" aria-hidden="true" />
      )}
    </div>
  )
}
