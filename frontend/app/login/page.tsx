'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login, type LoginInput } from '@/core/services'
import { useAuthStore } from '@/lib/auth'
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: '',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation.mutate(formData)
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Sign In to ResearchHub</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@university.edu"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
