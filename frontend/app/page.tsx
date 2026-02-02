'use client'

import Link from 'next/link'
import { Button, Card, CardContent } from '@/components/ui'
import { ArrowRight, BookOpen, Users, TrendingUp, GraduationCap, Building2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchProjects } from '@/core/services'
import { ProjectCard } from '@/components/shared/project-card'

export default function HomePage() {
  // Fetch featured projects (first 6 open projects)
  const { data: featuredProjects } = useQuery({
    queryKey: ['projects', 'featured'],
    queryFn: () => fetchProjects({ status: 'OPEN', limit: 6, page: 1 }),
  })

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 via-primary/5 to-background py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Connect with Research Opportunities
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Join the premier platform connecting students and professors for groundbreaking
              research opportunities. Transform your academic journey today.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/projects">
                <Button size="lg">
                  Explore Projects
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Overview Section */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {featuredProjects?.total || '0+'}
                    </p>
                    <p className="text-sm text-muted-foreground">Active Projects</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">1,000+</p>
                    <p className="text-sm text-muted-foreground">Student Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">200+</p>
                    <p className="text-sm text-muted-foreground">Professors</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">50+</p>
                    <p className="text-sm text-muted-foreground">Universities</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Featured Research Projects
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Discover exciting research opportunities from top universities
            </p>
          </div>

          {featuredProjects && featuredProjects.data.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.data.slice(0, 6).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <p className="text-muted-foreground">No featured projects available at the moment</p>
            </div>
          )}

          <div className="mt-12 text-center">
            <Link href="/projects">
              <Button size="lg" variant="outline">
                View All Projects
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why Choose ResearchHub?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to find or offer research opportunities
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-6 text-xl font-semibold">Diverse Projects</h3>
              <p className="mt-2 text-muted-foreground">
                Access a wide range of research projects across multiple disciplines and
                universities.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-6 text-xl font-semibold">Expert Professors</h3>
              <p className="mt-2 text-muted-foreground">
                Connect with leading academics and gain invaluable research experience.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-6 text-xl font-semibold">Track Progress</h3>
              <p className="mt-2 text-muted-foreground">
                Monitor applications, rankings, and research outcomes in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight">Ready to start your journey?</h2>
          <p className="mt-4 text-lg opacity-90">
            Join thousands of students and professors collaborating on ResearchHub
          </p>
          <div className="mt-8">
            <Link href="/register">
              <Button size="lg" variant="secondary">
                Sign Up Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
