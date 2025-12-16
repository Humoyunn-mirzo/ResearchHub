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
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
      <Link href="/projects">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
      </Link>

      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">{project.title}</h1>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <Badge variant={project.status === 'OPEN' ? 'default' : 'secondary'} className="text-lg">
            {project.status}
          </Badge>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {project.professor && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-5 w-5" />
                  <span className="font-medium">{project.professor.name}</span>
                  <span>({project.professor.email})</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-5 w-5" />
                <span>{project.slots} slots available</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-5 w-5" />
                <span>Posted on {format(new Date(project.createdAt), 'MMMM d, yyyy')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="prose prose-sm max-w-none pt-6">
            <h2 className="text-2xl font-semibold">Description</h2>
            <p className="whitespace-pre-wrap text-muted-foreground">{project.description}</p>
          </CardContent>
        </Card>

        {canApply && !showApplicationForm && (
          <Button size="lg" className="w-full" onClick={() => setShowApplicationForm(true)}>
            Apply to This Project
          </Button>
        )}

        {canApply && showApplicationForm && (
          <Card>
            <CardContent className="pt-6">
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

        {!isAuthenticated && project.status === 'OPEN' && (
          <Card className="bg-muted/50">
            <CardContent className="pt-6 text-center">
              <p className="mb-4 text-muted-foreground">
                Sign in to apply to this research project
              </p>
              <Link href="/login">
                <Button>Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
