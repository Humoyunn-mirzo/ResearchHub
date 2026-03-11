'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/core/domain'

type AuthState = {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  setAuthFromCookies: (user: User) => void
  clearAuth: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) =>
        set(() => ({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        })),
      setAuthFromCookies: (user) =>
        set(() => ({
          user,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: true,
        })),
      clearAuth: () =>
        set(() => ({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })),
      updateUser: (userUpdate) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userUpdate } : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
)
