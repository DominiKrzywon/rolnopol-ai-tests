type OfferStatus = 'active' | 'cancelled';
export type ItemType = 'field' | 'animal';

export interface MarketplaceOffer {
  itemType: ItemType;
  id: number;
  price: number;
  description: string;
  status: OfferStatus;
}
