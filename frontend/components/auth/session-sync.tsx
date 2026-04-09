'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/auth'
import { getCurrentUser } from '@/core/services'

/**
 * After persisted auth rehydrates, verify the session with the server.
 * Clears stale client state when cookies/JWT expired but localStorage still says "signed in".
 */
export function SessionSync() {
  useEffect(() => {
    const validate = () => {
      const { isAuthenticated, user } = useAuthStore.getState()
      if (!isAuthenticated || !user) return
      void getCurrentUser().catch(() => {
        if (useAuthStore.getState().isAuthenticated) {
          useAuthStore.getState().clearAuth()
        }
      })
    }

    const unsub = useAuthStore.persist.onFinishHydration(validate)
    if (useAuthStore.persist.hasHydrated()) {
      validate()
    }
    return unsub
  }, [])

  return null
}
