import { apiClient } from '@/lib/api'

export type RankingCategory = 'students' | 'professors' | 'projects' | 'universities'

export type RankingEntry = {
  rank: number
  name: string
  subtitle?: string
  valueLabel: string
  href?: string
}

export async function fetchRankings(category: RankingCategory): Promise<RankingEntry[]> {
  const response = await apiClient.get('/rankings', { params: { category } })
  const body = response.data as RankingEntry[] | { data?: RankingEntry[] }
  return Array.isArray(body) ? body : (body.data ?? [])
}

