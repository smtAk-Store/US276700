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
    this.recipientStoreDropdown = () => this.page.locator('#react-select-3-input');
    this.submitButton = () => this.page.locator('div.MuiGrid-item > button.MuiButton-containedPrimary').nth(0);
    this.issuingTab = () => this.page.locator('span[role="menuitem"]').nth(3);
    this.productType = page.locator('#productType');
    this.product = page.locator('#product');
    this.batchNumber = page.locator('input[name="batch"]');
    this.quantity = page.locator('input[name="dosesOrUnit"]');
    storeNameInput  = () => this.page.locator('input[name="storageLocation"]');
    this.saveButton = () => this.page.locator('//button[@type="submit"]');
  }
  async openIssuingForm() {
    await this.issuingTab().click();
    await this.issueNewStockButton().click();
  }
async fillIssuingFormCRROnly(data) {
  // Translate receipt type if needed
  const receiptTypeText = translate(this.language, "issueType", data.issueType);

  // Select Receipt Type
  await this.form.selectDropdown(this.issueTypeDropdown(), receiptTypeText);

  await this.form.selectReactDropdown(this.recipientStoreDropdown(), data.sendingStore);

  // Submit Form
  await this.submitButton().click();
}
 async addProductToIssuingTabPopup(productData, language = 'en') {
await this.form.selectDropdown(this.product, productData.productType[language]);
await this.form.selectDropdown(this.product, productData.product[language]);
await this.form.selectDropdown(this.product, productData.batchNumber[language]);
await this.form.selectDropdown(this.product, productData.storageLocation[language]);
await this.saveButton().click();

}
}
module.exports = { IssuingPage };