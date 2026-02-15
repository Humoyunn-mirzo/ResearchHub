import { z } from 'zod'

export const ProjectStatusSchema = z.enum(['OPEN', 'CLOSED'])

export type ProjectStatus = z.infer<typeof ProjectStatusSchema>

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  professorId: z.string(),
  status: ProjectStatusSchema,
  slots: z.number().int().positive(),
  tags: z.array(z.string()),
  createdAt: z.coerce.date(),
  professor: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
    })
    .nullable()
    .optional(),
})

export type Project = z.infer<typeof ProjectSchema>

export const CreateProjectInputSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(2000),
  slots: z.number().int().min(1).max(20),
  tags: z.array(z.string()).min(1).max(10),
})

export type CreateProjectInput = z.infer<typeof CreateProjectInputSchema>

export const UpdateProjectInputSchema = CreateProjectInputSchema.partial()

export type UpdateProjectInput = z.infer<typeof UpdateProjectInputSchema>
