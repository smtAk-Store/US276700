const { FormComponent } = require('../components/FormComponent');
const BCGData = require('../testdata/InputData/BCGImmunizationData.json');

export class ArrivalProductDialogPage {

  constructor(page) {
    this.page = page;
    this.form = new FormComponent(page);

    // Dropdowns / Inputs
    this.productType = page.locator('#productType');
    this.product = page.locator('#productId');
    this.batchNumber = page.locator('input[name="batchNo"]');
    this.expiryDate = page.locator('input[name="expiryDate"]');
    this.producer = page.locator('#producerId');
    this.commercialName = page.locator('#commercialName');
    this.formulation = page.locator('#formulationId');
    this.presentation = page.locator('#presentation');
    this.vvmStage = page.locator('#vvmStageId');
    this.quantity = page.locator('input[name="units"]');
    this.routineOrSia = page.locator('#routineOrSia');
    this.origin = page.locator('#producerCountryId');
    this.freezeIndicator = page.locator('#freezeTag');
    this.storageLocation = page.locator('#storageLocationId');
    this.createButton = page.locator("//button[@type='submit' and contains(@class, 'MuiButton-root')]");
  }

  // --- NEW METHOD USING selectDropdown AND LANGUAGE SUPPORT ---
  async addProductToArrival(productData, language = 'en') {

    // Fill dropdowns with language-specific values
    await this.form.selectDropdown(this.productType, productData.productType[language]);
    await this.form.selectDropdown(this.product, productData.product[language]);
    await this.form.selectDropdown(this.producer, productData.producer[language]);
    await this.form.selectDropdown(this.commercialName, productData.commercialName[language]);
    await this.form.selectDropdown(this.formulation, productData.formulation[language]);
    await this.form.selectDropdown(this.presentation, productData.presentation[language]);
    await this.form.selectDropdown(this.vvmStage, productData.vvmStage[language]);
    await this.form.selectDropdown(this.routineOrSia, productData.routineOrSia[language]);
    await this.form.selectDropdown(this.origin, productData.origin[language]);
    await this.form.selectDropdown(this.storageLocation, productData.storageLocation[language]);

    // Input fields
    await this.batchNumber.fill(productData.batchNumber[language]);
    await this.expiryDate.fill(productData.expiryDate[language]);
    await this.quantity.fill(productData.quantity[language]);

    // Checkbox/dropdown
    await this.form.selectDropdown(this.freezeIndicator, productData.freezeIndicator[language]);

    // Click Save/Create
    await this.createButton.click();
    await this.page.waitForLoadState('networkidle');

    // Handle "Continue" popup
    const continueButton = this.page.locator("(//div[contains(@class,'MuiGrid-item')]/button[contains(@class,'MuiButton-root')])[6]");
    try {
    await continueButton.waitFor({ state: 'visible', timeout: 5000 });
    await continueButton.click();
    await this.page.waitForLoadState('networkidle');
   } catch (err) {
   console.log("Continue button not present, moving on");
   }
  }

   async addProductToArrivalCRR(sunset, language = 'en',newArrivalQuantity) {

    // Fill dropdowns with language-specific values
    await this.form.selectDropdown(this.productType, sunset.productType[language]);
    await this.form.selectDropdown(this.product, sunset.product[language]);
    await this.form.selectDropdown(this.producer, sunset.producer[language]);
 //   await this.form.selectDropdown(this.commercialName, sunset.commercialName[language]);
    //await this.form.selectDropdown(this.formulation, sunset.formulation[language]);
    await this.form.selectDropdown(this.presentation, sunset.presentation[language]);
   // await this.form.selectDropdown(this.vvmStage, sunset.vvmStage[language]);
    await this.form.selectDropdown(this.routineOrSia, sunset.routineOrSia[language]);
   // await this.form.selectDropdown(this.origin, sunset.origin[language]);
    await this.form.selectDropdown(this.storageLocation, sunset.storageLocation[language]);

    // Input fields
    await this.batchNumber.fill(sunset.batchNumber[language]);
  //  await this.expiryDate.fill(sunset.expiryDate[language]);
   await this.quantity.fill(newArrivalQuantity.toString());

    // Checkbox/dropdown
    await this.form.selectDropdown(this.freezeIndicator, sunset.freezeIndicator[language]);

    // Click Save/Create
    await this.createButton.click();
    await this.page.waitForLoadState('networkidle');

    // Handle "Continue" popup
    const continueButton = this.page.locator("(//div[contains(@class,'MuiGrid-item')]/button[contains(@class,'MuiButton-root')])[6]");
    try {
    await continueButton.waitFor({ state: 'visible', timeout: 5000 });
    await continueButton.click();
    await this.page.waitForLoadState('networkidle');
   } catch (err) {
   console.log("Continue button not present, moving on");
   }
  }
}

module.exports = { ArrivalProductDialogPage };