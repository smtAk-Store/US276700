const { translate } = require('../utils/translator');
const { FormComponent } = require('../components/FormComponent');
const { log } = require('node:console');
const { generateUniqueSMT ,getCurrentDate,verifyButtonEnabled} = require('../utils/reusableFunction');

class ArrivalPage {

  constructor(page, language) {
    this.page = page;
    this.form = new FormComponent(page);
    this.language = language;
    this.deleteButton = page.locator('button.MuiButton-containedSecondary');
     this.finalizeButton = page.locator('#btnFianlize');
  }

  receiptTypeDropdown = () => this.page.locator('#receiptTypeId');
  currencyDropdown = () => this.page.locator('#currencyId');

  receiptDate = () => this.page.locator('input[name="receiptDate"]');
  smtNumber = () => this.page.locator('input[name="smtNumber"]');
  shippingRef = () => this.page.locator('input[name="shippingReferance"]');
  freightCost = () => this.page.locator('input[name="freightCost"]');
  sendingStoreInput = () => this.page.locator('#react-select-2-input');
  storeNameInput  = () => this.page.locator('input[name="storeName"]');
  arrivalTab = () => this.page.locator('span[role="menuitem"]').nth(2);
  logNewArrivalButton = () => this.page.locator('button.MuiButton-containedPrimary');
  submitButton = () => this.page.locator('div.MuiGrid-item > button.MuiButton-containedPrimary').nth(0);  //

  async openArrivalForm() {
    await this.arrivalTab().click();
    await this.logNewArrivalButton().click();
  }

  async fillArrivalForm(data) {

    const receiptTypeText = translate(this.language, "receiptType", data.receiptType);
    console.log('recpnt type', receiptTypeText);
    console.log('Raw data.receiptType:', data.receiptType);
console.log('Raw data.currency:', data.currency);

 

     const currencyText = translate(this.language, "currency", data.currency);

    await this.form.selectDropdown(this.receiptTypeDropdown(), receiptTypeText);

    await this.form.fillInput(this.receiptDate(), getCurrentDate());

    const uniqueSMT = generateUniqueSMT(data.smtNumber);

    await this.form.fillInput(this.smtNumber(),uniqueSMT);

    

   if (data.receiptType === 'OTHERS' || data.receiptType === 'STARTING BALANCE') {
      await this.form.fillInput(this.storeNameInput(), data.sendingStore);
    } else {
      await this.form.selectReactDropdown(this.sendingStoreInput(), data.sendingStore);
    }
    await this.form.fillInput(this.shippingRef(), data.shippingRef);

    await this.form.selectDropdown(this.currencyDropdown(), currencyText);

    await this.form.fillInput(this.freightCost(), data.freightCost);

    await this.submitButton().click();

  }

  
async validateButtonEnabled() {
  await verifyButtonEnabled(this.finalizeButton);
}

// async pressClickButton() {
  
// }

async selectLangauge() {
  const dropdownDiv = this.page.locator('div.MuiGrid-root.MuiGrid-item > svg').first();

// Click its parent div (the clickable area)
await dropdownDiv.locator('xpath=..').click();
 const languageDiv = this.page.locator('//div[@aria-haspopup="listbox"]');
    await languageDiv.waitFor({ state: 'visible', timeout: 5000 });
    await languageDiv.click();
    await this.page.locator('li[role="option"]').nth(1).click(); // select
}
}

module.exports = { ArrivalPage };