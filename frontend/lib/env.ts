import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

function validateEnv() {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NODE_ENV: process.env.NODE_ENV,
  })

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors)
    throw new Error('Invalid environment variables')
  }

  return parsed.data
}

export const env = validateEnv()
