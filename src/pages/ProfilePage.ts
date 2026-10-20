import { PAGE_URLS } from '../constants/pageUrls';
import { BasePage } from './BasePage';

/**
 * Page Object for the user profile/dashboard page.
 * Provides locators for profile sections, user info, update form, and account actions.
 */
export class ProfilePage extends BasePage {
  readonly PAGE_URL = PAGE_URLS.PROFILE;

  readonly profileInformationHeading = this.page.getByRole('heading', {
    name: 'Profile Information',
  });
  readonly updateProfileHeading = this.page.getByRole('heading', {
    name: 'Update Profile',
  });
  readonly dangerZoneHeading = this.page.getByRole('heading', {
    name: 'Danger Zone',
  });
  readonly logoutBtn = this.page
    .getByTestId('header-component')
    .getByTestId('logout-btn');
  readonly editProfileInfoButton = this.page.locator('#editProfileInfoBtn');
  readonly updateUserName = this.page.getByPlaceholder('Enter display name');
  readonly saveUpdatedUserInfo = this.page.locator('#editProfileSave');

  readonly welcomeMessage = this.page.getByTestId('nav-profile');
  readonly displayedName = this.page.getByTestId('displayed-name');
  readonly emailValue = this.page.getByTestId('email-value');
  readonly userId = this.page.getByTestId('user-id');
  readonly createdAt = this.page.getByTestId('created-at');
  readonly lastLogin = this.page.getByTestId('last-login');

  readonly displayNameInput = this.page.getByTestId('new-displayed-name-input');
  readonly newPasswordInput = this.page.getByTestId('new-password-input');
  readonly confirmPasswordInput = this.page.getByTestId(
    'confirm-password-input',
  );
  readonly saveChangesBtn = this.page.getByTestId('update-profile-submit-btn');

  readonly deleteAccountBtn = this.page.getByTestId('delete-account-btn');
  readonly confirmDeleteAccountBtn =
    this.page.getByTestId('confirm-delete-btn');
  readonly deleteModalTitle = this.page.getByRole('heading', {
    name: 'Confirm Account Deletion',
  });
  readonly deleteConfirmationInput = this.page.getByPlaceholder(
    'Type DELETE to confirm',
  );

  async logout(): Promise<void> {
    await this.logoutBtn.click();
  }

  async updateUserInfo(updatedName: string): Promise<void> {
    await this.editProfileInfoButton.click();
    await this.updateUserName.fill(updatedName);
    await this.saveUpdatedUserInfo.click();
  }

  async openDeleteAccountModal(): Promise<void> {
    await this.deleteAccountBtn.click();
  }

  async confirmAccountDeletion(): Promise<void> {
    await this.deleteConfirmationInput.fill('DELETE');
    await this.confirmDeleteAccountBtn.click();
  }
}
