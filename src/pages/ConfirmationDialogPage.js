import { expect } from '@playwright/test';

export class ConfirmationDialogPage {

  constructor(page) {
    this.page = page;

    this.dialog = page.locator('[role="dialog"]');
    this.dialogTitle = this.dialog.locator('#alert-dialog-title h2');

    this.confirmButton = this.dialog.locator('button').first();
    this.cancelButton = this.dialog.locator('button').nth(1);
  }

  async verifyDialogVisible() {
    await expect(this.dialog).toBeVisible();
  }

  async verifyDialogHasText() {
    await expect(this.dialogTitle).not.toBeEmpty();
  }

  async verifyDialogButtons() {
    await expect(this.confirmButton).toBeVisible();
    await expect(this.cancelButton).toBeVisible();

    await expect(this.confirmButton).toBeEnabled();
    await expect(this.cancelButton).toBeEnabled();
  }

  async verifyDeleteConfirmationPopup() {
    await this.verifyDialogVisible();
    await this.verifyDialogHasText();
    await this.verifyDialogButtons();
  }

  async clickConfirm() {
    await this.confirmButton.click();
  }

  async clickCancel() {
    await this.cancelButton.click();
  }

}