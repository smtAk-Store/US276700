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
 async addProductToArrival(productTypeArrivalData, language = 'en', productType, quantity) {

  console.log("=== addProductToArrival STARTED ===");
  console.log("Language used:", language);
  console.log("Product Type  used:", productType);
  console.log("Full productTypeArrivalData received:", JSON.stringify(productTypeArrivalData, null, 2));

  if (!productTypeArrivalData) {
    throw new Error("productTypeArrivalData is undefined or null");
  }

  console.log("productType:", productType, "| type:", typeof productType);

  let productTypeName = '';
  let productName = '';
  let producerName = '';
  let commercialNameType = '';
  let formulationType = '';
  let presentationType = '';
  let originType = '';

  if (productType == 'Supplies') {

    productTypeName = productTypeArrivalData.SuppliesProductType?.[language];
    productName = productTypeArrivalData.Suppliesproduct?.[language];
    producerName = productTypeArrivalData.Suppliesproducer?.[language];
    commercialNameType = productTypeArrivalData.SuppliescommercialName?.[language];
    formulationType = productTypeArrivalData.Suppliesformulation?.[language];
    presentationType = productTypeArrivalData.Suppliespresentation?.[language];
    originType = productTypeArrivalData.Suppliesorigin?.[language];

  } else if (productType == 'Vaccines') {

    productTypeName = productTypeArrivalData.vaccineProductType?.[language];
    productName = productTypeArrivalData.vaccineProduct?.[language];
    producerName = productTypeArrivalData.vaccineproducer?.[language];
    commercialNameType = productTypeArrivalData.VaccinecommercialName?.[language];
    formulationType = productTypeArrivalData.Vaccineformulation?.[language];
    presentationType = productTypeArrivalData.Vaccinepresentation?.[language];
    originType = productTypeArrivalData.Vaccineorigin?.[language];

  } else {

    productTypeName = productTypeArrivalData.diluentProductType?.[language];
    productName = productTypeArrivalData.diluentProduct?.[language];
    producerName = productTypeArrivalData.Diluentproducer?.[language];
    commercialNameType = productTypeArrivalData.DiluentcommercialName?.[language];
    formulationType = productTypeArrivalData.Diluentformulation?.[language];
    presentationType = productTypeArrivalData.Diluentpresentation?.[language];
    originType = productTypeArrivalData.Diluentorigin?.[language];
  }

  console.log("DEBUG → productTypeName:", productTypeName);
  console.log("DEBUG → productName:", productName);
  console.log("DEBUG → producer:", producerName);
  console.log("DEBUG → commercialNameType:", commercialNameType);
  console.log("DEBUG → formulationType:", formulationType);
  console.log("DEBUG → presentationType:", presentationType);
  console.log("DEBUG → originType:", originType);

  if (!productTypeName) {
    throw new Error(`Missing productType for language '${language}'`);
  }

  if (!productName) {
    throw new Error(`Missing product for language '${language}'`);
  }

  console.log(`Will select Product Type: "${productTypeName}"`);
  console.log(`Will select Product: "${productName}"`);
  console.log(`Quantity: ${quantity}`);

  const selectOption = async (dropdownLocator, optionText) => {

    if (!dropdownLocator) {
      console.log(" Locator not provided, skipping");
      return;
    }

    if (!(await dropdownLocator.count())) {
      console.log(`Dropdown not found for "${optionText}", skipping`);
      return;
    }

    const isDisabled = await dropdownLocator.isDisabled().catch(() => false);

    if (isDisabled) {
      console.log(`⏭ Dropdown disabled for "${optionText}", skipping`);
      return;
    }

    try {
     // await dropdownLocator.waitFor({ state: 'visible', timeout: 5000 });
      await dropdownLocator.click();

      const option = this.page.locator('li[role="option"]')
        .filter({ hasText: optionText })
        .first();

      if (!(await option.count())) {
        console.log(`⚠️ Option "${optionText}" not found`);
        return;
      }

      //await option.waitFor({ state: 'visible', timeout: 5000 });
      await option.click();

      console.log(` Selected: "${optionText}"`);

   //   await this.page.waitForTimeout(300);

    } catch (err) {
      console.log(` Skipping "${optionText}" due to error: ${err.message}`);
    }
  };

  try {

    await selectOption(this.productType, productTypeName);
    await selectOption(this.product, productName);
    await selectOption(this.producer, producerName);
    await selectOption(this.commercialName, commercialNameType);
    await selectOption(this.formulation, formulationType);
    await selectOption(this.presentation, presentationType);
    await selectOption(this.origin, originType);

    // Batch Number
    if (productTypeArrivalData.batchNumber?.[language]) {
      await this.batchNumber.fill(productTypeArrivalData.batchNumber[language]);
    }

    // ✅ NEW: Expiry Date
    if (productTypeArrivalData.expiryDate?.[language]) {
      await this.expiryDate.fill(productTypeArrivalData.expiryDate[language]);
      console.log("✅ Expiry Date filled:", productTypeArrivalData.expiryDate[language]);
    }

    // Quantity
    await this.quantity.fill(quantity.toString());

    const optionalFields = [
      { locator: this.vvmStage, value: productTypeArrivalData.vvmStage?.[language] },
      { locator: this.routineOrSia, value: productTypeArrivalData.routineOrSia?.[language] },
      { locator: this.storageLocation, value: productTypeArrivalData.storageLocation?.[language] }
    ];

    for (const field of optionalFields) {
      if (field.value) {
        await selectOption(field.locator, field.value);
      }
    }

    await this.createButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.createButton.click();
    console.log("✅ Clicked Create button");

    await this.page.waitForLoadState('networkidle');

    const continueButton = this.page.locator("(//div[contains(@class,'MuiGrid-item')]/button[contains(@class,'MuiButton-root')])[6]");

    if (await continueButton.count()) {
      const isVisible = await continueButton.isVisible().catch(() => false);
      if (isVisible) {
        await continueButton.click().catch(() => { });
        console.log("✅ Clicked Continue button");
      }
    }

    console.log("=== addProductToArrival COMPLETED SUCCESSFULLY ===");

  } catch (error) {

    console.error("❌ Error during addProductToArrival:", error.message);

    if (!this.page.isClosed()) {
      await this.page.screenshot({
        path: `add-product-failure-${Date.now()}.png`,
        fullPage: true
      }).catch(() => { });
    }

    throw error;
  }
}

   async addProductToArrivalCRR(productTypeArrivalData, language = 'en',newArrivalQuantity) {

    // Fill dropdowns with language-specific values
    await this.form.selectDropdown(this.productType, productTypeArrivalData.productType[language]);
    await this.form.selectDropdown(this.product, productTypeArrivalData.product[language]);
    await this.form.selectDropdown(this.producer, productTypeArrivalData.producer[language]);
 //   await this.form.selectDropdown(this.commercialName, productTypeArrivalData.commercialName[language]);
    //await this.form.selectDropdown(this.formulation, productTypeArrivalData.formulation[language]);
    await this.form.selectDropdown(this.presentation, productTypeArrivalData.presentation[language]);
   // await this.form.selectDropdown(this.vvmStage, productTypeArrivalData.vvmStage[language]);
    await this.form.selectDropdown(this.routineOrSia, productTypeArrivalData.routineOrSia[language]);
   // await this.form.selectDropdown(this.origin, productTypeArrivalData.origin[language]);
    await this.form.selectDropdown(this.storageLocation, productTypeArrivalData.storageLocation[language]);

    // Input fields
    await this.batchNumber.fill(productTypeArrivalData.batchNumber[language]);
    await this.expiryDate.fill(productTypeArrivalData.expiryDate[language]);
   await this.quantity.fill(newArrivalQuantity.toString());

    // Checkbox/dropdown
    await this.form.selectDropdown(this.freezeIndicator, productTypeArrivalData.freezeIndicator[language]);

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