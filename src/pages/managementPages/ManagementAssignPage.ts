import { Locator, Page } from '@playwright/test';
import { PAGE_URLS } from 'src/constants/pageUrls';
import { BasePage } from 'src/pages/BasePage';

export class AssignPage extends BasePage {
  readonly PAGE_URL = PAGE_URLS.ASSIGN;
  readonly header: Locator;
  readonly notification: Locator;
  readonly unassignedStaffCount: Locator;
  readonly totalStaffCount: Locator;
  readonly newAssignButton: Locator;

  readonly assignmentLocator: Locator;
  readonly gridTitleLocator: Locator;
  readonly gridSubtitleLocator: Locator;
  readonly gridCancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.header = page.getByRole('heading', {
      name: 'Staff Assignment Management',
    });
    this.notification = page.locator('.notification-message');
    this.unassignedStaffCount = page.locator('.unassignedStaffCount');
    this.totalStaffCount = page.locator('.totalStaffCount');
    this.newAssignButton = page.locator('.openAssignModal');

    this.assignmentLocator = page.locator('.assignmentsGrid');
    this.gridTitleLocator = page.locator('.grid-title');
    this.gridSubtitleLocator = page.locator('.grid-subtitle');
    this.gridCancelButton = page.getByTitle('Unassign');
  }
}
