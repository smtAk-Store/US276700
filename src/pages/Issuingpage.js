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
async fillIssuingFormCRROnly(data) {

  console.log('Full data received:', JSON.stringify(data, null, 2));
  console.log( data.issueType,'   issue type ####');
  
  // Translate receipt type if needed
  const receiptTypeText = translate(this.language, "issueType", data.issueType);
console.log( receiptTypeText,'   receipient Text ####');
  // Select Receipt Type
  await this.form.selectDropdown(this.issueTypeDropdown(), receiptTypeText);
await this.page.pause();
  await this.selectRecipientStore(data.sendingStore);

  // Submit Form
  await this.submitButton().click();
}
 async addProductToIssuingTabPopup(productData, language = 'en') {
await this.form.selectDropdown(this.productType, productData.productType[language]);
await this.form.selectDropdown(this.product, productData.product[language]);
await this.form.selectDropdown(this.batchNumber(),productData.batchNumber[language]);
await this.quantity().fill(productData.quantity[language]);
await this.page.pause();
await this.form.selectDropdown(this.storeNameInput(),productData.storageLocation[language]);
await this.saveButton().click();
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
    const dropdown = this.page.locator('#recipientStore');
    await dropdown.click(); 
    await this.recipientStoreOption(value).click();
}}
module.exports = { IssuingPage };