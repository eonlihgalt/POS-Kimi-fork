import { z } from 'zod';
export const discoverySchema=z.object({debugSessionId:z.string().uuid(),type:z.enum(['setting','rule','assumption','need','protective_strategy','strength','warning_sign','recovery_method','resource_requirement','operating_condition']),title:z.string().trim().min(2).max(160),description:z.string().trim().max(5000).optional(),confidence:z.enum(['low','medium','high'])});
