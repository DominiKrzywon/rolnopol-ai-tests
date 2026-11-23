import { z } from 'zod';

const alertSchema = z.object({
  title: z.string(),
});

export const alertsSectionsSchema = z.object({
  data: z.object({
    today: z.object({
      alerts: z.array(alertSchema),
    }),
    upcoming: z.object({
      alerts: z.array(alertSchema),
    }),
    history: z.array(
      z.object({
        date: z.string(),
        alerts: z.array(alertSchema),
      }),
    ),
  }),
});
