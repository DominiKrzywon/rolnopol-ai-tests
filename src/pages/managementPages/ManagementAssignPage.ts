import { Locator } from '@playwright/test';
import { PAGE_URLS } from 'src/constants/pageUrls';
import { BasePage } from 'src/pages/BasePage';

export class AssignPage extends BasePage {
  readonly PAGE_URL = PAGE_URLS.ASSIGN;
  readonly header = this.page.getByRole('heading', {
    name: 'Staff Assignment Management',
  });
  readonly unassignedStaffCount = this.page.locator('#unassignedStaffCount');
  readonly totalStaffCount = this.page.locator('.totalStaffCount');
  readonly newAssignButton = this.page.locator('#openAssignModal');

  readonly assignmentLocator = this.page.locator('.assignmentsGrid');
  readonly gridTitleLocator = this.page.locator('.grid-title');
  readonly gridSubtitleLocator = this.page.locator('.grid-subtitle');
  readonly gridCancelButton = this.page.getByTitle('Unassign');

  readonly fieldSelectModal = this.page.locator('#assignField');
  readonly staffSelectModal = this.page.locator('#assignStaff');
  readonly assignSubmitButton = this.page.locator(
    '#assignStaffForm button[type="submit"]',
  );
  readonly cancelAssignButton = this.page.locator('#cancelAssignModal');
  readonly closeAssignButton = this.page.locator('#closeAssignModal');

  readonly assignTree = this.page.getByRole('button', { name: 'Tree' });
  readonly assignmentsNodeTree = this.page.locator('#assignmentsTree');
  readonly treeFieldName = this.page.locator('.tree-node-title');
  readonly staffForFieldTree = this.page.locator('.tree-node-staff-count');
  readonly nameStaffOnFieldTree = this.page.locator('.tree-child-name');

  async openNewAssignmentModal(): Promise<void> {
    await this.newAssignButton.click();
  }

  async assignStaffToField(
    fieldLabel: string,
    staffLabel: string,
  ): Promise<void> {
    await this.openAssignForm(fieldLabel);

    const staffOption = this.staffSelectModal.locator('option', {
      hasText: staffLabel,
    });
    await staffOption.waitFor({ state: 'attached' });

    const staffValue = await staffOption.getAttribute('value');
    await this.staffSelectModal.selectOption({ value: staffValue! });

    await this.assignSubmitButton.click();
  }

  async openAssignForm(fieldName: string): Promise<void> {
    await this.openNewAssignmentModal();

    const fieldOption = this.fieldSelectModal.locator('option', {
      hasText: fieldName,
    });
    await fieldOption.waitFor({ state: 'attached' });

    const fieldValue = await fieldOption.getAttribute('value');
    await this.fieldSelectModal.selectOption({ value: fieldValue! });
  }

  unassign(assignmentId: string | number): Promise<void> {
    return this.page.locator(`[data-unassign="${assignmentId}"]`).click();
  }

  getTreeNodeByField(fieldName: string): Locator {
    return this.page.locator('.tree-node').filter({
      has: this.page.locator('.tree-node-title', { hasText: fieldName }),
    });
  }

  getAssignmentGridByField(fieldName: string): Locator {
    return this.page.locator('#assignmentsGrid .grid-item').filter({
      has: this.page.locator('.grid-subtitle', { hasText: fieldName }),
    });
  }
}
