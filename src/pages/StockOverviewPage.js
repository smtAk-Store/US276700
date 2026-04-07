const { translate } = require('../utils/translator');
const { FormComponent } = require('../components/FormComponent');
const { expect } = require('@playwright/test');
const { IssuingPage } = require('./Issuingpage'); // make sure file casing matches
const productIssuingTab = require('../testdata/InputData/productIssuingTab.json');
const productData = require('../testdata/InputData/productArrival.json');
const { ArrivalPage } = require('./arrivalPage');
const testData = require('../testdata/addlinetoarrival.json');
const productTypeArrivalData = require('../testdata/InputData/addProductTypeArrival.json');
const { ArrivalProductDialogPage } = require('../pages/arrivalProductDialoguePage');
import { ConfirmationDialogPage } from '../pages/ConfirmationDialogPage';

class StockOverviewPage {
  constructor(page, language) {
    this.page = page;
    this.form = new FormComponent(page); 
    this.language = language;
    this.issuingPage = new IssuingPage(page, language);
    this.arrivalPage = new ArrivalPage(page, language);
    const [product] = productIssuingTab;
    this.productType = page.locator('#productType');
    this.product = page.locator('#product');
    this.data = testData.SimpleArrival;

  }
  menuItem = () => this.page.locator("//span[contains(@class,'MuiMenuItem-root')]");
  quantity = () => this.page.locator('input[name="dosesOrUnit"]');
  batchNumber = () => this.page.locator("//div[@id='batch' and @role='button']");
  saveButton = () => this.page.locator("//div[contains(@class,'MuiGrid-item')]/button[@type='submit' and contains(@class,'MuiButton-containedPrimary')]");
  async navigateTostockOverviewpage() {
    await this.menuItem().nth(0).click();
  }


  async evaluateCurrentStockBalance(value, addLineToIssueData, productTypeIssueData,addLineToArrivalData,addProductTypeArrivalData, productType, language, newArrivalQuantity) {

    // Try to fetch existing stock
    const existingStock = await this.fetchValueFromTable(value);

    if (existingStock && existingStock.numericValue > 0) {
        // ✅ Stock exists → issue
        console.log(`"${value}" -> Stock available → issuing`);
        await this.issueExistingStock(addLineToIssueData, productTypeIssueData, language);
    } 
        console.log(`"${value}" -> NOT FOUND or ZERO → performing addlinetoarrival`);
        await this.performArrival(addLineToArrivalData, addProductTypeArrivalData, language, newArrivalQuantity);
    

    // Optional: highlight or verify in stock overview after action
    await this.navigateTostockOverviewpage();
    await this.highlightTdAndVerifyTooltip(value);
}
  

    async validateZeroStockBalance(value, addLineToIssueData, productTypeIssueData, language, newArrivalQuantity) {
    let existingStock = await this.fetchValueFromTable(value);

    if (existingStock && existingStock.numericValue > 0) {
        await this.issueExistingStock(addLineToIssueData, productTypeIssueData, language);
    } else {
        // 1. Perform addlinetoarrival first
        await this.performArrival(this.data, productTypeIssueData, language, newArrivalQuantity);

        // 2. Re-fetch the value from table to get lastFoundValue for issuing
        await this.navigateTostockOverviewpage();
        await this.fetchValueFromTable(value);

        // 3. Issue stock after addlinetoarrival
        await this.issueExistingStock(addLineToIssueData, productTypeIssueData, language);  
    }

    // 4. Final navigation and highlight
    await this.navigateTostockOverviewpage();
    await this.highlightTdAndVerifyTooltip(value);
}

