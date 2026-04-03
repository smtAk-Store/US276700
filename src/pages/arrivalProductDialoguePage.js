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

  // Helper function: fill input or select only if exists and enabled
  const fillIfPresent = async (locator, value, type = 'input') => {
    if (await locator.count()) {
      // Check if element is disabled
      const isDisabled = await locator.evaluate(el => el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true');
      if (isDisabled) {
        console.log(`Locator skipped because it is disabled`);
        return;
      }

      if (type === 'select') {
        await locator.click(); // open dropdown
        const option = this.page.locator('li[role="option"]', { hasText: value });
        if (await option.count()) {
          await option.click();
        } else {
          console.log(`Option "${value}" not found for dropdown`);
        }
      } else {
        await locator.fill(value);
      }
    }
  };

  // Fill dropdowns
  await fillIfPresent(this.productType, productData.productType[language], 'select');
  await fillIfPresent(this.product, productData.product[language], 'select');
  await fillIfPresent(this.producer, productData.producer[language], 'select');
  await fillIfPresent(this.commercialName, productData.commercialName[language], 'select');
  await fillIfPresent(this.formulation, productData.formulation[language], 'select');
  await fillIfPresent(this.presentation, productData.presentation[language], 'select');
  await fillIfPresent(this.vvmStage, productData.vvmStage[language], 'select');
  await fillIfPresent(this.routineOrSia, productData.routineOrSia[language], 'select');
  await fillIfPresent(this.origin, productData.origin[language], 'select');
  await fillIfPresent(this.storageLocation, productData.storageLocation[language], 'select');

  // Fill input fields
  await fillIfPresent(this.batchNumber, productData.batchNumber[language]);
  // await fillIfPresent(this.expiryDate, productData.expiryDate[language]);
  await fillIfPresent(this.quantity, productData.quantity[language]);

  // Checkbox/dropdown example (if used)
  // await fillIfPresent(this.freezeIndicator, productData.freezeIndicator[language], 'select');

  // Click Save/Create
  if (await this.createButton.count()) {
    await this.createButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  // Handle "Continue" popup if it exists
  const continueButton = this.page.locator("(//div[contains(@class,'MuiGrid-item')]/button[contains(@class,'MuiButton-root')])[6]");
  if (await continueButton.count()) {
    try {
      await continueButton.waitFor({ state: 'visible', timeout: 5000 });
      await continueButton.click();
      await this.page.waitForLoadState('networkidle');
    } catch (err) {
      console.log("Continue button not present or not clickable, moving on");
    }
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