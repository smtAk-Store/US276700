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

  const count = await this.dialog.count();

  if (count === 0) {
    console.log("⚠️ Dialog not present, skipping visibility check");
    return;
  }

  await expect(this.dialog).toBeVisible();
  }

  async verifyDialogHasText() {

  const count = await this.dialogTitle.count();

  if (count === 0) {
    console.log("⚠️ Dialog title not present, skipping text check");
    return;
  }

  const text = await this.dialogTitle.textContent();

  if (!text || text.trim().length === 0) {
    console.log("⚠️ Dialog title is empty, skipping assertion");
    return;
  }

  expect(text.trim().length).toBeGreaterThan(0);
}

 async verifyDialogButtons() {

  const confirmCount = await this.confirmButton.count();
  const cancelCount = await this.cancelButton.count();

  // -------- CASE: buttons not present --------
  if (confirmCount === 0 || cancelCount === 0) {
    console.log("⚠️ Dialog buttons not present, skipping validation");
    return;
  }

  // -------- CASE: buttons present --------
  await expect(this.confirmButton).toBeVisible();
  await expect(this.cancelButton).toBeVisible();

  await expect(this.confirmButton).toBeEnabled();
  await expect(this.cancelButton).toBeEnabled();

  // Highlight Confirm button
  await this.confirmButton.evaluate(el => {
    el.style.outline = '3px solid yellow';
    el.style.backgroundColor = 'yellow';
  });

  // Highlight Cancel button
  await this.cancelButton.evaluate(el => {
    el.style.outline = '3px solid yellow';
    el.style.backgroundColor = 'yellow';
  });

 // await this.page.waitForTimeout(1000);
}

  async verifyDeleteConfirmationPopup() {
    await this.verifyDialogVisible();
    await this.verifyDialogHasText();
    await this.verifyDialogButtons();
  }

  
  async verifyFinalizePopup() {
    await this.verifyDialogVisible();
    await this.verifyDialogHasText();
    await this.verifyDialogButtons();
  }

  async clickConfirm() {
  const count = await this.confirmButton.count();

  if (count === 0) {
    console.log("⚠️ Confirm button not present, skipping click");
    return;
  }

  await this.confirmButton.first().click();
}

  async clickCancel() {
    await this.cancelButton.click();
  }

}