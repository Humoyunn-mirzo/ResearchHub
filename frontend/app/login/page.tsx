'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { login, register, type LoginInput, type RegisterInput } from '@/core/services'
import { useAuthStore } from '@/lib/auth'
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'

type TabType = 'signin' | 'signup'

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [activeTab, setActiveTab] = useState<TabType>('signin')
  
  const [loginData, setLoginData] = useState<LoginInput>({
    email: '',
    password: '',
  })

  const [registerData, setRegisterData] = useState<RegisterInput>({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
    universityId: '',
  })

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken)
      router.push('/dashboard')
    },
    onError: (error: Error) => {
      alert(error.message || 'Login failed. Please check your credentials.')
    },
  })

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken)
      router.push('/dashboard')
    },
    onError: (error: Error) => {
      alert(error.message || 'Registration failed. Please try again.')
    },
  })

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation.mutate(loginData)
  }

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    registerMutation.mutate(registerData)
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">ResearchHub</CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            Join the research network
          </p>
        </CardHeader>
        <CardContent>
          {/* Tabs */}
          <div className="mb-6 flex border-b">
            <button
              type="button"
              onClick={() => setActiveTab('signin')}
              className={`flex-1 border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === 'signin'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:border-muted-foreground/50'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('signup')}
              className={`flex-1 border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === 'signup'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:border-muted-foreground/50'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Sign In Form */}
          {activeTab === 'signin' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <Label htmlFor="login-email">Email Address</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  placeholder="your.email@university.edu"
                  required
                />
              </div>

              <div>
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                <a
                  href="#"
                  className="mt-1 block text-xs text-primary hover:underline"
                  onClick={(e) => {
                    e.preventDefault()
                    // TODO: Implement forgot password
                  }}
                >
                  Forgot Password?
                </a>
              </div>

              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          )}

          {/* Sign Up Form */}
          {activeTab === 'signup' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <Label htmlFor="register-name">Full Name</Label>
                <Input
                  id="register-name"
                  type="text"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <Label htmlFor="register-email">Email Address</Label>
                <Input
                  id="register-email"
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  placeholder="your.email@university.edu"
                  required
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Use your institutional email for professors
                </p>
              </div>

              <div>
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  At least 8 characters
                </p>
              </div>

              <div>
                <Label htmlFor="register-role">I am a</Label>
                <select
                  id="register-role"
                  value={registerData.role}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      role: e.target.value as 'STUDENT' | 'PROFESSOR',
                    })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="STUDENT">Student</option>
                  <option value="PROFESSOR">Professor</option>
                </select>
              </div>

              <div>
                <Label htmlFor="register-university">University ID (Optional)</Label>
                <Input
                  id="register-university"
                  type="text"
                  value={registerData.universityId}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, universityId: e.target.value })
                  }
                  placeholder="e.g., univ-123"
                />
              </div>

              <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? 'Creating account...' : 'Sign Up'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
