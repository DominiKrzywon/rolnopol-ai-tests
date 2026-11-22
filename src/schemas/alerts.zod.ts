import { z } from 'zod';

export const alertsSectionsSchema = z.object({
  data: z.object({
    today: z.object({
      alerts: z.array(z.unknown()),
    }),
    upcoming: z.object({
      alerts: z.array(z.unknown()),
    }),
    history: z.array(z.unknown()),
  }),
});
