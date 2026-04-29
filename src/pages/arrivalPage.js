const { translate } = require('../utils/translator');
const { FormComponent } = require('../components/FormComponent');
const { generateUniqueSMT ,getCurrentDate,verifyButtonEnabled} = require('../utils/reusableFunction');
import { ConfirmationDialogPage } from '../pages/ConfirmationDialogPage';
import { expect } from '@playwright/test';

class ArrivalPage {

  constructor(page, language) {
    this.page = page;
    this.form = new FormComponent(page);
    this.language = language;
this.deleteButton = this.page.locator(
  'button.MuiButton-contained[style*="background-color: rgb(255, 0, 0)"]'
);
    this.finalizeButton = page.locator('#btnFianlize');
   this.confirmationDialog = new ConfirmationDialogPage(page);

      this.tableBody = this.page.locator('tbody.MuiTableBody-root');
  this.tableRows = this.tableBody.locator(
    'tr.MuiTableRow-root:not([style*="height: 10px"])');
  this.smtFilterInput = page.locator("//input[@aria-label='filter data by SMT Number']");
   this.secondTD = () => this.page.locator("//tr[@class='MuiTableRow-root'][2]/td[2]");
        this.fifthTD = () => this.page.locator("//tr[@class='MuiTableRow-root'][2]/td[5]");
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
   srockOverviewtab = () => this.page.locator('span[role="menuitem"]').nth(0);
  logNewArrivalButton = () => this.page.locator('button.MuiButton-containedPrimary');
  submitButton = () => this.page.locator('div.MuiGrid-item > button.MuiButton-containedPrimary').nth(0);  //
  

 async openArrivalForm() {
  await this.arrivalTab().click();
  await this.logNewArrivalButton().waitFor({ state: 'visible' });
  await this.logNewArrivalButton().click();
}
  async fillArrivalForm(data) {

    const receiptTypeText = translate(this.language, "receiptType", data.receiptType);
    console.log('recpnt type', receiptTypeText);
    console.log('Raw data.receiptType:', data.receiptType);
console.log('Raw data.currency:', data.currency);

 

     const currencyText = translate(this.language, "currency", data.currency);
     const sendingStoreText = translate(this.language, "formLabels", data.sendingStore);
      const shippingReferenceText = translate(this.language, "formLabels", data.shippingRef);

        console.log('sending store type', sendingStoreText);
    console.log('shiiping refernce:', shippingReferenceText);

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
async fillArrivalFormCRROnly(data) {
  // 🔹 Safety check: ensure data is defined
  if (!data) {
    throw new Error("fillArrivalFormCRROnly called with undefined data!");
  }

  console.log('arrival json values are ',JSON.stringify(data, null, 2));
  
  // 🔹 Log incoming data in Node context for debugging
  //console.log("fillArrivalFormCRROnly received data:", JSON.stringify(data, null, 2));

  // 🔹 Translate receipt type if needed
  const receiptTypeText = translate(this.language, "receiptType", data.receiptType);

  // 🔹 Select Receipt Type from dropdown
  await this.form.selectDropdown(this.receiptTypeDropdown(), receiptTypeText);

  // 🔹 Fill current date in Receipt Date field
  await this.form.fillInput(this.receiptDate(), getCurrentDate());

  // 🔹 Generate and fill SMT Number
  const uniqueSMT = generateUniqueSMT(data.smtNumber || "DEFAULT_SMT");
  await this.form.fillInput(this.smtNumber(), uniqueSMT);

  // 🔹 Optional: Select Sending Store dropdown (CRR)
  // if (data.sendingStore) {
  //   await this.form.selectReactDropdown(this.sendingStoreInput(), data.sendingStore);
  // // }

  // 🔹 Submit the form
  await this.submitButton().click();

  // 🔹 Wait for network idle or page load
  await this.page.waitForLoadState("networkidle");

  // 🔹 Optional: pause for manual inspection if needed
  //  await this.page.waitForTimeout(15000);
}

  
async validateButtonEnabled() {
  // Wait until button becomes enabled (state-based, no delay)
  await expect(this.finalizeButton).toBeEnabled({ timeout: 15000 });

  // Highlight AFTER it's ready
  await this.finalizeButton.evaluate(el => {
    el.style.outline = '3px solid red';
  });

  await expect(this.finalizeButton).toBeVisible();
}

async waitForLoadingToFinish() {
  await this.page.locator('.MuiBackdrop-root').waitFor({ state: 'hidden' });
}

async clickDeleteAndVerifyPopup() {
  await this.deleteButton.waitFor({ state: 'visible' });
  await expect(this.deleteButton).toBeEnabled();

  await this.deleteButton.click();

  await this.confirmationDialog.verifyDeleteConfirmationPopup();
}

async clickFinalizeVerifyPopup() {
  await this.finalizeButton.waitFor({ state: 'visible' });

  // Highlight the element we are validating/clicking
  await this.finalizeButton.evaluate(el => {
    el.style.outline = '3px solid red';
    el.style.transition = 'outline 0.3s ease-in-out';
  });

  await expect(this.finalizeButton).toBeEnabled();
  await this.finalizeButton.click();

  await this.confirmationDialog.verifyFinalizePopup();
}



async clickCancelButtonVerifyDeleteButtonEnabled() {
 

  await this.confirmationDialog.clickCancel();
  await this.page.waitForLoadState('networkidle'); 
  await this.validateDeletButtonEnabled();
}

  
async validateDeletButtonEnabled() {
  await this.page.waitForLoadState('networkidle'); 
  await this.deleteButton.evaluate(el => { el.style.outline = '3px solid red'; el.style.transition = 'outline 0.3s ease-in-out'; });
  await expect(this.deleteButton).toBeVisible();
  await expect(this.deleteButton).toBeEnabled();

}

async validateButtonDisabled() {
  await this.page.locator('[role="dialog"]').waitFor({ state: 'hidden' });
  await expect(this.deleteButton).toBeDisabled();
}

  async clickFinalizeButton() {
  await this.clickElement(this.finalizeButton);
  }

async selectLangaugeFrench() {
  const dropdownDiv = this.page.locator('div.MuiGrid-root.MuiGrid-item > svg').first();

await dropdownDiv.locator('xpath=..').click();
 const languageDiv = this.page.locator('//div[@aria-haspopup="listbox"]').first();
    await languageDiv.waitFor({ state: 'visible', timeout: 5000 });
    await languageDiv.click();
    await this.page.locator('li[role="option"]').nth(1).click(); // select
}
async selectLangaugePortugal() {
  const dropdownDiv = this.page.locator('div.MuiGrid-root.MuiGrid-item > svg').first();

await dropdownDiv.locator('xpath=..').click();
 const languageDiv = this.page.locator('//div[@aria-haspopup="listbox"]');
    await languageDiv.waitFor({ state: 'visible', timeout: 5000 });
    await languageDiv.click();
    await this.page.locator('li[role="option"]').nth(2).click(); 
}
async selectLangaugeArabic() {
  const dropdownDiv = this.page.locator('div.MuiGrid-root.MuiGrid-item > svg').first();

await dropdownDiv.locator('xpath=..').click();
 const languageDiv = this.page.locator('//div[@aria-haspopup="listbox"]');
    await languageDiv.waitFor({ state: 'visible', timeout: 5000 });
    await languageDiv.click();
    await this.page.locator('li[role="option"]').nth(3).click(); // select
}

async verifyDeleteSuccessMessage() {
  const toast = this.page.locator('[role="alert"]').last();

 const expectedMessage = translate(this.language, 'messages', 'DELETESUCCESS');

  // 1. Appear + correct text
  await expect(toast).toBeVisible({ timeout: 10000 });
  await expect(toast).toContainText(expectedMessage, { timeout: 10000 });

  // // 2. Wait for it to disappear (give it more time)
   await expect(toast).toBeHidden({ timeout: 15000 });   // ← increased to 15s
}

async verifyArrivalInTable(expectedData) {
  const { smtNumber, receiptType } = expectedData;

  // Wait for the table body to be visible
  await expect(this.tableBody).toBeVisible({ timeout: 15000 });

  const row = this.tableRows.first(); // Always first row
  const cells = row.locator('td');

  // --- Helper to highlight any cell safely ---
  const highlightElement = async (locator, color = 'yellow', duration = 2000) => {
    // Apply highlight
    await locator.evaluate((el, color) => {
      el.style.transition = 'all 0.5s ease';
      el.style.backgroundColor = color;
      el.style.border = '2px solid red';
    }, color);

    // Wait for duration using the Page object from this class
    await this.page.waitForTimeout(duration);

    // Remove highlight
    await locator.evaluate(el => {
      el.style.backgroundColor = '';
      el.style.border = '';
    });
  };

  // --- SMT Number validation ---
  const smtCell = cells.nth(1);
  await highlightElement(smtCell); // highlight immediately
  await expect(smtCell).toContainText(smtNumber);

  // --- Receipt Type validation ---
  const receiptCell = cells.nth(2);
  await highlightElement(receiptCell);
  const expectedType = translate(this.language, 'receiptType', receiptType);
  console.log('Expected Receipt Type in Table:', expectedType);
  await expect(receiptCell).toHaveText(expectedType);
}

async verifyFinalizeSuccessMessage() {
  const toast = this.page.locator('[role="alert"]').last();

  const expectedMessage = translate(this.language, 'messages', 'FINALIZESUCCESS');

  // 1. Appear + correct text
  await expect(toast).toBeVisible({ timeout: 10000 });
  await expect(toast).toContainText(expectedMessage, { timeout: 10000 });

  // 2. Wait for it to disappear (give it more time)
  await expect(toast).toBeHidden({ timeout: 15000 });   // ← increased to 15s
}
     async switchTabs() {    
        await this.srockOverviewtab().click();
        await this.arrivalTab().click();
          
    }
   async filterBySMT(smtNumber) {
        await this.smtFilterInput.click();       

    // Type the number like a user
    await this.smtFilterInput.type(smtNumber, { delay: 100 }); // types slower

    // Press Enter or Tab to trigger filter
    await this.smtFilterInput.press('Enter'); 

    // Optionally wait for filtered results to appear
  //  await this.page.waitForTimeout(500);
}
async highlightSecondRowCells() {
    await this.secondTD().evaluate(td => td.style.backgroundColor = 'yellow');
    await this.fifthTD().evaluate(td => td.style.backgroundColor = 'lightgreen');
}
}

module.exports = { ArrivalPage };

