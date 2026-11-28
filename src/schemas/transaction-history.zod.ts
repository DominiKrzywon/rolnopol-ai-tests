import { z } from 'zod';

export const transactionSchema = z.object({
  id: z.number(),
  type: z.enum(['income', 'expense']),
  amount: z.number(),
  timestamp: z.iso.datetime(),
});

export const transactionHistoryPaginationSchema = z.object({
  success: z.literal(true),
  data: z.object({
    hasMore: z.boolean(),
    total: z.number().int().nonnegative(),
    offset: z.number().int().nonnegative(),
    limit: z.number().int().positive(),
    transactions: z.array(transactionSchema),
  }),
});
