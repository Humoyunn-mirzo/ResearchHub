import { apiClient } from '@/lib/api'
import { env } from '@/lib/env'
import {
  ProfessorProfileSchema,
  type ProfessorProfile,
  type ProfessorProfileUpdate,
} from '@/core/domain'

function optionalString(value: unknown): string | null {
  return value != null ? String(value) : null
}

function mapProfessor(raw: Record<string, unknown>): ProfessorProfile {
  return ProfessorProfileSchema.parse({
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    email: raw.email != null ? String(raw.email) : '',
    universityId: optionalString(raw.universityId),
    universityName: optionalString(raw.universityName),
    fieldOfStudy: optionalString(raw.fieldOfStudy),
    bio: optionalString(raw.bio),
    title: optionalString(raw.title),
    department: optionalString(raw.department),
    officeLocation: optionalString(raw.officeLocation),
    phone: optionalString(raw.phone),
    websiteUrl: optionalString(raw.websiteUrl),
    researchInterests: optionalString(raw.researchInterests),
    hasProfilePicture: Boolean(raw.hasProfilePicture),
    rankingScore: Number(raw.rankingScore ?? 0),
    totalProjects: Number(raw.totalProjects ?? 0),
    studentsSupervised: Number(raw.studentsSupervised ?? 0),
    acceptanceRate: raw.acceptanceRate != null ? Number(raw.acceptanceRate) : null,
    professorStatus: optionalString(raw.professorStatus),
  })
}

function unwrap(response: { data: unknown }): Record<string, unknown> {
  const body = response.data as { data?: Record<string, unknown> }
  return (body.data ?? response.data) as Record<string, unknown>
}

export async function fetchProfessorById(id: string): Promise<ProfessorProfile> {
  const response = await apiClient.get(`/professors/${id}`)
  return mapProfessor(unwrap(response))
}

/**
 * PATCHes only the fields present in `input`. Empty strings are sent as `null`
 * so clearing a field in the form actually clears it in the database.
 */
export async function updateProfessorProfile(
  id: string,
  input: ProfessorProfileUpdate
): Promise<ProfessorProfile> {
  const payload: Record<string, string | null> = {}
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue
    const trimmed = typeof value === 'string' ? value.trim() : value
    payload[key] = trimmed === '' || trimmed === null ? null : String(trimmed)
  }
  const response = await apiClient.patch(`/professors/${id}`, payload)
  return mapProfessor(unwrap(response))
}

export async function uploadProfessorAvatar(id: string, file: File): Promise<ProfessorProfile> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await apiClient.post(`/professors/${id}/avatar`, formData)
  return mapProfessor(unwrap(response))
}

export async function deleteProfessorAvatar(id: string): Promise<ProfessorProfile> {
  const response = await apiClient.delete(`/professors/${id}/avatar`)
  return mapProfessor(unwrap(response))
}

/**
 * Public URL of a professor avatar. `version` busts the browser cache after an
 * upload so the new picture shows up immediately.
 */
export function professorAvatarUrl(id: string, version?: string | number): string {
  const base = env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
  const url = `${base}/professors/${id}/avatar`
  return version ? `${url}?v=${encodeURIComponent(String(version))}` : url
}
