'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { login, register, registerProfessor, bootstrap, checkBootstrapAvailable, getCurrentUser, type LoginInput, type RegisterInput } from '@/core/services'
import { useAuthStore } from '@/lib/auth'
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui'
import { env } from '@/lib/env'

type Mode = 'login' | 'register' | 'bootstrap'

function getOAuthUrl(): string {
  const base = env.NEXT_PUBLIC_API_URL.startsWith('http')
    ? env.NEXT_PUBLIC_API_URL
    : (typeof window !== 'undefined' ? window.location.origin : '') + env.NEXT_PUBLIC_API_URL
  return `${base}/oauth2/authorization/google`
}

export function AuthShell({ mode }: { mode: Mode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from')
  const oauthSuccess = searchParams.get('oauth') === 'success'
  const oauthError = searchParams.get('error')
  const { setAuth, setAuthFromCookies } = useAuthStore()

  const [loginData, setLoginData] = useState<LoginInput>({ email: '', password: '' })

  const showBootstrap = searchParams.get('bootstrap') === '1'

  const { data: bootstrapStatus } = useQuery({
    queryKey: ['bootstrap-available'],
    queryFn: checkBootstrapAvailable,
    enabled: true,
    staleTime: 60_000,
  })
  const [registerData, setRegisterData] = useState<RegisterInput & { fieldOfStudy?: string }>({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
    universityId: '',
    fieldOfStudy: 'General',
  })
  const [cvFile, setCvFile] = useState<File | null>(null)

  const redirectTo = useMemo(() => {
    // Default post-auth route per spec: students → projects, professors/admins → dashboard
    return from || '/dashboard'
  }, [from])

  const { refetch: fetchUserForOAuth } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getCurrentUser,
    enabled: false,
  })

  useEffect(() => {
    if (oauthSuccess) {
      fetchUserForOAuth()
        .then((result) => {
          if (result.data) {
            setAuthFromCookies(result.data)
            router.replace(redirectTo)
          } else {
            router.replace('/login?error=oauth_failed')
          }
        })
        .catch(() => {
          router.replace('/login?error=oauth_failed')
        })
    }
  }, [oauthSuccess, fetchUserForOAuth, setAuthFromCookies, router, redirectTo])

  useEffect(() => {
    if (oauthError === 'oauth_failed') {
      alert('Google sign-in failed. Please try again.')
      router.replace('/login')
    } else if (oauthError === 'oauth_email_missing') {
      alert('Could not get email from Google. Please try another account or sign up with email.')
      router.replace('/login')
    }
  }, [oauthError, router])

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken)
      router.push(redirectTo)
    },
    onError: (error: Error) => {
      alert(error.message || 'Login failed. Please check your credentials.')
    },
  })

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken)
      router.push(redirectTo)
    },
    onError: (error: Error) => {
      alert(error.message || 'Registration failed. Please try again.')
    },
  })

  const registerProfessorMutation = useMutation({
    mutationFn: registerProfessor,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken)
      router.push(redirectTo)
    },
    onError: (error: Error) => {
      alert(error.message || 'Registration failed. Please try again.')
    },
  })

  const bootstrapMutation = useMutation({
    mutationFn: bootstrap,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken)
      router.push(redirectTo)
    },
    onError: (error: Error) => {
      alert(error.message || 'Bootstrap failed. Please try again.')
    },
  })

  if (oauthSuccess) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Signing you in...</p>
        </div>
      </div>
    )
  }

  const onSwitch = (next: Mode) => {
    if (next === 'bootstrap') {
      router.push('/login?bootstrap=1')
      return
    }
    router.push(next === 'login' ? '/login' : '/register')
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{mode === 'login' ? 'Welcome back' : 'Create your account'}</CardTitle>
            <Badge variant="secondary">ResearchHub</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {mode === 'login'
              ? 'Sign in to access your dashboard and apply to projects.'
              : 'Join as a student or professor to collaborate on research projects.'}
          </p>

          <div className={`grid gap-2 ${bootstrapStatus?.available ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <Button
              type="button"
              variant={mode === 'login' && !showBootstrap ? 'default' : 'outline'}
              onClick={() => onSwitch('login')}
            >
              Sign in
            </Button>
            <Button
              type="button"
              variant={mode === 'register' ? 'default' : 'outline'}
              onClick={() => onSwitch('register')}
            >
              Sign up
            </Button>
            {bootstrapStatus?.available && (
              <Button
                type="button"
                variant={showBootstrap ? 'default' : 'outline'}
                onClick={() => onSwitch('bootstrap')}
              >
                Create first admin
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {showBootstrap && bootstrapStatus?.available ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                bootstrapMutation.mutate(loginData)
              }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground">
                No users exist yet. Create the first admin account to get started.
              </p>
              <div>
                <Label htmlFor="bootstrap-email">Email</Label>
                <Input
                  id="bootstrap-email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  placeholder="admin@your-domain.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="bootstrap-password">Password</Label>
                <Input
                  id="bootstrap-password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                <p className="mt-1 text-xs text-muted-foreground">At least 8 characters</p>
              </div>
              <Button type="submit" className="w-full" disabled={bootstrapMutation.isPending}>
                {bootstrapMutation.isPending ? 'Creating admin…' : 'Create first admin'}
              </Button>
            </form>
          ) : mode === 'login' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                loginMutation.mutate(loginData)
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  placeholder="your.email@university.edu"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => { window.location.href = getOAuthUrl() }}
              >
                Sign in with Google
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="font-medium text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (registerData.role === 'PROFESSOR') {
                  if (!cvFile) {
                    alert('Please upload your CV (PDF, DOC, or DOCX)')
                    return
                  }
                  registerProfessorMutation.mutate({
                    name: registerData.name,
                    email: registerData.email,
                    password: registerData.password,
                    fieldOfStudy: registerData.fieldOfStudy || 'General',
                    universityId: registerData.universityId || undefined,
                    cvFile,
                  })
                } else {
                  registerMutation.mutate({
                    name: registerData.name,
                    email: registerData.email,
                    password: registerData.password,
                    role: 'STUDENT',
                    universityId: registerData.universityId || undefined,
                  })
                }
              }}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    placeholder="your.email@university.edu"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">At least 8 characters</p>
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    value={registerData.role}
                    onChange={(e) => {
                      const role = e.target.value as 'STUDENT' | 'PROFESSOR'
                      setRegisterData({ ...registerData, role })
                      if (role === 'STUDENT') setCvFile(null)
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                  >
                    <option value="STUDENT">Student</option>
                    <option value="PROFESSOR">Professor</option>
                  </select>
                </div>

                {registerData.role === 'PROFESSOR' && (
                  <>
                    <div className="sm:col-span-2">
                      <Label htmlFor="cv">CV (required)</Label>
                      <Input
                        id="cv"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
                        required={registerData.role === 'PROFESSOR'}
                        className="cursor-pointer"
                      />
                      <p className="mt-1 text-xs text-muted-foreground">PDF, DOC, or DOCX. Max 10MB.</p>
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="fieldOfStudy">Field of study (optional)</Label>
                      <Input
                        id="fieldOfStudy"
                        type="text"
                        value={registerData.fieldOfStudy ?? 'General'}
                        onChange={(e) => setRegisterData({ ...registerData, fieldOfStudy: e.target.value })}
                        placeholder="e.g., Computer Science"
                      />
                    </div>
                  </>
                )}

                <div className="sm:col-span-2">
                  <Label htmlFor="universityId">University ID (optional)</Label>
                  <Input
                    id="universityId"
                    type="text"
                    value={registerData.universityId}
                    onChange={(e) => setRegisterData({ ...registerData, universityId: e.target.value })}
                    placeholder="e.g., univ-123"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={
                  registerData.role === 'PROFESSOR'
                    ? registerProfessorMutation.isPending
                    : registerMutation.isPending
                }
              >
                {registerData.role === 'PROFESSOR'
                  ? registerProfessorMutation.isPending
                    ? 'Creating account…'
                    : 'Sign up (pending approval)'
                  : registerMutation.isPending
                    ? 'Creating account…'
                    : 'Sign up'}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

