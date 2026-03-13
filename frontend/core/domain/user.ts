import { z } from 'zod'

export const RoleSchema = z.enum(['DEVELOPER', 'PLATFORM_ADMIN', 'STUDENT', 'PROFESSOR', 'UNIVERSITY_ADMIN'])

export type Role = z.infer<typeof RoleSchema>

export const ProfessorStatusSchema = z.enum(['PENDING', 'CONFIRMED'])
export type ProfessorStatus = z.infer<typeof ProfessorStatusSchema>

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: RoleSchema,
  universityId: z.string().optional(),
  createdAt: z.coerce.date(),
  professorStatus: ProfessorStatusSchema.optional(),
})

export type User = z.infer<typeof UserSchema>
