'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { register, type RegisterInput } from '@/core/services'
import { useAuthStore } from '@/lib/auth'
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'

export default function RegisterPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [formData, setFormData] = useState<RegisterInput>({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
    universityId: '',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    registerMutation.mutate(formData)
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Join ResearchHub</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>

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
              <p className="mt-1 text-xs text-muted-foreground">
                At least 8 characters
              </p>
            </div>

            <div>
              <Label htmlFor="role">I am a</Label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as 'STUDENT' | 'PROFESSOR' })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="STUDENT">Student</option>
                <option value="PROFESSOR">Professor</option>
              </select>
            </div>

            <div>
              <Label htmlFor="universityId">University ID (Optional)</Label>
              <Input
                id="universityId"
                type="text"
                value={formData.universityId}
                onChange={(e) => setFormData({ ...formData, universityId: e.target.value })}
                placeholder="e.g., univ-123"
              />
            </div>

            <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? 'Creating account...' : 'Sign Up'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
