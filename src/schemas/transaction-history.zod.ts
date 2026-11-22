import { z } from 'zod';

export const transactionHistoryPaginationSchema = z.object({
  data: z.object({
    hasMore: z.boolean(),
  }),
});
