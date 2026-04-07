'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { fetchProjectById, createApplication, closeProject, fetchApplications } from '@/core/services'
import { Button, Badge, Card, CardContent, Label, Textarea } from '@/components/ui'
import { Calendar, User, Users, ArrowLeft, Mail, Settings } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { useAuthStore } from '@/lib/auth'
import { useState } from 'react'

type ScreeningQuestion = { question?: string; type?: string; options?: string[] }

export default function ProjectDetailPage() {
  const params = useParams()
  const queryClient = useQueryClient()
  const { isAuthenticated, user } = useAuthStore()
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [screeningAnswers, setScreeningAnswers] = useState<string[]>([])

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', params.id],
    queryFn: () => fetchProjectById(params.id as string),
  })

  const { data: myApplications } = useQuery({
    queryKey: ['applications', 'my', user?.id],
    queryFn: () => fetchApplications({ studentId: user!.id, limit: 50 }),
    enabled: !!user?.id && user?.role === 'STUDENT',
  })

  const applyMutation = useMutation({
    mutationFn: createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', params.id] })
      queryClient.invalidateQueries({ queryKey: ['applications', 'my', user?.id] })
      setShowApplicationForm(false)
      alert('Application submitted successfully!')
    },
    onError: (error: Error) => {
      alert(error.message || 'Failed to submit application')
    },
  })

  const closeMutation = useMutation({
    mutationFn: closeProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', params.id] })
    },
    onError: (error: Error) => {
      alert(error.message || 'Failed to close project')
    },
  })

  const questions = (project?.interviewQuestions ?? []) as ScreeningQuestion[]
  const hasScreeningQuestions = questions.length > 0

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!project) return
    if (hasScreeningQuestions) {
      const allAnswered = questions.every((_, i) => {
        const a = screeningAnswers[i]
        return a != null && a.trim() !== ''
      })
      if (!allAnswered) {
        alert('Please answer all screening questions.')
        return
      }
    }
    applyMutation.mutate({
      projectId: project.id,
      screeningAnswers: hasScreeningQuestions ? screeningAnswers : undefined,
    })
  }

  const handleOpenApplyForm = () => {
    setScreeningAnswers(questions.map(() => ''))
    setShowApplicationForm(true)
  }

  const setAnswer = (index: number, value: string) => {
    setScreeningAnswers((prev) => {
      const next = [...prev]
      next[index] = value
      return next
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

  const isStudent = isAuthenticated && user?.role === 'STUDENT'
  const isProfessorOwner =
    isAuthenticated && user?.role === 'PROFESSOR' && user?.id && project.professorId === user.id
  const hasAppliedToThisProject = (myApplications?.data ?? []).some(
    (a) => a.projectId === project.id
  )
  const canApply = isStudent && project.status === 'OPEN' && !hasAppliedToThisProject

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link href="/projects">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Projects
          </Button>
        </Link>

        {isProfessorOwner && (
          <div className="flex items-center gap-2">
            <Button variant="outline" disabled>
              <Settings className="mr-2 h-4 w-4" />
              Manage (soon)
            </Button>
            <Button
              disabled={project.status !== 'OPEN' || closeMutation.isPending}
              onClick={() => closeMutation.mutate(project.id)}
            >
              {closeMutation.isPending ? 'Closing…' : project.status === 'OPEN' ? 'Close project' : 'Closed'}
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Main */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{project.title}</h1>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <Badge variant={project.status === 'OPEN' ? 'default' : 'secondary'} className="text-base">
                {project.status === 'OPEN' ? 'Open' : 'Closed'}
              </Badge>
            </div>
          </div>

          <Card>
            <CardContent className="prose prose-sm max-w-none pt-6">
              <h2 className="text-2xl font-semibold">Project description</h2>
              <p className="whitespace-pre-wrap text-muted-foreground">{project.description}</p>
            </CardContent>
          </Card>

          {/* Apply section */}
          {canApply && !showApplicationForm && (
            <Button size="lg" className="w-full" onClick={handleOpenApplyForm}>
              Apply to join
            </Button>
          )}

          {canApply && showApplicationForm && (
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleApply} className="space-y-6">
                  {project.professor && project.professorId && (
                    <p className="text-sm text-muted-foreground">
                      Supervising professor:{' '}
                      <Link
                        href={`/professors/${project.professorId}`}
                        className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
                      >
                        {project.professor.name}
                      </Link>
                    </p>
                  )}
                  {hasScreeningQuestions && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Screening Questions</h3>
                      {questions.map((q, idx) => (
                        <div key={idx} className="space-y-2">
                          <Label htmlFor={`screening-${idx}`}>
                            {q.question ?? `Question ${idx + 1}`}
                          </Label>
                          {q.type === 'text' && (
                            <Textarea
                              id={`screening-${idx}`}
                              value={screeningAnswers[idx] ?? ''}
                              onChange={(e) => setAnswer(idx, e.target.value)}
                              placeholder="Your answer..."
                              rows={4}
                              required
                              className="resize-none"
                            />
                          )}
                          {q.type === 'yesno' && (
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`screening-${idx}`}
                                  value="Yes"
                                  checked={(screeningAnswers[idx] ?? '') === 'Yes'}
                                  onChange={() => setAnswer(idx, 'Yes')}
                                  className="h-4 w-4"
                                />
                                <span>Yes</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`screening-${idx}`}
                                  value="No"
                                  checked={(screeningAnswers[idx] ?? '') === 'No'}
                                  onChange={() => setAnswer(idx, 'No')}
                                  className="h-4 w-4"
                                />
                                <span>No</span>
                              </label>
                            </div>
                          )}
                          {q.type === 'choice' && (
                            <select
                              id={`screening-${idx}`}
                              value={screeningAnswers[idx] ?? ''}
                              onChange={(e) => setAnswer(idx, e.target.value)}
                              required
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              <option value="">Select an option</option>
                              {(q.options ?? []).filter(Boolean).map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button type="submit" disabled={applyMutation.isPending} className="flex-1">
                      {applyMutation.isPending ? 'Submitting…' : 'Submit application'}
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
                <p className="mb-4 text-muted-foreground">Sign in to apply to this research project</p>
                <Link href="/login">
                  <Button>Sign in</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {isAuthenticated && !isStudent && project.status === 'OPEN' && !isProfessorOwner && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6 text-center text-sm text-muted-foreground">
                Only students can apply to projects.
              </CardContent>
            </Card>
          )}

          {isStudent && project.status === 'OPEN' && hasAppliedToThisProject && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6 text-center text-sm text-muted-foreground">
                You have already applied to this project. Check your dashboard for the status.
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {project.professor && (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <User className="mt-0.5 h-5 w-5 shrink-0" />
                      <div className="min-w-0 space-y-1">
                        {project.professorId ? (
                          <Link
                            href={`/professors/${project.professorId}`}
                            className="block font-medium text-foreground hover:text-primary hover:underline"
                          >
                            {project.professor.name}
                          </Link>
                        ) : (
                          <span className="font-medium text-foreground">{project.professor.name}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <a
                        className="hover:underline"
                        href={`mailto:${project.professor.email}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {project.professor.email}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-5 w-5" />
                  <span>{project.maxStudents ? `${project.currentStudents}/${project.maxStudents} spots` : 'Open'}</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-5 w-5" />
                  <span>Posted {format(new Date(project.createdAt), 'MMMM d, yyyy')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-sm font-semibold">Tips</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>Highlight relevant coursework and projects.</li>
                <li>Be specific about your skills and availability.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
