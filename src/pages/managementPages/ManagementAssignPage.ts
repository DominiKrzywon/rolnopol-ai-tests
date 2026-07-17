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
  readonly assignmentsNodeTree: Locator;
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
    this.assignmentsNodeTree = page.locator('#assignmentsTree');
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

    const fieldOption = this.fieldSelectModal.locator('option', {
      hasText: fieldLabel,
    });
    await fieldOption.waitFor({ state: 'attached' });

    const fieldValue = await fieldOption.getAttribute('value');
    await this.fieldSelectModal.selectOption({ value: fieldValue! });

    const staffOption = this.staffSelectModal.locator('option', {
      hasText: staffLabel,
    });
    await staffOption.waitFor({ state: 'attached' });
    const staffValue = await staffOption.getAttribute('value');
    await this.staffSelectModal.selectOption({ value: staffValue! });

    await this.assignSubmitButton.click();
  }

  unassign(assignmentId: string | number): Promise<void> {
    return this.page.locator(`[data-unassign="${assignmentId}"]`).click();
  }

  getTreeNodeByField(fieldName: string): Locator {
    return this.page.locator('.tree-node').filter({
      has: this.page.locator('.tree-node-title', { hasText: fieldName }),
    });
  }
}
