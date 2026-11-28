import { z } from 'zod';

export const itemTypeEnum = z.enum(['field', 'animal']);
export const statusEnum = z.enum(['active', 'cancelled', 'sold']);

export const myOffersSchema = z.object({
  success: z.literal(true),
  data: z.object({
    total: z.number().int().nonnegative(),
    offers: z.array(
      z.object({
        id: z.number(),
        price: z.number(),
        itemId: z.number(),
        itemType: itemTypeEnum,
        status: statusEnum,
      }),
    ),
  }),
});
