import { faker } from '@faker-js/faker';
import { expect, Locator, Page } from '@playwright/test';
import { PAGE_URLS } from 'src/constants/pageUrls';
import { ItemType } from 'src/models/marketplace';
import { BasePage } from 'src/pages/BasePage';

export interface PurchasedOffer {
  price: number;
  name: string;
  itemType: 'field' | 'animal';
}

export class MarketplacePage extends BasePage {
  readonly PAGE_URL = PAGE_URLS.MARKETPLACE;
  readonly marketplaceHeading: Locator;
  readonly userBalance: Locator;
  readonly browseOffers: Locator;
  readonly myOffers: Locator;
  readonly createOffer: Locator;
  readonly transactionHistory: Locator;
  readonly search: Locator;
  readonly filterFields: Locator;
  readonly notificationMessage: Locator;
  readonly marketplaceOffers: Locator;
  readonly buyNowButton: Locator;
  readonly cancelButton: Locator;
  readonly confirmBuyButton: Locator;
  readonly nextBtn: Locator;
  readonly itemsPerPageSelect: Locator;
  readonly offerPrice: Locator;

  readonly itemTypeSelect: Locator;
  readonly specificItemSelect: Locator;
  readonly priceInput: Locator;
  readonly descriptionNewOffer: Locator;
  readonly createOfferButton: Locator;

  readonly myOfferCardOne: Locator;
  readonly myOfferSeller: Locator;
  readonly myOfferName: Locator;
  readonly myOfferMeta: Locator;
  readonly myOfferDescription: Locator;
  readonly myOfferCancelButton: Locator;

  readonly transactionType: Locator;
  readonly transactionAmount: Locator;

  constructor(page: Page) {
    super(page);
    this.marketplaceHeading = page.getByRole('heading', {
      name: 'Marketplace',
    });
    this.userBalance = page.locator('#userBalance');
    this.browseOffers = page.locator('[data-tab="browse"]');
    this.myOffers = page.locator('[data-tab="my-offers"]');
    this.createOffer = page.locator('[data-tab="create"]');
    this.transactionHistory = page.locator('[data-tab="transactions"]');
    this.search = page.getByPlaceholder('Filter offers by any text...');
    this.filterFields = page.locator('#offersFilterField');
    this.notificationMessage = page.locator('.notification-message');
    this.marketplaceOffers = page.locator('#browseOffers');
    this.buyNowButton = page.locator('.btn-buy');
    this.cancelButton = page.getByTestId('confirmation-modal-cancel');
    this.confirmBuyButton = page.getByTestId('confirmation-modal-confirm');
    this.nextBtn = page.locator('[data-page="next"]');
    this.itemsPerPageSelect = page
      .locator('select')
      .filter({ hasText: 'per page' });
    this.offerPrice = page.locator('.offer-price');

    this.itemTypeSelect = page.locator('select#itemType');
    this.specificItemSelect = page.locator('select#itemId');
    this.priceInput = page.locator('#price');
    this.descriptionNewOffer = page.getByPlaceholder('Describe your item...');
    this.createOfferButton = page.locator('.btn-create');

    this.myOfferCardOne = page.locator('.offer-card.offer-active');
    this.myOfferSeller = page.locator('.offer-seller');
    this.myOfferName = page.locator('.offer-name');
    this.myOfferMeta = page.locator('.offer-meta');
    this.myOfferDescription = page.locator('.offer-description');
    this.myOfferCancelButton = page.getByRole('button', { name: 'Cancel' });

    this.transactionType = page.locator('.transaction-type');
    this.transactionAmount = page.locator('.transaction-amount.expense');
  }

  async showAllOffers(): Promise<void> {
    await this.itemsPerPageSelect.selectOption('36 per page');
  }

  async getBalance(): Promise<number> {
    const balanceText = await this.userBalance.innerText();
    const balanceValue = balanceText.replace(/[^0-9.]/g, '');
    return parseFloat(balanceValue);
  }

