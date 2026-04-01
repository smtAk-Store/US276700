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

class StockOverviewPage {
  constructor(page, language) {
    this.page = page;
    this.form = new FormComponent(page); // fixed typo
    this.language = language;

    // ✅ Create instance of IssuingPage here
    this.issuingPage = new IssuingPage(page, language);
    this.arrivalPage = new ArrivalPage(page, language);
    const [product] = productIssuingTab;
    this.productType = page.locator('#productType');
    this.product = page.locator('#product');
    this.data = testData.SimpleArrival;
  }

  // 📌 Locator: Menu items (used for navigation)
  menuItem = () => this.page.locator("//span[contains(@class,'MuiMenuItem-root')]");
  quantity = () => this.page.locator('input[name="dosesOrUnit"]');
  batchNumber = () => this.page.locator("//div[@id='batch' and @role='button']");
  saveButton = () => this.page.locator("//div[contains(@class,'MuiGrid-item')]/button[@type='submit' and contains(@class,'MuiButton-containedPrimary')]");
  // 📌 Navigate to Stock Overview Page
  async navigateTostockOverviewpage() {
    console.log('Navigating to Stock Overview page...');
    await this.menuItem().nth(0).click();
    await this.page.waitForLoadState('networkidle', { timeout: 10000 });
    console.log('✅ Successfully navigated to Stock Overview');
  }

  // 📌 Verify & highlight element from JSON
  async verifyAndHighlightFromJson(value, issuingData1) {
    // find the row based on the second column text
    const rowLocator = this.page.locator('tbody tr').filter({
      has: this.page.locator('td:nth-child(2)', { hasText: value })
    });

    const count = await rowLocator.count();

    if (count > 0) {
      const row = rowLocator.first();

      // get adjacent numeric value (third column)
      const numericValueText = await row.locator('td:nth-child(3)').textContent();
      const numericValue = numericValueText ? parseInt(numericValueText.replace(/,/g, ''), 10) : 0;

      // if numeric value is 0 or empty, treat as "not found"
      if (numericValue <= 0) {
        console.log(`"${value}" -> Numeric value is 0 or empty, skipping.`);
        this.lastFoundValue = null;
        this.lastFoundNumericValue = null;
        return;
      }

      // scroll and highlight
      await row.scrollIntoViewIfNeeded();
      await row.evaluate(el => {
        el.style.border = '3px solid red';
        el.style.backgroundColor = 'yellow';
      });

      // store main value and numeric value
      const mainValue = await row.locator('td:nth-child(2)').textContent();
      this.lastFoundValue = mainValue?.trim();
      this.lastFoundNumericValue = numericValue;

      console.log(`"${value}" -> Element FOUND and highlighted`);
      console.log(`Stored value: ${this.lastFoundValue}`);
      console.log(`Stored numeric value: ${this.lastFoundNumericValue}`);

      // call the form method
      await this.openFormAndDoSomething(issuingData1);


    } else {
      console.log(`"${value}" -> Element NOT FOUND`);
      this.lastFoundValue = null;
      this.lastFoundNumericValue = null;
      await this.arrivalPage.openArrivalForm();
      await this.arrivalPage.fillArrivalFormCRROnly(this.data);
      const dialog = new ArrivalProductDialogPage(this.page);
      await this.page.pause();
      await dialog.addProductToArrivalCRR(sunset, 'en');
      await this.page.pause();
      await this.arrivalPage.validateButtonEnabled();
      await this.arrivalPage.confirmationDialog.clickConfirm();
      await this.arrivalPage.verifyFinalizeSuccessMessage();
    }
  }

  async openFormAndDoSomething(issuingData1) {
    // 1️⃣ Open the issuing form
    await this.issuingPage.openIssuingForm();

    // 2️⃣ Fill the main issuing form using your data
    await this.issuingPage.fillIssuingFormCRROnly(issuingData1);

    // 3️⃣ Add the first product from JSON (like old spec)
    // get first product
    await this.addAllProductsFromJson();
    await this.issuingPage.clickFinalizeVerifyPopupinIssuingTab();
    // 4️⃣ Pause for debugging

  }
  async addAllProductsFromJson() {

    const productData = {
      productType: "Supplies"
    };


    await this.form.selectDropdown(this.productType, productData.productType);
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
    await this.page.pause();

  }
}

module.exports = StockOverviewPage;