  async fetchValueFromTable(value) {
  const rowLocator = this.page.locator('tbody tr').filter({
    has: this.page.locator('td:nth-child(2)', { hasText: value })
  });

  const count = await rowLocator.count();

  // ✅ FIX 1: Handle element not found
  if (count === 0) {
    console.log(`"${value}" -> Element NOT FOUND`);
    return null;
  }

  const row = rowLocator.first();

  // ✅ FIX 2: Wait for row to be visible (important)
  await row.waitFor({ state: 'visible', timeout: 5000 });

  const numericValueText = await row.locator('td:nth-child(3)').textContent();
  const numericValue = numericValueText
    ? parseInt(numericValueText.replace(/,/g, ''), 10)
    : 0;

  // ⚠️ Don't return early without setting value
  if (numericValue <= 0) {
    console.log(`"${value}" -> Numeric value is 0 or empty`);

    this.lastFoundValue = value; // ✅ KEEP VALUE
    this.lastFoundNumericValue = 0;

    return { mainValue: value, numericValue: 0 };
  }

  await row.scrollIntoViewIfNeeded();
  await row.evaluate(el => {
    el.style.border = '3px solid red';
    el.style.backgroundColor = 'yellow';
  });

  const mainValue = await row.locator('td:nth-child(2)').textContent();

  this.lastFoundValue = mainValue?.trim();
  this.lastFoundNumericValue = numericValue;

  console.log(`"${value}" -> Element FOUND and highlighted`);
  console.log(`Stored value: ${this.lastFoundValue}`);
  console.log(`Stored numeric value: ${this.lastFoundNumericValue}`);

  return {
    mainValue: this.lastFoundValue,
    numericValue: this.lastFoundNumericValue
  };
}
  async verifyAndHighlightFromJson(value, addLineToIssueData, productTypeArrivalData, language, newArrivalQuantity) {
   
    const rowLocator = this.page.locator('tbody tr').filter({
      has: this.page.locator('td:nth-child(2)', { hasText: value })
    });

    const count = await rowLocator.count();

    if (count > 0) {
      const row = rowLocator.first();
      const numericValueText = await row.locator('td:nth-child(3)').textContent();
      const numericValue = numericValueText ? parseInt(numericValueText.replace(/,/g, ''), 10) : 0;
      if (numericValue <= 0) {
        console.log(`"${value}" -> Numeric value is 0 or empty, skipping.`);
        this.lastFoundValue = null;
        this.lastFoundNumericValue = null;
        return;
      }
      await row.scrollIntoViewIfNeeded();
      await row.evaluate(el => {
        el.style.border = '3px solid red';
        el.style.backgroundColor = 'yellow';
      });
      const mainValue = await row.locator('td:nth-child(2)').textContent();
      this.lastFoundValue = mainValue?.trim();
      this.lastFoundNumericValue = numericValue;

      console.log(`"${value}" -> Element FOUND and highlighted`);
      console.log(`Stored value: ${this.lastFoundValue}`);
      console.log(`Stored numeric value: ${this.lastFoundNumericValue}`);
      await this.issueExistingStock(addLineToIssueData, productTypeArrivalData, language);
    } 
    await this.arrivalPage.openArrivalForm();
    await this.arrivalPage.fillArrivalFormCRROnly(this.data);
    const dialog = new ArrivalProductDialogPage(this.page);
    await dialog.addProductToArrivalCRR(productTypeArrivalData, language, newArrivalQuantity);
    await this.arrivalPage.waitForLoadingToFinish();
    await this.arrivalPage.clickFinalizeVerifyPopup();
    await this.arrivalPage.confirmationDialog.clickConfirm();
    await this.arrivalPage.verifyFinalizeSuccessMessage();
    await this.navigateTostockOverviewpage()
  }

  async issueExistingStock(addLineToIssueData, productTypeIssueData, language) {
    await this.issuingPage.openIssuingForm();
    await this.issuingPage.fillIssuingFormCRROnly(addLineToIssueData);
    await this.addAllProductsFromJson(productTypeIssueData, language);
    await this.issuingPage.clickFinalizeVerifyPopupinIssuingTab();
  }

