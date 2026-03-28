import { apiClient } from '@/lib/api'
import { ProfessorProfileSchema, type ProfessorProfile } from '@/core/domain'

function mapProfessor(raw: Record<string, unknown>): ProfessorProfile {
  return ProfessorProfileSchema.parse({
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    email: raw.email != null ? String(raw.email) : '',
    universityId: raw.universityId != null ? String(raw.universityId) : null,
    fieldOfStudy: raw.fieldOfStudy != null ? String(raw.fieldOfStudy) : null,
    bio: raw.bio != null ? String(raw.bio) : null,
    rankingScore: Number(raw.rankingScore ?? 0),
    totalProjects: Number(raw.totalProjects ?? 0),
    studentsSupervised: Number(raw.studentsSupervised ?? 0),
    acceptanceRate: raw.acceptanceRate != null ? Number(raw.acceptanceRate) : null,
    professorStatus: raw.professorStatus != null ? String(raw.professorStatus) : null,
  })
}

export async function fetchProfessorById(id: string): Promise<ProfessorProfile> {
  const response = await apiClient.get(`/professors/${id}`)
  const body = response.data as { data?: Record<string, unknown> }
  const raw = (body.data ?? response.data) as Record<string, unknown>
  return mapProfessor(raw)
}
