import { apiClient } from '@/lib/api'
import { z } from 'zod'

const StudentProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  universityId: z.string().nullable().optional(),
  fieldOfInterest: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  totalApplications: z.number(),
  acceptedProjects: z.number(),
})

export type StudentProfile = z.infer<typeof StudentProfileSchema>

export async function fetchStudentById(id: string): Promise<StudentProfile> {
  const response = await apiClient.get(`/students/${id}`)
  const body = response.data as { data?: unknown }
  const raw = body.data ?? response.data
  return StudentProfileSchema.parse(raw)
}
