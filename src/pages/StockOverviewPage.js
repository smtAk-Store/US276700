const { translate } = require('../utils/translator');
const { FormComponent } = require('../components/FormComponent');
const { expect } = require('@playwright/test');
const { IssuingPage } = require('./Issuingpage'); // make sure file casing matches
const productIssuingTab = require('../testdata/InputData/productIssuingTab.json');
const productData = require('../testdata/InputData/productArrival.json');
const { ArrivalPage } = require('./arrivalPage');
const productTypeArrivalData = require('../testdata/InputData/addProductTypeArrival.json');
const { ArrivalProductDialogPage } = require('../pages/arrivalProductDialoguePage');
import { ConfirmationDialogPage } from '../pages/ConfirmationDialogPage';
const { TableComponent } = require('../components/TableComponent');

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
      this.table = new TableComponent(page);
      
    // this.data = testData.SimpleArrival;

  }
  menuItem = () => this.page.locator("//span[contains(@class,'MuiMenuItem-root')]");
  quantity = () => this.page.locator('input[name="dosesOrUnit"]');
  batchNumber = () => this.page.locator("//div[@id='batch' and @role='button']");
  saveButton = () => this.page.locator("//div[contains(@class,'MuiGrid-item')]/button[@type='submit' and contains(@class,'MuiButton-containedPrimary')]");
  addButton = () => this.page.locator('button.MuiButton-containedPrimary');
  storageEquipmentDropdown = () => this.page.locator('#storageEquipmentId');
  supplierDropdown = () => this.page.locator('#supplierId');
  equipmentTypeDropdown = () => this.page.locator('#equipmentTypeId');
  equipmentNameInput = () => this.page.locator('input[name="equipmentName"]');
  statusDropdown = () => this.page.locator('#statusId');
  equipmentTAb = () => this.page.locator('span[role="menuitem"]').nth(1);
  closeButton = () => this.page.locator('div[role="dialog"] h2 button[aria-label="close"], div.MuiDialogTitle-root button[aria-label="close"]').first();

  async navigateTostockOverviewpage() {
    await this.menuItem().nth(0).click();
  }
async clearAllData() {
   console.log('🔥 clearAllData ENTERED');
        await this.table.deleteAllRecords(); // 👈 call here
    }

