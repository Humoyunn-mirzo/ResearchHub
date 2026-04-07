'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { fetchStudentById } from '@/core/services'
import { useAuthStore } from '@/lib/auth'
import { Button, Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { ArrowLeft, Mail, User, MessageCircle, BookOpen, CheckCircle } from 'lucide-react'

export default function StudentProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const id = params.id as string

  const canMessageStudent = isAuthenticated && user?.role === 'PROFESSOR'

  const { data: student, isLoading, error } = useQuery({
    queryKey: ['student', id],
    queryFn: () => fetchStudentById(id),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-40 rounded-lg bg-muted" />
        </div>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="rounded-lg bg-destructive/10 p-6 text-center text-destructive">
          <p className="font-medium">Could not load this student profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
      <div className="mb-6">
        <Link href="/projects">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Projects
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <User className="h-7 w-7 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-2xl">{student.name}</CardTitle>
                {student.fieldOfInterest && (
                  <p className="mt-1 text-muted-foreground">{student.fieldOfInterest}</p>
                )}
                <Badge variant="outline" className="mt-2">
                  Student
                </Badge>
              </div>
            </div>
            {canMessageStudent && (
              <Button type="button" className="shrink-0" onClick={() => router.push(`/dashboard/messages?with=${student.id}`)}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Message
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {student.email && (
            <a
              href={`mailto:${student.email}`}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Mail className="h-4 w-4 shrink-0" />
              {student.email}
            </a>
          )}
          {student.bio && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{student.bio}</p>
          )}
          <div className="grid gap-3 border-t pt-4 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span>
                <span className="font-medium text-foreground">{student.totalApplications}</span>{' '}
                <span className="text-muted-foreground">applications</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <span>
                <span className="font-medium text-foreground">{student.acceptedProjects}</span>{' '}
                <span className="text-muted-foreground">accepted</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
