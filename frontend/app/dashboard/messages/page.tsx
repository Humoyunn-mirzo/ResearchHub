'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  fetchConversations,
  fetchConversationMessages,
  markConversationRead,
  sendConversationMessage,
  startOrGetConversation,
} from '@/core/services'
import { useAuthStore } from '@/lib/auth'
import { Button, Card, CardContent, Textarea, Badge } from '@/components/ui'
import { ArrowLeft, MessageCircle, Send } from 'lucide-react'
import { format } from 'date-fns'

function MessagesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const { user, isAuthenticated } = useAuthStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const listEndRef = useRef<HTMLDivElement>(null)
  const withParam = searchParams.get('with')

  const canUseMessaging =
    isAuthenticated && user && (user.role === 'STUDENT' || user.role === 'PROFESSOR')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?from=/dashboard/messages')
      return
    }
    if (user && user.role !== 'STUDENT' && user.role !== 'PROFESSOR') {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, user, router])

  const { data: inbox, isLoading: inboxLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => fetchConversations(1, 50),
    enabled: !!canUseMessaging,
  })

  useEffect(() => {
    if (!canUseMessaging || !withParam) return
    let cancelled = false
    ;(async () => {
      try {
        const conv = await startOrGetConversation(withParam)
        if (!cancelled) {
          setSelectedId(conv.id)
          queryClient.invalidateQueries({ queryKey: ['conversations'] })
          router.replace('/dashboard/messages', { scroll: false })
        }
      } catch {
        if (!cancelled) router.replace('/dashboard/messages', { scroll: false })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [canUseMessaging, withParam, queryClient, router])

  const { data: messagesPage, isLoading: messagesLoading } = useQuery({
    queryKey: ['conversation-messages', selectedId],
    queryFn: () => fetchConversationMessages(selectedId!, 1, 200),
    enabled: !!selectedId && !!canUseMessaging,
    refetchInterval: selectedId ? 5000 : false,
  })

  useEffect(() => {
    if (!selectedId || !canUseMessaging) return
    markConversationRead(selectedId).catch(() => {})
    queryClient.invalidateQueries({ queryKey: ['conversations'] })
  }, [selectedId, canUseMessaging, queryClient])

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messagesPage?.data])

  const sendMutation = useMutation({
    mutationFn: (text: string) => sendConversationMessage(selectedId!, text),
    onSuccess: () => {
      setDraft('')
      queryClient.invalidateQueries({ queryKey: ['conversation-messages', selectedId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
    onError: (e: Error) => alert(e.message || 'Failed to send'),
  })

  if (!canUseMessaging) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    )
  }

  const conversations = inbox?.data ?? []
  const messages = messagesPage?.data ?? []
  const selectedSummary = conversations.find((c) => c.id === selectedId)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">Chat with {user?.role === 'STUDENT' ? 'professors' : 'students'}.</p>
      </div>

      <div className="grid min-h-[480px] gap-4 md:grid-cols-[minmax(240px,280px)_1fr]">
        <Card className="flex flex-col overflow-hidden">
          <CardContent className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
            {inboxLoading ? (
              <p className="p-4 text-sm text-muted-foreground">Loading conversations…</p>
            ) : conversations.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No conversations yet. Start from a profile page.</p>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition hover:bg-muted/60 ${
                    selectedId === c.id ? 'border-primary bg-primary/5' : 'border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{c.otherParty.name}</span>
                    {c.unreadCount > 0 && (
                      <Badge variant="default" className="h-5 min-w-5 px-1 text-xs">
                        {c.unreadCount}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {c.lastMessagePreview || 'No messages yet'}
                  </p>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col overflow-hidden">
          <CardContent className="flex flex-1 flex-col p-0">
            {!selectedId ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
                <MessageCircle className="h-10 w-10 opacity-50" />
                <p>Select a conversation or open Messages from a profile.</p>
              </div>
            ) : (
              <>
                <div className="border-b px-4 py-3">
                  <p className="font-semibold">{selectedSummary?.otherParty.name ?? 'Conversation'}</p>
                  <p className="text-xs text-muted-foreground">{selectedSummary?.otherParty.email}</p>
                </div>
                <div className="flex max-h-[min(50vh,420px)] flex-1 flex-col gap-2 overflow-y-auto p-4">
                  {messagesLoading ? (
                    <p className="text-sm text-muted-foreground">Loading messages…</p>
                  ) : (
                    messages.map((m) => {
                      const mine = m.senderId === user?.id
                      return (
                        <div
                          key={m.id}
                          className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                            mine ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{m.body}</p>
                          <p
                            className={`mt-1 text-[10px] ${mine ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}
                          >
                            {format(m.createdAt, 'MMM d, h:mm a')}
                          </p>
                        </div>
                      )
                    })
                  )}
                  <div ref={listEndRef} />
                </div>
                <form
                  className="border-t p-3"
                  onSubmit={(e) => {
                    e.preventDefault()
                    const text = draft.trim()
                    if (!text || sendMutation.isPending) return
                    sendMutation.mutate(text)
                  }}
                >
                  <div className="flex gap-2">
                    <Textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Write a message…"
                      rows={2}
                      className="min-h-[72px] resize-none"
                      maxLength={5000}
                    />
                    <Button type="submit" disabled={!draft.trim() || sendMutation.isPending} className="shrink-0 self-end">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-4 py-12 text-muted-foreground">Loading messages…</div>
      }
    >
      <MessagesPageContent />
    </Suspense>
  )
}
