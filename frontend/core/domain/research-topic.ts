import { z } from 'zod'

export const ResearchTopicSchema = z.object({
  id: z.string(),
  name: z.string(),
  sortOrder: z.number(),
  createdAt: z.coerce.date(),
})

export type ResearchTopic = z.infer<typeof ResearchTopicSchema>
