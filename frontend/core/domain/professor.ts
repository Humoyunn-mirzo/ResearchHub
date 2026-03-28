import { z } from 'zod'

export const ProfessorProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  universityId: z.string().nullable().optional(),
  fieldOfStudy: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  rankingScore: z.number(),
  totalProjects: z.number(),
  studentsSupervised: z.number(),
  acceptanceRate: z.number().nullable().optional(),
  professorStatus: z.string().optional().nullable(),
})

export type ProfessorProfile = z.infer<typeof ProfessorProfileSchema>
