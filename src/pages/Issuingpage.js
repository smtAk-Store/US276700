import { expect } from '@playwright/test';
const { translate } = require('../utils/translator');
const { FormComponent } = require('../components/FormComponent');
const { log } = require('node:console');
const { generateUniqueSMT ,getCurrentDate,verifyButtonEnabled} = require('../utils/reusableFunction');


class IssuingPage {
  constructor(page, language) {
    this.page = page;                   
    this.language = language;          
    this.form = new FormComponent(page);
    this.issueNewStockButton  = () => this.page.locator('//button[contains(@class,"MuiButton-containedPrimary")]');
    this.issueTypeDropdown = () => this.page.locator('#issueTypes');
    this.recipientStoreDropdown = () => this.page.locator("//div[@id='recipientStore' and contains(@class,'MuiSelect-root')]");
    this.submitButton = () => this.page.locator('div.MuiGrid-item > button.MuiButton-containedPrimary').nth(0);
    this.issuingTab = () => this.page.locator('span[role="menuitem"]').nth(3);
    this.productType = page.locator('#productType');
    this.product = page.locator('#product');
    this.finalizeButton = page.locator("//button[@type='button' and contains(@class,'MuiButton-containedPrimary')]").nth(1);;
    this.batchNumber = () => this.page.locator("//div[@id='batch' and @role='button']");
    this.quantity = () => this.page.locator('input[name="dosesOrUnit"]');
    this.storeNameInput  = () => this.page.locator("//div[@id='storageLocation' and @role='button']");
    this.saveButton = () => this.page.locator('//button[@type="submit"]');
    this.recipientStoreOption = (value) => this.page.locator(`//ul[contains(@class,'MuiMenu-list')]//li[span[text()='${value}']]`);
  }
  async openIssuingForm() {
    await this.issuingTab().click();
    await this.issueNewStockButton().click();
  }
   async waitForNoError(timeout = 3000) {
    const interval = 300;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {

      const errorCount = await this.page
        .locator('p.Mui-error')
        .count();

      if (errorCount === 0) {
        return true;
      }

      await new Promise(resolve => setTimeout(resolve, interval));
    }

    return false;
  }
  async clickSaveWithRetry() {
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {

      await this.saveButton().click();

      const isSuccess = await this.waitForNoError(300);

      if (isSuccess) {
        return true;
      }

      console.log(`Save attempt ${attempt} failed, retrying...`);
    }

    throw new Error('Save failed after 3 attempts due to validation errors');
  }
async fillIssuingFormCRROnly(data) {

  console.log('Full data received:', JSON.stringify(data, null, 2));
  console.log(data.issueType, 'issue type ####');

  const receiptTypeText = translate(this.language, "issueType", data.issueType);
  console.log(receiptTypeText, 'recipient Text ####');

  await this.form.selectDropdown(this.issueTypeDropdown(), receiptTypeText);
  await this.selectRecipientStore(data.sendingStore);

  // ✅ Just read existing date
  const issuingDate = await this.page
    .locator('input[name="issuingDate"]')
    .inputValue();

  console.log('Issuing Date:', issuingDate);

  await this.submitButton().click();

  return issuingDate;  // ✅ return it for later use
}
 async addProductToIssuingTabPopup(productData, language = 'en') {
await this.form.selectDropdown(this.productType, productData.productType[language]);
await this.form.selectDropdown(this.product, productData.product[language]);
await this.form.selectDropdown(this.batchNumber(),productData.batchNumber[language]);
await this.quantity().fill(productData.quantity[language]);
//await this.form.selectDropdown(this.storeNameInput(),productData.storageLocation[language]);
await this.clickSaveWithRetry();
}
async clickFinalizeVerifyPopupinIssuingTab() {
  await this.finalizeButton.waitFor({ state: 'visible' });

  // Highlight the element we are validating/clicking
  await this.finalizeButton.evaluate(el => {
    el.style.outline = '3px solid red';
    el.style.transition = 'outline 0.3s ease-in-out';
  });

  await expect(this.finalizeButton).toBeEnabled();
  await this.finalizeButton.click();

  //await this.confirmationDialog.verifyFinalizePopup();
}
async selectRecipientStore(value) {
  await this.page.locator('#recipientStore').click();
  await this.page.keyboard.type(value);
  await this.page.keyboard.press('Enter');
}
}
module.exports = { IssuingPage };