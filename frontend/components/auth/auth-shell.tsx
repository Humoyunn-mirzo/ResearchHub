'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { login, register, registerProfessor, bootstrap, checkBootstrapAvailable, getCurrentUser, type LoginInput, type RegisterInput } from '@/core/services'
import { useAuthStore } from '@/lib/auth'
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui'
import { env } from '@/lib/env'
import { useTranslation } from '@/lib/i18n'

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
  const { t } = useTranslation()

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
      alert(t('auth.googleFailed'))
      router.replace('/login')
    } else if (oauthError === 'oauth_email_missing') {
      alert(t('auth.googleEmailMissing'))
      router.replace('/login')
    }
  }, [oauthError, router, t])

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken)
      router.push(redirectTo)
    },
    onError: (error: Error) => {
      alert(error.message || t('auth.loginFailed'))
    },
  })

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken)
      router.push(redirectTo)
    },
    onError: (error: Error) => {
      alert(error.message || t('auth.registerFailed'))
    },
  })

  const registerProfessorMutation = useMutation({
    mutationFn: registerProfessor,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken)
      router.push(redirectTo)
    },
    onError: (error: Error) => {
      alert(error.message || t('auth.registerFailed'))
    },
  })

  const bootstrapMutation = useMutation({
    mutationFn: bootstrap,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken)
      router.push(redirectTo)
    },
    onError: (error: Error) => {
      alert(error.message || t('auth.bootstrapFailed'))
    },
  })

  if (oauthSuccess) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">{t('auth.signingYouIn')}</p>
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
            <CardTitle className="text-2xl">
              {mode === 'login' ? t('auth.welcomeBack') : t('auth.createAccount')}
            </CardTitle>
            <Badge variant="secondary">ResearchHub</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {mode === 'login' ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
          </p>

          <div className={`grid gap-2 ${bootstrapStatus?.available ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <Button
              type="button"
              variant={mode === 'login' && !showBootstrap ? 'default' : 'outline'}
              onClick={() => onSwitch('login')}
            >
              {t('auth.signIn')}
            </Button>
            <Button
              type="button"
              variant={mode === 'register' ? 'default' : 'outline'}
              onClick={() => onSwitch('register')}
            >
              {t('auth.signUp')}
            </Button>
            {bootstrapStatus?.available && (
              <Button
                type="button"
                variant={showBootstrap ? 'default' : 'outline'}
                onClick={() => onSwitch('bootstrap')}
              >
                {t('auth.createFirstAdmin')}
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
              <p className="text-sm text-muted-foreground">{t('auth.bootstrapHint')}</p>
              <div>
                <Label htmlFor="bootstrap-email">{t('auth.email')}</Label>
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
                <Label htmlFor="bootstrap-password">{t('auth.password')}</Label>
                <Input
                  id="bootstrap-password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                <p className="mt-1 text-xs text-muted-foreground">{t('auth.passwordHint')}</p>
              </div>
              <Button type="submit" className="w-full" disabled={bootstrapMutation.isPending}>
                {bootstrapMutation.isPending ? t('auth.creatingAdmin') : t('auth.createFirstAdmin')}
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
                <Label htmlFor="email">{t('auth.email')}</Label>
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
                <Label htmlFor="password">{t('auth.password')}</Label>
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
                {loginMutation.isPending ? t('auth.signingIn') : t('auth.signIn')}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {t('auth.orContinueWith')}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => { window.location.href = getOAuthUrl() }}
              >
                {t('auth.googleSignIn')}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                {t('auth.noAccount')}{' '}
                <Link href="/register" className="font-medium text-primary hover:underline">
                  {t('auth.signUp')}
                </Link>
              </p>
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (registerData.role === 'PROFESSOR') {
                  if (!cvFile) {
                    alert(t('auth.cvRequired'))
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
                  <Label htmlFor="name">{t('auth.fullName')}</Label>
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
                  <Label htmlFor="reg-email">{t('auth.email')}</Label>
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
                  <Label htmlFor="reg-password">{t('auth.password')}</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">{t('auth.passwordHint')}</p>
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="role">{t('auth.role')}</Label>
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
                    <option value="STUDENT">{t('auth.roleStudent')}</option>
                    <option value="PROFESSOR">{t('auth.roleProfessor')}</option>
                  </select>
                </div>

                {registerData.role === 'PROFESSOR' && (
                  <>
                    <div className="sm:col-span-2">
                      <Label htmlFor="cv">{t('auth.cvLabel')}</Label>
                      <Input
                        id="cv"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
                        required={registerData.role === 'PROFESSOR'}
                        className="cursor-pointer"
                      />
                      <p className="mt-1 text-xs text-muted-foreground">{t('auth.cvHint')}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="fieldOfStudy">{t('auth.fieldOfStudy')}</Label>
                      <Input
                        id="fieldOfStudy"
                        type="text"
                        value={registerData.fieldOfStudy ?? 'General'}
                        onChange={(e) => setRegisterData({ ...registerData, fieldOfStudy: e.target.value })}
                        placeholder={t('auth.fieldOfStudyPlaceholder')}
                      />
                    </div>
                  </>
                )}

                <div className="sm:col-span-2">
                  <Label htmlFor="universityId">{t('auth.universityId')}</Label>
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
                    ? t('auth.creatingAccount')
                    : t('auth.signUpPending')
                  : registerMutation.isPending
                    ? t('auth.creatingAccount')
                    : t('auth.signUp')}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                {t('auth.haveAccount')}{' '}
                <Link href="/login" className="font-medium text-primary hover:underline">
                  {t('auth.signIn')}
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

