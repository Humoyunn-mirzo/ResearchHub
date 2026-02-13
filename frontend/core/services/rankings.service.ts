import { env } from '@/lib/env'
import { apiClient } from '@/lib/api'

export type RankingCategory = 'students' | 'professors' | 'projects' | 'universities'

export type RankingEntry = {
  rank: number
  name: string
  subtitle?: string
  valueLabel: string
  href?: string
}

const mockRankings: Record<RankingCategory, RankingEntry[]> = {
  students: [
    { rank: 1, name: 'Nargiza Akhmedova', subtitle: 'Central Asia University', valueLabel: 'Points: 128' },
    { rank: 2, name: 'Elena Petrova', subtitle: 'EU Tech Institute', valueLabel: 'Points: 121' },
    { rank: 3, name: 'Bekzod Rustamov', subtitle: 'Central Asia University', valueLabel: 'Points: 117' },
    { rank: 4, name: 'Aruzhan Saparova', subtitle: 'Steppe State University', valueLabel: 'Points: 103' },
    { rank: 5, name: 'Marek Nowak', subtitle: 'EU Tech Institute', valueLabel: 'Points: 97' },
  ],
  professors: [
    { rank: 1, name: 'Dr. Amina Karimova', subtitle: 'Central Asia University', valueLabel: 'Projects: 8' },
    { rank: 2, name: 'Prof. Lukas Weber', subtitle: 'EU Tech Institute', valueLabel: 'Projects: 7' },
    { rank: 3, name: 'Prof. Daniel Chen', subtitle: 'Global Research Lab', valueLabel: 'Projects: 6' },
    { rank: 4, name: 'Dr. Sofia Rossi', subtitle: 'EU Tech Institute', valueLabel: 'Projects: 5' },
  ],
  projects: [
    { rank: 1, name: 'Machine Learning for Climate Prediction', subtitle: 'Applicants: 24', valueLabel: 'Openings: 3', href: '/projects/proj-1' },
    { rank: 2, name: 'NLP for Policy Analysis', subtitle: 'Applicants: 19', valueLabel: 'Openings: 2', href: '/projects/proj-2' },
    { rank: 3, name: 'Data Visualization for Research Impact', subtitle: 'Applicants: 15', valueLabel: 'Openings: 4', href: '/projects/proj-4' },
  ],
  universities: [
    { rank: 1, name: 'Central Asia University', valueLabel: 'Active Projects: 42' },
    { rank: 2, name: 'EU Tech Institute', valueLabel: 'Active Projects: 37' },
    { rank: 3, name: 'Steppe State University', valueLabel: 'Active Projects: 28' },
  ],
}

export async function fetchRankings(category: RankingCategory): Promise<RankingEntry[]> {
  if (env.NEXT_PUBLIC_DATA_MODE === 'mock') {
    return mockRankings[category]
  }

  const response = await apiClient.get('/rankings', { params: { category } })
  // If/when backend implements this endpoint, validate properly.
  return response.data as RankingEntry[]
}

