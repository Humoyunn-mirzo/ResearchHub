'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { login, register, type LoginInput, type RegisterInput } from '@/core/services'
import { useAuthStore } from '@/lib/auth'
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui'

type Mode = 'login' | 'register'

export function AuthShell({ mode }: { mode: Mode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from')
  const { setAuth } = useAuthStore()

  const [loginData, setLoginData] = useState<LoginInput>({ email: '', password: '' })
  const [registerData, setRegisterData] = useState<RegisterInput>({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
    universityId: '',
  })

  const redirectTo = useMemo(() => {
    // Default post-auth route per spec: students → projects, professors/admins → dashboard
    return from || '/dashboard'
  }, [from])

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

  const onSwitch = (next: Mode) => {
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

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={mode === 'login' ? 'default' : 'outline'}
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
          </div>
        </CardHeader>

        <CardContent>
          {mode === 'login' ? (
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
                registerMutation.mutate(registerData)
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
                    onChange={(e) =>
                      setRegisterData({ ...registerData, role: e.target.value as 'STUDENT' | 'PROFESSOR' })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                  >
                    <option value="STUDENT">Student</option>
                    <option value="PROFESSOR">Professor</option>
                  </select>
                </div>

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

              <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? 'Creating account…' : 'Sign up'}
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

