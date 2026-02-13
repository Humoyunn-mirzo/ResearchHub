'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { fetchProjects } from '@/core/services'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui'
import { BookOpen, GraduationCap, Building2, Users } from 'lucide-react'

export function HomeHighlights() {
  const { data } = useQuery({
    queryKey: ['home', 'featured-projects'],
    queryFn: () => fetchProjects({ limit: 3, sort: 'newest' }),
  })

  const featured = data?.data ?? []

  const stats = [
    { label: 'Active projects', value: '50+', icon: BookOpen },
    { label: 'Students', value: '2k+', icon: GraduationCap },
    { label: 'Professors', value: '300+', icon: Users },
    { label: 'Universities', value: '40+', icon: Building2 },
  ] as const

  return (
    <div className="space-y-16">
      {/* Stats */}
      <section aria-label="Platform stats" className="mx-auto max-w-7xl px-4 pt-2 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => {
            const Icon = s.icon
            return (
              <Card
                key={s.label}
                className="group overflow-visible border bg-card opacity-0 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.02] hover:border-primary/40 hover:shadow-lg animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 px-6 pb-2 pt-6">
                  <CardTitle className="min-h-[2.5rem] text-sm font-medium leading-normal text-foreground/80">
                    {s.label}
                  </CardTitle>
                  <div className="rounded-lg bg-primary/10 p-2 transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                    <Icon className="h-4 w-4 shrink-0 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tracking-tight transition-colors duration-200 group-hover:text-primary">
                    {s.value}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Featured projects */}
      <section aria-label="Featured projects" className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Featured projects</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Discover opportunities across disciplines and universities.
            </p>
          </div>
          <Link href="/projects">
            <Button variant="outline">View all</Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {featured.map((p) => (
            <Card key={p.id} className="group overflow-hidden transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-2 text-lg">{p.title}</CardTitle>
                  <Badge variant={p.status === 'OPEN' ? 'default' : 'secondary'}>{p.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="line-clamp-3 text-sm text-muted-foreground">{p.description}</p>
                {p.professor && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Lead:</span>{' '}
                    <span className="font-medium">{p.professor.name}</span>
                  </p>
                )}
                <Link href={`/projects/${p.id}`} className="inline-block">
                  <Button className="mt-2" size="sm">
                    View project
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

