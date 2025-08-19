import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['admin', 'researcher']),
  permissions: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    category: z.enum(['species', 'data', 'admin'])
  })),
  status: z.enum(['active', 'pending', 'suspended']),
  createdAt: z.string()
})

export type ValidatedUser = z.infer<typeof UserSchema>