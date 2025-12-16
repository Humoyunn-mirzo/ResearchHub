import { z } from 'zod'

export const RoleSchema = z.enum(['STUDENT', 'PROFESSOR', 'UNIVERSITY_ADMIN', 'PLATFORM_ADMIN'])

export type Role = z.infer<typeof RoleSchema>

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: RoleSchema,
  universityId: z.string().optional(),
  createdAt: z.coerce.date(),
})

export type User = z.infer<typeof UserSchema>