  async performArrival(addLineToArrivalData, productTypeArrivalData, language, newArrivalQuantity) {
    await this.arrivalPage.openArrivalForm();
    await this.arrivalPage.fillArrivalFormCRROnly(addLineToArrivalData);
    const dialog = new ArrivalProductDialogPage(this.page);
    await dialog.addProductToArrival(productTypeArrivalData, language, newArrivalQuantity);
    await this.arrivalPage.waitForLoadingToFinish();
    await this.arrivalPage.clickFinalizeVerifyPopup();
    await this.arrivalPage.confirmationDialog.clickConfirm();
    await this.arrivalPage.verifyFinalizeSuccessMessage();
    await this.navigateTostockOverviewpage()
  }

  
  async addAllProductsFromJson(productTypeIssueData, language) {
    const productTypeValue = productTypeIssueData.productType[language];
    if (!productTypeValue) {
      throw new Error(`productType not found for language: ${language}`);
    }
    await this.form.selectDropdown(this.productType, productTypeValue);
    await this.page.waitForTimeout(2000);
    if (this.lastFoundValue) {
      await this.form.selectDropdown(this.product, this.lastFoundValue);
    }
    await this.batchNumber().click();
    const firstRealOption = this.page.locator('ul[role="listbox"] li').nth(1);
    await firstRealOption.click();
    if (this.lastFoundNumericValue) {
      await this.quantity().fill(`${this.lastFoundNumericValue}`);
    }
    await this.saveButton().click();
  }
  async highlightTdAndVerifyTooltip(value) {
    const row = this.page.locator('tbody tr')
        .filter({ has: this.page.locator('td:nth-child(2)', { hasText: value }) })
        .first();

    if (!(await row.count())) {
        console.warn(`Row not found for value: "${value}"`);
        return null;
    }

    await row.scrollIntoViewIfNeeded();
    const targetTd = row.locator('td:nth-child(3)');
    const tooltipIcon = targetTd.locator('[data-tooltip]').first();

    // Highlight
    await targetTd.evaluate(el => {
        el.style.backgroundColor = 'lightcoral';
        el.style.outline = '2px solid red';
    });

    if (!(await tooltipIcon.count())) {
        console.warn(`Tooltip icon not found for: "${value}"`);
        return null;
    }

    await tooltipIcon.hover({ force: true });

    const tooltipText = await tooltipIcon.getAttribute('data-tooltip');

    console.log(`✅ Tooltip for "${value}":`, tooltipText);

    await this.page.pause(); // Remove in CI / final runs

    return tooltipText;
}

async highlightTdAndVerifyNoTooltip(value) {
    const row = this.page.locator('tbody tr')
        .filter({
            has: this.page.locator('td:nth-child(2)', { hasText: value })
        })
        .first();

    if (!(await row.count())) {
        console.warn(`Row not found for value: "${value}"`);
        return false;
    }

    await row.scrollIntoViewIfNeeded();

    const targetTd = row.locator('td:nth-child(3)');

    // Highlight the TD
    await targetTd.evaluate((el) => {
        el.style.backgroundColor = 'lightcoral';
        el.style.outline = '2px solid red';
    });

    // Check if tooltip icon exists
    const tooltipIcon = targetTd.locator('[data-tooltip]').first();
    const tooltipCount = await tooltipIcon.count();

    // Assert that no tooltip icon is present
    if (tooltipCount > 0) {
        console.error(`❌ FAIL: Tooltip icon found for "${value}" but expected none`);
        // Optional: Fail the test
        // throw new Error(`Tooltip icon should not be present for value: ${value}`);
    } else {
        console.log(`✅ PASS: No tooltip icon found and TD highlighted for value: "${value}"`);
    }

    // Pause for visual check during debugging (remove/comment in CI runs)
    await this.page.pause();

    return tooltipCount === 0;   // Returns true if no tooltip (as expected)
}

}

module.exports = StockOverviewPage;


