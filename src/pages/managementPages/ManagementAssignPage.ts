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

  readonly fieldSelectModal: Locator;
  readonly staffSelectModal: Locator;
  readonly assignSubmitButton: Locator;
  readonly cancelAssignButton: Locator;
  readonly closeAssignButton: Locator;

  readonly assignTree;
  readonly treeFieldName: Locator;
  readonly staffForFieldTree: Locator;
  readonly nameStaffOnFieldTree: Locator;

  constructor(page: Page) {
    super(page);
    this.header = page.getByRole('heading', {
      name: 'Staff Assignment Management',
    });
    this.notification = page.locator('.notification-message');
    this.unassignedStaffCount = page.locator('.unassignedStaffCount');
    this.totalStaffCount = page.locator('.totalStaffCount');
    this.newAssignButton = page.locator('#openAssignModal');

    this.assignmentLocator = page.locator('.assignmentsGrid');
    this.gridTitleLocator = page.locator('.grid-title');
    this.gridSubtitleLocator = page.locator('.grid-subtitle');
    this.gridCancelButton = page.getByTitle('Unassign');

    this.fieldSelectModal = page.locator('#assignField');
    this.staffSelectModal = page.locator('#assignStaff');
    this.assignSubmitButton = page.locator(
      '#assignStaffForm button[type="submit"]',
    );
    this.cancelAssignButton = page.locator('#cancelAssignModal');
    this.closeAssignButton = page.locator('#closeAssignModal');

    this.assignTree = page.getByRole('button', { name: 'Tree' });
    this.treeFieldName = page.locator('.tree-node-title');
    this.staffForFieldTree = page.locator('.tree-node-staff-count');
    this.nameStaffOnFieldTree = page.locator('.tree-child-name');
  }

  async openNewAssignmentModal(): Promise<void> {
    await this.newAssignButton.click();
  }

  async assignStaffToField(
    fieldLabel: string,
    staffLabel: string,
  ): Promise<void> {
    await this.openNewAssignmentModal();
    await this.fieldSelectModal
      .locator('option', { hasText: fieldLabel })
      .waitFor({ state: 'attached' });
    await this.staffSelectModal
      .locator('option', { hasText: staffLabel })
      .waitFor({ state: 'attached' });
    await this.assignSubmitButton.click();
  }

  unassign(assignmentId: string | number): Promise<void> {
    return this.page.locator(`[data-unassign="${assignmentId}"]`).click();
  }
}
