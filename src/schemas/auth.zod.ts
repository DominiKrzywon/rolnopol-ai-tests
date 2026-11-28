import { z } from 'zod';

export const loginSuccessSchema = z.object({
  success: z.literal(true),
  data: z.object({
    token: z.string().nonempty(),
    user: z.object({
      id: z.number().int(),
      email: z.string(),
      displayedName: z.string(),
    }),
  }),
});

export const loginErrorSchema = z.object({
  success: z.literal(false),
  error: z.string().nonempty(),
});
