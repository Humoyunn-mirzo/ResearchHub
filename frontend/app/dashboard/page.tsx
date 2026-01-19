'use client'

import { useAuthStore } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Redirect based on role
    switch (user?.role) {
      case 'STUDENT':
        router.push('/dashboard/student')
        break
      case 'PROFESSOR':
        router.push('/dashboard/professor')
        break
      case 'UNIVERSITY_ADMIN':
      case 'PLATFORM_ADMIN':
        router.push('/dashboard/admin')
        break
      default:
        router.push('/')
    }
  }, [isAuthenticated, user, router])

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
      <div className="text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  )
}