  async getOfferPrice(offerCard: Locator): Promise<number> {
    const priceText = await offerCard.locator('.offer-price').innerText();
    const priceValue = priceText.replace(' ROL', '');
    return parseFloat(priceValue);
  }

  async getOfferItemType(offerCard: Locator): Promise<'field' | 'animal'> {
    const badge = await offerCard.locator('.offer-badge').innerText();
    return badge.trim().toLowerCase() === 'field' ? 'field' : 'animal';
  }

  async buyOfferByDescription(description: string): Promise<void> {
    await this.browseOffers.click();
    await this.filterFields.selectOption('description');
    await this.search.fill(description);

    const offerCard = this.page.locator('.offer-card', {
      has: this.page.locator('.offer-description', { hasText: description }),
    });

    await offerCard.locator('.btn-buy').click();
    await this.confirmBuyButton.click();
  }

  async clickRandomBuyNow(): Promise<{
    price: number;
    name: string;
    itemType: ItemType;
  }> {
    await this.showAllOffers();
    const balance = await this.getBalance();

    const cards = await this.page.locator('.offer-card.offer-active').all();

    const offers = await Promise.all(
      cards.map(async (card) => ({
        card,
        price: await this.getOfferPrice(card),
        isBuyable: (await card.locator('.btn-buy').count()) > 0,
      })),
    );

    const affordableOffers = offers.filter(
      ({ price, isBuyable }) => isBuyable && price > 0 && price <= balance,
    );

    if (affordableOffers.length === 0) {
      throw new Error('No affordable offers found on the marketplace');
    }

    const randomOffer =
      affordableOffers[Math.floor(Math.random() * affordableOffers.length)];

    const name = await randomOffer.card.locator('.offer-name').innerText();

    await randomOffer.card.locator('.btn-buy').click();
    await this.confirmBuyButton.click();

    const itemType = await this.getOfferItemType(randomOffer.card);

    return { price: randomOffer.price, name, itemType };
  }

  async attemptToBuyMostExpensiveOffer(): Promise<void> {
    await this.showAllOffers();
    const cards = await this.page.locator('.offer-card.offer-active').all();

    const offers = await Promise.all(
      cards.map(async (card) => ({
        card,
        price: await this.getOfferPrice(card),
        isBuyable: (await card.locator('.btn-buy').count()) > 0,
      })),
    );

    const mostExpensive = offers
      .filter(({ price, isBuyable }) => isBuyable && price > 0)
      .sort((a, b) => b.price - a.price)
      .at(0);

    if (!mostExpensive) {
      throw new Error('No offers found on the marketplace');
    }

    await mostExpensive.card.locator('.btn-buy').click();
    await this.confirmBuyButton.click();
  }

  async createNewOffer(
    type: ItemType,
    price: number,
    description?: string,
  ): Promise<{
    price: number;
    description?: string;
  }> {
    await this.createOffer.click();

    await this.itemTypeSelect.selectOption(type);

    await expect(this.specificItemSelect.locator('option')).not.toHaveCount(1);

    const options = await this.specificItemSelect.locator('option').all();
    const values = await Promise.all(
      options.map((option) => option.getAttribute('value')),
    );

    const validOptions = values.filter(
      (value) => value !== null && value !== '',
    );

    if (validOptions.length === 0) {
      throw new Error(`No available ${type} items to create an offer`);
    }

    const randomValue = faker.helpers.arrayElement(validOptions);
    await this.specificItemSelect.selectOption(randomValue);

    await this.priceInput.fill(String(price));
    if (description) {
      await this.descriptionNewOffer.fill(description);
    }

    await this.createOfferButton.click();

    return { price, description };
  }

  private parseAmount(text: string): number {
    return parseFloat(text.replace('ROL', ''));
  }

  async getLastTransactionAmount(): Promise<number> {
    const text = await this.transactionAmount.last().innerText();
    return this.parseAmount(text);
  }

  get myOfferCardLast(): Locator {
    return this.page.locator('.offer-card').last();
  }
}
