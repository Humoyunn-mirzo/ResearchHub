import { z } from 'zod'

export const ProjectStatusSchema = z.enum(['OPEN', 'CLOSED'])

export type ProjectStatus = z.infer<typeof ProjectStatusSchema>

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  professorId: z.string(),
  status: ProjectStatusSchema,
  maxStudents: z.number().int().nullable(),
  currentStudents: z.number().int(),
  tags: z.array(z.string()),
  interviewQuestions: z.array(z.record(z.string(), z.unknown())).optional(),
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

export const ScreeningQuestionTypeSchema = z.enum(['text', 'yesno', 'choice'])
export type ScreeningQuestionType = z.infer<typeof ScreeningQuestionTypeSchema>

export const ScreeningQuestionSchema = z.object({
  question: z.string().min(1).max(500),
  type: ScreeningQuestionTypeSchema,
  options: z.array(z.string().min(1).max(200)).optional(),
})

export type ScreeningQuestion = z.infer<typeof ScreeningQuestionSchema>

export const CreateProjectInputSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(2000),
  maxStudents: z.number().int().min(1).max(20).nullable(),
  tags: z.array(z.string()).min(1).max(10),
  interviewQuestions: z.array(ScreeningQuestionSchema).optional(),
})

export type CreateProjectInput = z.infer<typeof CreateProjectInputSchema>

export const UpdateProjectInputSchema = CreateProjectInputSchema.partial()

export type UpdateProjectInput = z.infer<typeof UpdateProjectInputSchema>
