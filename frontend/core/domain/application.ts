import { z } from 'zod'

export const ApplicationStatusSchema = z.enum(['PENDING', 'ACCEPTED', 'REJECTED'])

export type ApplicationStatus = z.infer<typeof ApplicationStatusSchema>

export const ApplicationSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  studentId: z.string(),
  status: ApplicationStatusSchema,
  motivation: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  student: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
    })
    .optional(),
  project: z
    .object({
      id: z.string(),
      title: z.string(),
    })
    .optional(),
})

export type Application = z.infer<typeof ApplicationSchema>

export type CreateApplicationInput = z.infer<typeof CreateApplicationInputSchema>

export const CreateApplicationInputSchema = z.object({
  projectId: z.string(),
  motivation: z.string().min(50).max(1000),
})
