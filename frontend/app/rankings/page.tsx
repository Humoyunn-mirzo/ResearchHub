'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { fetchRankings, type RankingCategory } from '@/core/services'
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui'
import { useTranslation, type MessageKey } from '@/lib/i18n'

const tabs: { id: RankingCategory; labelKey: MessageKey }[] = [
  { id: 'students', labelKey: 'rankings.students' },
  { id: 'professors', labelKey: 'rankings.professors' },
  { id: 'projects', labelKey: 'rankings.projects' },
  { id: 'universities', labelKey: 'rankings.universities' },
]

export default function RankingsPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<RankingCategory>('students')

  const { data, isLoading, error } = useQuery({
    queryKey: ['rankings', tab],
    queryFn: () => fetchRankings(tab),
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">{t('rankings.title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('rankings.subtitle')}</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <Button
            key={item.id}
            variant={tab === item.id ? 'default' : 'outline'}
            onClick={() => setTab(item.id)}
          >
            {t(item.labelKey)}
          </Button>
        ))}
      </div>

      {error ? (
        <div className="rounded-lg bg-destructive/10 p-4 text-center text-destructive">
          {t('rankings.loadFailed')}
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : data && data.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t(tabs.find((item) => item.id === tab)?.labelKey ?? 'rankings.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.map((row) => {
              const content = (
                <div className="flex items-center justify-between gap-3 rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                      {row.rank}
                    </div>
                    <div>
                      <div className="font-medium">{row.name}</div>
                      {row.subtitle && <div className="text-sm text-muted-foreground">{row.subtitle}</div>}
                    </div>
                  </div>
                  <Badge variant="secondary">{row.valueLabel}</Badge>
                </div>
              )

              return row.href ? (
                <Link key={row.rank} href={row.href} className="block">
                  {content}
                </Link>
              ) : (
                <div key={row.rank}>{content}</div>
              )
            })}
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          {t('rankings.empty')}
        </div>
      )}
    </div>
  )
}
