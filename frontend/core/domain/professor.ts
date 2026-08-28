import { z } from 'zod'

export const ProfessorProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  universityId: z.string().nullable().optional(),
  universityName: z.string().nullable().optional(),
  fieldOfStudy: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  officeLocation: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  websiteUrl: z.string().optional().nullable(),
  researchInterests: z.string().optional().nullable(),
  hasProfilePicture: z.boolean().default(false),
  rankingScore: z.number(),
  totalProjects: z.number(),
  studentsSupervised: z.number(),
  acceptanceRate: z.number().nullable().optional(),
  professorStatus: z.string().optional().nullable(),
})

export type ProfessorProfile = z.infer<typeof ProfessorProfileSchema>

/** Fields a professor can edit from their own dashboard. */
export const ProfessorProfileUpdateSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  title: z.string().trim().max(255).nullable().optional(),
  department: z.string().trim().max(255).nullable().optional(),
  fieldOfStudy: z.string().trim().max(255).nullable().optional(),
  officeLocation: z.string().trim().max(255).nullable().optional(),
  phone: z.string().trim().max(50).nullable().optional(),
  websiteUrl: z.string().trim().url().max(512).nullable().optional().or(z.literal('')),
  researchInterests: z.string().trim().max(2000).nullable().optional(),
  bio: z.string().trim().max(4000).nullable().optional(),
  universityId: z.string().trim().uuid().nullable().optional().or(z.literal('')),
})

export type ProfessorProfileUpdate = z.infer<typeof ProfessorProfileUpdateSchema>

/** Fields counted towards the "profile completeness" hint on the dashboard. */
export const PROFILE_COMPLETENESS_FIELDS = [
  'title',
  'department',
  'fieldOfStudy',
  'bio',
  'researchInterests',
  'phone',
  'officeLocation',
  'websiteUrl',
] as const satisfies readonly (keyof ProfessorProfile)[]

export function profileCompleteness(professor: ProfessorProfile): number {
  const total = PROFILE_COMPLETENESS_FIELDS.length + 1 // +1 for the photo
  const filled = PROFILE_COMPLETENESS_FIELDS.filter((field) => {
    const value = professor[field]
    return typeof value === 'string' && value.trim().length > 0
  }).length
  return Math.round(((filled + (professor.hasProfilePicture ? 1 : 0)) / total) * 100)
}
