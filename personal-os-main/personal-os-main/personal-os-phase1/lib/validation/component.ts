import { z } from 'zod';

export const componentUpdateSchema = z.object({
  componentId: z.string().uuid(),
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(5000).optional(),
  category: z.string().trim().max(160).optional(),
  helpfulWhen: z.string().trim().max(5000).optional(),
  costlyWhen: z.string().trim().max(5000).optional()
});

export type ComponentUpdateInput =
  z.infer<typeof componentUpdateSchema>;
