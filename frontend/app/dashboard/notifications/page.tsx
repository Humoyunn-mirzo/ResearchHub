'use client'

import { useAuthStore } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { ArrowLeft, Bell } from 'lucide-react'

export default function NotificationsPage() {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

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
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Manage your notification preferences</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Notification preferences are coming soon. You will be able to choose how to receive
            updates about applications, new projects, and messages.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
