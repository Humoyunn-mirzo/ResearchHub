'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { fetchRankings, type RankingCategory } from '@/core/services'
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui'

const tabs: { id: RankingCategory; label: string }[] = [
  { id: 'students', label: 'Top Students' },
  { id: 'professors', label: 'Top Professors' },
  { id: 'projects', label: 'Top Projects' },
  { id: 'universities', label: 'Top Universities' },
]

export default function RankingsPage() {
  const [tab, setTab] = useState<RankingCategory>('students')

  const { data, isLoading, error } = useQuery({
    queryKey: ['rankings', tab],
    queryFn: () => fetchRankings(tab),
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Rankings</h1>
        <p className="mt-2 text-muted-foreground">
          Leaderboards celebrating active contributors across the platform.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Button
            key={t.id}
            variant={tab === t.id ? 'default' : 'outline'}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {error ? (
        <div className="rounded-lg bg-destructive/10 p-4 text-center text-destructive">
          Failed to load rankings.
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
            <CardTitle>{tabs.find((t) => t.id === tab)?.label}</CardTitle>
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
          Rankings will appear once there&apos;s activity.
        </div>
      )}
    </div>
  )
}
