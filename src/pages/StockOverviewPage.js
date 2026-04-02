const { translate } = require('../utils/translator');
const { FormComponent } = require('../components/FormComponent');
const { expect } = require('@playwright/test');
const { IssuingPage } = require('./Issuingpage'); // make sure file casing matches
const productIssuingTab = require('../testdata/InputData/productIssuingTab.json');
const productData = require('../testdata/InputData/productArrival.json');
const { ArrivalPage } = require('./arrivalPage');
const testData = require('../testdata/arrival.json');
const sunset = require('../testdata/InputData/sunsetProduct.json');
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

  
  async verifyAndHighlightFromJson(value, issuingData1, sunset, language, newArrivalQuantity) {
   
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
      await this.openFormAndDoSomething(issuingData1, sunset, language);
    } 
    await this.arrivalPage.openArrivalForm();
    await this.arrivalPage.fillArrivalFormCRROnly(this.data);
    const dialog = new ArrivalProductDialogPage(this.page);
    await dialog.addProductToArrivalCRR(sunset, language, newArrivalQuantity);
    await this.arrivalPage.waitForLoadingToFinish();
    await this.arrivalPage.clickFinalizeVerifyPopup();
    await this.arrivalPage.confirmationDialog.clickConfirm();
    await this.arrivalPage.verifyFinalizeSuccessMessage();
    await this.navigateTostockOverviewpage()
  }

  async openFormAndDoSomething(issuingData1, sunset, language) {
    await this.issuingPage.openIssuingForm();
    await this.issuingPage.fillIssuingFormCRROnly(issuingData1);
    await this.addAllProductsFromJson(sunset, language);
    await this.issuingPage.clickFinalizeVerifyPopupinIssuingTab();
  }
  async addAllProductsFromJson(sunset, language) {
    const productTypeValue = sunset.productType[language];
    if (!productTypeValue) {
      throw new Error(`productType not found for language: ${language}`);
    }
    await this.form.selectDropdown(this.productType, productTypeValue);
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
    const row = this.page.locator('tbody tr').filter({
      has: this.page.locator('td:nth-child(2)', { hasText: value })
    }).first();
    if (!(await row.count())) return;
    await row.scrollIntoViewIfNeeded();
    const targetTd = row.locator('td:nth-child(3)');
    await targetTd.evaluate(el => {
      el.style.backgroundColor = 'lightcoral';
    });
    const tooltipIcon = targetTd.locator('[data-tooltip]');
    await tooltipIcon.hover();
    const tooltipText = await tooltipIcon.getAttribute('data-tooltip');
    console.log("Tooltip value:", tooltipText);



  }
}

module.exports = StockOverviewPage;


