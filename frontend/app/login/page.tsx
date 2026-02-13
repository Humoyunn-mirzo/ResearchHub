import { Suspense } from 'react'
import { AuthShell } from '@/components/auth/auth-shell'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[calc(100vh-200px)] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
      <AuthShell mode="login" />
    </Suspense>
  )
}
