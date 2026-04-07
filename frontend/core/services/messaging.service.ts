import { apiClient } from '@/lib/api'
import {
  ChatMessageSchema,
  ConversationSummarySchema,
  type ChatMessage,
  type ConversationSummary,
} from '@/core/domain'

type PageBody = {
  data?: unknown[]
  pagination?: { number: number; size: number; totalElements: number }
}

function mapPage<T>(body: PageBody, mapItem: (raw: unknown) => T): { data: T[]; total: number; page: number; limit: number } {
  const items = Array.isArray(body.data) ? body.data : []
  const pagination = body.pagination ?? { number: 0, size: 20, totalElements: items.length }
  return {
    data: items.map(mapItem),
    total: Number(pagination.totalElements),
    page: Number(pagination.number) + 1,
    limit: Number(pagination.size),
  }
}

export async function fetchConversations(page = 1, limit = 20): Promise<{
  data: ConversationSummary[]
  total: number
  page: number
  limit: number
}> {
  const response = await apiClient.get('/conversations', {
    params: { page: page - 1, size: limit },
  })
  return mapPage(response.data as PageBody, (raw) => ConversationSummarySchema.parse(raw))
}

export async function startOrGetConversation(participantId: string): Promise<ConversationSummary> {
  const response = await apiClient.post('/conversations', { participantId })
  const body = response.data as { data?: unknown }
  return ConversationSummarySchema.parse(body.data ?? response.data)
}

export async function fetchConversationMessages(
  conversationId: string,
  page = 1,
  limit = 100
): Promise<{ data: ChatMessage[]; total: number; page: number; limit: number }> {
  const response = await apiClient.get(`/conversations/${conversationId}/messages`, {
    params: { page: page - 1, size: limit },
  })
  return mapPage(response.data as PageBody, (raw) => ChatMessageSchema.parse(raw))
}

export async function sendConversationMessage(conversationId: string, body: string): Promise<ChatMessage> {
  const response = await apiClient.post(`/conversations/${conversationId}/messages`, { body })
  const resBody = response.data as { data?: unknown }
  return ChatMessageSchema.parse(resBody.data ?? response.data)
}

export async function markConversationRead(conversationId: string): Promise<void> {
  await apiClient.post(`/conversations/${conversationId}/read`)
}
