'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { fetchProjectById, createApplication } from '@/core/services'
import { Button, Badge, Card, CardContent, Textarea, Label } from '@/components/ui'
import { Calendar, User, Users, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { useAuthStore } from '@/lib/auth'
import { useState } from 'react'

export default function ProjectDetailPage() {
  const params = useParams()
  const queryClient = useQueryClient()
  const { isAuthenticated, user } = useAuthStore()
  const [motivation, setMotivation] = useState('')
  const [showApplicationForm, setShowApplicationForm] = useState(false)

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', params.id],
    queryFn: () => fetchProjectById(params.id as string),
  })

  const applyMutation = useMutation({
    mutationFn: createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', params.id] })
      setShowApplicationForm(false)
      setMotivation('')
      alert('Application submitted successfully!')
    },
    onError: (error: Error) => {
      alert(error.message || 'Failed to submit application')
    },
  })

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!project) return
    applyMutation.mutate({
      projectId: project.id,
      motivation,
    })
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-64 rounded-lg bg-muted" />
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
        <div className="rounded-lg bg-destructive/10 p-4 text-center text-destructive">
          Failed to load project details
        </div>
      </div>
    )
  }

  const canApply = isAuthenticated && user?.role === 'STUDENT' && project.status === 'OPEN'

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/projects">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="text-sm text-muted-foreground">Projects</span>
          </Button>
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {/* Project Title & Summary */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold">{project.title}</h1>
                  <p className="mt-2 text-lg text-muted-foreground">
                    Research opportunity connecting students with cutting-edge academic work
                  </p>
                </div>
                <Badge
                  variant={project.status === 'OPEN' ? 'default' : 'secondary'}
                  className="text-lg"
                >
                  {project.status}
                </Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Project Description */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="mb-4 text-2xl font-semibold">Description</h2>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {project.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Participants/Team Section */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="mb-4 text-2xl font-semibold">Team</h2>
                <div className="space-y-3">
                  {project.professor && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{project.professor.name}</p>
                        <p className="text-sm text-muted-foreground">Project Lead (PI)</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{project.slots} student positions available</p>
                      <p className="text-sm text-muted-foreground">Currently recruiting</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            {/* Project Info Sidebar */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Professor/Lead */}
                  {project.professor && (
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                        Project Lead
                      </h3>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{project.professor.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {project.professor.email}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" className="mt-3 w-full" size="sm">
                        Contact Professor
                      </Button>
                    </div>
                  )}

                  {/* Status & Openings */}
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                      Status & Openings
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Status</span>
                        <Badge variant={project.status === 'OPEN' ? 'default' : 'secondary'}>
                          {project.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Available Slots</span>
                        <span className="font-semibold">{project.slots}</span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Timeline</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Posted: {format(new Date(project.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tags/Keywords */}
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                      Skills & Topics
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Apply Button */}
            {canApply && !showApplicationForm && (
              <Button size="lg" className="w-full" onClick={() => setShowApplicationForm(true)}>
                Apply to Join Project
              </Button>
            )}

            {!isAuthenticated && project.status === 'OPEN' && (
              <Card className="bg-muted/50">
                <CardContent className="pt-6 text-center">
                  <p className="mb-4 text-sm text-muted-foreground">
                    Sign in to apply to this research project
                  </p>
                  <Link href="/login">
                    <Button className="w-full">Sign In</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Application Form */}
      {canApply && showApplicationForm && (
        <Card className="mt-8">
          <CardContent className="pt-6">
            <h2 className="mb-4 text-2xl font-semibold">Apply to Join Project</h2>
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <Label htmlFor="motivation">Motivation Statement</Label>
                <p className="mb-2 text-sm text-muted-foreground">
                  Explain why you are interested in this project (50-1000 characters)
                </p>
                <Textarea
                  id="motivation"
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  placeholder="Describe your background, skills, and why this project interests you..."
                  rows={8}
                  required
                  minLength={50}
                  maxLength={1000}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={applyMutation.isPending} className="flex-1">
                  {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowApplicationForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
