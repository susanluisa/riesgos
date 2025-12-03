
// schemas/train.ts
import { z } from "zod"

export const TrainSchema = z.object({
  X: z.array(z.array(z.number())),
  y: z.array(z.number()),
  options: z.object({
    nEstimators: z.number().int().min(10).max(1000).optional(),
    maxFeatures: z.number().min(0.1).max(1).optional(),
    replacement: z.boolean().optional(),
    seed: z.number().int().optional(),
    useSmote: z.boolean().optional(),
    testSize: z.number().min(0.05).max(0.5).optional(),
  }).optional()
})
