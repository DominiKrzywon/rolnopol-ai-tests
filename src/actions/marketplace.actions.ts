import { Page } from '@playwright/test';
import { MarketplacePage } from 'src/pages/MarketplacePage';

export async function createMarketplaceOffer(
  page: Page,
  data: { itemType: 'field' | 'animal'; price: number; description?: string },
): Promise<{ price: number; description?: string }> {
  const marketPlace = new MarketplacePage(page);
  const offer = await marketPlace.createNewOffer(
    data.itemType,
    data.price,
    data.description,
  );

  return offer;
}
