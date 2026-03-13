'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/lib/auth'
import { logout } from '@/core/services'
import { ChevronDown, User, Bell, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

type AccountMenuProps = {
  onNavigate?: () => void
}

export function AccountMenu({ onNavigate }: AccountMenuProps = {}) {
  const { user, clearAuth } = useAuthStore()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    void logout().catch(() => null)
    clearAuth()
    window.location.href = '/login'
  }

  if (!user) return null

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm transition-colors hover:bg-accent"
      >
        <span className="font-medium text-foreground">{user.email}</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">{user.role}</span>
        <ChevronDown
          className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border bg-popover shadow-lg">
          <div className="p-2">
            <Link
              href="/dashboard/account"
              onClick={() => {
                setOpen(false)
                onNavigate?.()
              }}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent"
            >
              <User className="h-4 w-4 text-muted-foreground" />
              Profile & account
            </Link>
            <Link
              href="/dashboard/notifications"
              onClick={() => {
                setOpen(false)
                onNavigate?.()
              }}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent"
            >
              <Bell className="h-4 w-4 text-muted-foreground" />
              Notifications
            </Link>
            <Link
              href="/dashboard/settings"
              onClick={() => {
                setOpen(false)
                onNavigate?.()
              }}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              Settings
            </Link>
            <hr className="my-2" />
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onNavigate?.()
                handleLogout()
              }}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-destructive hover:bg-accent"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
