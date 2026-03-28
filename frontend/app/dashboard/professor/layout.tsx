import type { ReactNode } from 'react'
import { ProfessorUserSync } from '@/components/auth/professor-user-sync'

export default function ProfessorDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ProfessorUserSync />
      {children}
    </>
  )
}
