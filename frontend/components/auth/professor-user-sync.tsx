'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCurrentUser } from '@/core/services'
import { useAuthStore } from '@/lib/auth'

/**
 * Keeps persisted auth user in sync with the server for professors.
 * Admin approval updates DB only; JWT / localStorage still held the old professorStatus until refresh.
 */
export function ProfessorUserSync() {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const updateUser = useAuthStore((s) => s.updateUser)

  const { data } = useQuery({
    queryKey: ['auth', 'me', 'professor-sync'],
    queryFn: getCurrentUser,
    enabled: isAuthenticated && user?.role === 'PROFESSOR',
    staleTime: 0,
    refetchOnWindowFocus: true,
  })

  useEffect(() => {
    if (!data || user?.id !== data.id) return
    updateUser({
      name: data.name,
      email: data.email,
      role: data.role,
      universityId: data.universityId,
      createdAt: data.createdAt,
      professorStatus: data.professorStatus,
    })
  }, [data, user?.id, updateUser])

  return null
}
