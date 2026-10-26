import { Locator } from '@playwright/test';
import { PAGE_URLS } from 'src/constants/pageUrls';
import { ItemType } from 'src/models/marketplace';
import { BasePage } from 'src/pages/BasePage';

export class MarketplacePage extends BasePage {
  readonly PAGE_URL = PAGE_URLS.MARKETPLACE;
  readonly marketplaceHeading = this.page.getByRole('heading', {
    name: 'Marketplace',
  });
  readonly userBalance = this.page.locator('#userBalance');
  readonly browseOffers = this.page.locator('[data-tab="browse"]');
  readonly myOffers = this.page.locator('[data-tab="my-offers"]');
  readonly createOffer = this.page.locator('[data-tab="create"]');
  readonly transactionHistory = this.page.locator('[data-tab="transactions"]');
  readonly search = this.page.getByPlaceholder('Filter offers by any text...');
  readonly filterFields = this.page.locator('#offersFilterField');
  readonly marketplaceOffers = this.page.locator('#browseOffers');
  readonly buyNowButton = this.page.locator('.btn-buy');
  readonly cancelButton = this.page.getByTestId('confirmation-modal-cancel');
  readonly confirmBuyButton = this.page.getByTestId(
    'confirmation-modal-confirm',
  );
  readonly nextBtn = this.page.locator('[data-page="next"]');
  readonly itemsPerPageSelect = this.page
    .locator('select')
    .filter({ hasText: 'per page' });
  readonly offerPrice = this.page.locator('.offer-price');

  readonly itemTypeSelect = this.page.locator('select#itemType');
  readonly specificItemSelect = this.page.locator('select#itemId');
  readonly priceInput = this.page.locator('#price');
  readonly descriptionNewOffer = this.page.getByPlaceholder(
    'Describe your item...',
  );
  readonly createOfferButton = this.page.locator('.btn-create');

  readonly myOfferCardOne = this.page.locator('.offer-card.offer-active');
  readonly myOfferSeller = this.page.locator('.offer-seller');
  readonly myOfferName = this.page.locator('.offer-name');
  readonly myOfferMeta = this.page.locator('.offer-meta');
  readonly myOfferDescription = this.page.locator('.offer-description');
  readonly myOfferCancelButton = this.page.getByRole('button', {
    name: 'Cancel',
  });

  readonly transactionType = this.page.locator('.transaction-type');
  readonly transactionAmount = this.page.locator('.transaction-amount.expense');

  async cancelOffer(offerId: number): Promise<void> {
    await this.page
      .locator(`button.btn-cancel[data-offer-id="${offerId}"]`)
      .click();

    await this.confirmBuyButton.click();
  }

  async getBalance(): Promise<number> {
    const balanceText = await this.userBalance.innerText();
    const balanceValue = balanceText.replace(/[^0-9.]/g, '');
    return Number.parseFloat(balanceValue);
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

  async createNewOffer(
    type: ItemType,
    itemId: number,
    price: number,
    description?: string,
  ): Promise<{
    price: number;
    description?: string;
  }> {
    await this.createOffer.click();

    await this.itemTypeSelect.selectOption(type);
    await this.specificItemSelect.selectOption(String(itemId));

    await this.priceInput.fill(String(price));
    if (description) {
      await this.descriptionNewOffer.fill(description);
    }

    await this.createOfferButton.click();

    return { price, description };
  }

  async getLastTransactionAmount(): Promise<number> {
    const text = await this.transactionAmount.last().innerText();
    return Number.parseFloat(text.replace('ROL', ''));
  }

  get myOfferCardLast(): Locator {
    return this.page.locator('.offer-card').last();
  }
}
