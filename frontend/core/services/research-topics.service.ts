import { apiClient } from '@/lib/api'
import { ResearchTopicSchema, type ResearchTopic } from '@/core/domain'

function parseTopicsPayload(body: unknown): ResearchTopic[] {
  const raw = body as { data?: unknown }
  const arr = Array.isArray(raw.data) ? raw.data : []
  return arr.map((item) => ResearchTopicSchema.parse(item))
}

export async function fetchResearchTopics(): Promise<ResearchTopic[]> {
  const response = await apiClient.get('/research-topics')
  return parseTopicsPayload(response.data)
}

export async function adminFetchResearchTopics(): Promise<ResearchTopic[]> {
  const response = await apiClient.get('/admin/research-topics')
  return parseTopicsPayload(response.data)
}

export async function adminCreateResearchTopic(input: {
  name: string
  sortOrder?: number
}): Promise<ResearchTopic> {
  const response = await apiClient.post('/admin/research-topics', input)
  const body = response.data as { data?: unknown }
  return ResearchTopicSchema.parse(body.data)
}

export async function adminUpdateResearchTopic(
  id: string,
  input: { name?: string; sortOrder?: number }
): Promise<ResearchTopic> {
  const response = await apiClient.patch(`/admin/research-topics/${id}`, input)
  const body = response.data as { data?: unknown }
  return ResearchTopicSchema.parse(body.data)
}

export async function adminDeleteResearchTopic(id: string): Promise<void> {
  await apiClient.delete(`/admin/research-topics/${id}`)
}
