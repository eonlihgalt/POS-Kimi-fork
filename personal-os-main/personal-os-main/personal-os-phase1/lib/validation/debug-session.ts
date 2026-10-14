import { z } from 'zod';
export const debugSessionSchema = z.object({
  situation:z.string().trim().min(1,'Describe what happened.').max(5000), trigger:z.string().trim().max(3000).optional(),
  thoughts:z.string().trim().max(5000).optional(), emotions:z.string().trim().max(3000).optional(), behavior:z.string().trim().max(5000).optional(),
  outcome:z.string().trim().max(5000).optional(), analysisLens:z.enum(['standard','protective','both'])
});
export type DebugSessionInput = z.infer<typeof debugSessionSchema>;
