'use client'

import { useAuthStore } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from '@/components/ui'
import { ArrowLeft } from 'lucide-react'
import { updateAccountProfile } from '@/core/services'

export default function AccountPage() {
  const { user, isAuthenticated, updateUser } = useAuthStore()
  const router = useRouter()
  const [name, setName] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (user) setName(user.name)
  }, [isAuthenticated, user, router])

  const saveMutation = useMutation({
    mutationFn: () =>
      updateAccountProfile(user!.id, user!.role, { name: name.trim() || undefined }),
    onSuccess: () => {
      updateUser({ name: name.trim() })
    },
    onError: (err: Error) => alert(err.message || 'Failed to save'),
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    saveMutation.mutate()
  }

  if (!isAuthenticated || !user) return null

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/dashboard"
          className="rounded-lg border p-2 transition-colors hover:bg-accent"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account settings</h1>
          <p className="text-muted-foreground">Update your profile information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user.email} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Display name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Role:</span> {user.role}
            </div>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