async waitForNoError(timeout = 3000) {
    const interval = 300;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {

        const errorCount = await this.page
            .locator('p.Mui-error')
            .count();

        if (errorCount === 0) {
            return true; // no error → success
        }

        await new Promise(resolve => setTimeout(resolve, interval));
    }

    return false;
}
async clickSaveWithRetry() {
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {

        await this.saveButton().click();

        const isSuccess = await this.waitForNoError(3000);

        if (isSuccess) {
            return true;
        }

        console.log(`Save attempt ${attempt} failed, retrying...`);
    }

    throw new Error('Save failed after 3 attempts due to validation errors');
}
  async evaluateCurrentStockBalance(value, addLineToIssueData, addLineToArrivalData, productTypeArrivalData, productTypeIssueData, productType, language, newArrivalQuantity) {
    console.log(productTypeArrivalData, 'product arrival data ');

    const existingStock = await this.fetchValueFromTable(value);
    if (existingStock && existingStock.numericValue > 0) {
      console.log(`"${value}" -> Stock available → issuing`);
      await this.issueExistingStock(addLineToIssueData, productTypeIssueData, productType, language);
    }
    console.log(`"${value}" -> NOT FOUND or ZERO → performing addlinetoarrival`);
    await this.performArrival(addLineToArrivalData, productTypeArrivalData, productType, language, newArrivalQuantity);
    await this.navigateTostockOverviewpage();
    await this.highlightTdAndVerifyTooltip(value);
  }



  async validateZeroStockBalance(value, addLineToIssueData, addLineToArrivalData, productTypeArrivalData, productTypeIssueData, productType, language, newArrivalQuantity) {
     await this.page.waitForTimeout(6000);
    let existingStock = await this.fetchValueFromTable(value);

    if (existingStock && existingStock.numericValue > 0) {
      await this.issueExistingStock(addLineToIssueData, productTypeIssueData, productType, language);
    } else {
      await this.performArrival(addLineToArrivalData, productTypeArrivalData, productType, language, newArrivalQuantity);
      await this.navigateTostockOverviewpage();
      await this.fetchValueFromTable(value);
      await this.issueExistingStock(addLineToIssueData, productTypeIssueData, productType, language);
    }
    await this.page.waitForTimeout(800);
    await this.navigateTostockOverviewpage();
    await this.page.waitForTimeout(800);
    await this.highlightTdAndVerifyTooltip(value);
  }

  async fetchValueFromTable(value) {
    const rowLocator = this.page.locator('tbody tr').filter({
      has: this.page.locator('td:nth-child(2)', { hasText: value })
    });
    const count = await rowLocator.count();
    if (count === 0) {
      console.log(`"${value}" -> Element NOT FOUND`);
      return null;
    }
    const row = rowLocator.first();
    await row.waitFor({ state: 'visible', timeout: 5000 });

    const numericValueText = await row.locator('td:nth-child(3)').textContent();
    const numericValue = numericValueText
      ? parseInt(numericValueText.replace(/,/g, ''), 10)
      : 0;

    if (numericValue <= 0) {
      console.log(`"${value}" -> Numeric value is 0 or empty`);

      this.lastFoundValue = value;
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

  async issueExistingStock(addLineToIssueData, productTypeIssueData, productType, language) {
    await this.issuingPage.openIssuingForm();
    await this.issuingPage.fillIssuingFormCRROnly(addLineToIssueData);
    await this.addAllProductsFromJson(productTypeIssueData, productType, language);
    await this.issuingPage.clickFinalizeVerifyPopupinIssuingTab();
  }

  async performArrival(addLineToArrivalData, productTypeArrivalData, productType, language, newArrivalQuantity) {

    console.log(' arrival line data in performArrival', addLineToArrivalData);
    console.log(' arrival ProductType data in performArrival', productTypeArrivalData);
    console.log('  ProductType data in performArrival', productType);
    await this.arrivalPage.openArrivalForm();
    await this.page.waitForTimeout(3000);
    await this.arrivalPage.fillArrivalFormCRROnly(addLineToArrivalData);
      const dialog = new ArrivalProductDialogPage(this.page);
    await dialog.addProductToArrival(productTypeArrivalData, language, productType, newArrivalQuantity);
    await this.arrivalPage.waitForLoadingToFinish();
     await this.arrivalPage.clickFinalizeVerifyPopup();
    await this.arrivalPage.confirmationDialog.clickConfirm();
    await this.arrivalPage.verifyFinalizeSuccessMessage();
 await this.navigateTostockOverviewpage()
  }


  async addAllProductsFromJson(productTypeIssueData, productType, language) {

    if (productType == 'Supplies') {
      const productTypeValue = productTypeIssueData.SupplyProductType[language];
      if (!productTypeValue) {
        throw new Error(`productType not found for language: ${language}`);
      }
      await this.form.selectDropdown(this.productType, productTypeValue);

    } else if (productType == 'Vaccines') {
      const productTypeValue = productTypeIssueData.VaccineProductType[language];
      if (!productTypeValue) {
        throw new Error(`productType not found for language: ${language}`);
      }
      await this.form.selectDropdown(this.productType, productTypeValue);

    } else {
      const productTypeValue = productTypeIssueData.DiluentProductType[language];
      if (!productTypeValue) {
        throw new Error(`productType not found for language: ${language}`);
      }
      await this.form.selectDropdown(this.productType, productTypeValue);

    }
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
    await this.clickSaveWithRetry();
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

    console.log(` Tooltip for "${value}":`, tooltipText);

   await this.page.waitForTimeout(15000);

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

    await targetTd.evaluate((el) => {
      el.style.backgroundColor = 'lightcoral';
      el.style.outline = '2px solid red';
    });


    const tooltipIcon = targetTd.locator('[data-tooltip]').first();
    const tooltipCount = await tooltipIcon.count();
    await this.page.waitForTimeout(15000);

    if (tooltipCount > 0) {
      console.error(`FAIL: Tooltip icon found for "${value}" but expected none`);
    } else {
      console.log(`PASS: No tooltip icon found and TD highlighted for value: "${value}"`);
    }

    return tooltipCount === 0;
  }

  async evaluateCurrentStockBalanceForReportPage(value, addLineToIssueData, addLineToArrivalData, productTypeArrivalData, productTypeIssueData, productType, language, newArrivalQuantity) {

    await this.page.waitForTimeout(12000);
    const existingStock = await this.fetchValueFromTable(value);
    console.log(value, 'product arrival data ');
    console.log(existingStock, 'product arrival data ');
    if (existingStock && existingStock.numericValue > 0) {
      await this.issueExistingStock(addLineToIssueData, productTypeIssueData, productType, language);
    }
    await this.performArrival(addLineToArrivalData, productTypeArrivalData, productType, language, newArrivalQuantity);
    await this.navigateTostockOverviewpage();
    await this.highlightTdAndVerifyTooltip(value);

    //      await reportPage.highlightTdAndVerifyTooltipForGenerateReportTable(value);
    //     await reportPage.verifyStockColor(
    //   value,
    //   BCGData,
    //   BCGData.CurrentStockBelowMinimumLevel
    // );


  }
 async addEquipmentForStoreOperator() {
    console.log("=== addEquipmentForStoreOperator STARTED ===");

    await this.equipmentTAb().click();

    await this.addButton().waitFor({ state: 'visible' });
    await this.addButton().click();

    await this.form.selectOptionByIndex('storageEquipmentId', 2);
    await this.form.selectOptionByIndex('supplierId', 1);
    await this.form.selectOptionByIndex('equipmentTypeId', 1);
    await this.form.selectOptionByIndex('statusId', 1);

    // Simple language handling - using fallback only for now
    const language = this.language || 'en';

    console.log('Using language:', language);

    const equipmentName = productData?.[0]?.equipmentname?.[language];

    if (!equipmentName) {
        throw new Error(`Equipment name not found for language: ${language}`);
    }

    console.log(`Filling equipment name: "${equipmentName}"`);

    await this.form.fillInput(this.equipmentNameInput(), equipmentName);

    await this.saveButton().click();
    console.log("Clicked Save button");

    await this.page.waitForLoadState('networkidle');

    // Check if "already exists" message appears
  const alreadyExists = await this.page
  .locator('.check-error .msg')
  .filter({
    hasText: /exists|existe|existe|موجود|existe/i
  })
  .first()
  .isVisible()
  .catch(() => false);

    if (alreadyExists) {
        console.log(`✅ Equipment "${equipmentName}" already exists. Skipping.`);
        await this.closeButton().click();
    } else {
        console.log(`✅ Equipment "${equipmentName}" created successfully.`);
    }

    console.log("=== addEquipmentForStoreOperator COMPLETED ===");
    

}

  
}

module.exports = StockOverviewPage;


