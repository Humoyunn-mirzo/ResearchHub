import { z } from 'zod'

export const PartyInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string(),
})

export type PartyInfo = z.infer<typeof PartyInfoSchema>

export const ConversationSummarySchema = z.object({
  id: z.string(),
  otherParty: PartyInfoSchema,
  lastMessagePreview: z.string(),
  lastMessageAt: z.union([z.coerce.date(), z.null()]).optional(),
  unreadCount: z.coerce.number(),
})

export type ConversationSummary = z.infer<typeof ConversationSummarySchema>

export const ChatMessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  senderId: z.string(),
  body: z.string(),
  createdAt: z.coerce.date(),
})

export type ChatMessage = z.infer<typeof ChatMessageSchema>
