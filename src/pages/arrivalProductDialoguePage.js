const { FormComponent } = require('../components/FormComponent');

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

    this.createButton = page.getByRole('button', { name: /CREATE/i });
  }

  // --- NEW METHOD USING selectDropdown ---
  async addProductToArrival(productData) {
    // Fill dropdowns
    await this.form.selectDropdown(this.productType, productData.productType);
    await this.form.selectDropdown(this.product, productData.product);
    await this.form.selectDropdown(this.producer, productData.producer);
    await this.form.selectDropdown(this.commercialName, productData.commercialName);
    await this.form.selectDropdown(this.formulation, productData.formulation);
    await this.form.selectDropdown(this.presentation, productData.presentation);
    await this.form.selectDropdown(this.vvmStage, productData.vvmStage);
    await this.form.selectDropdown(this.routineOrSia, productData.routineOrSia);
    await this.form.selectDropdown(this.origin, productData.origin);
    await this.form.selectDropdown(this.storageLocation, productData.storageLocation);

    // Input fields
    await this.batchNumber.fill(productData.batchNumber);
    await this.expiryDate.fill(productData.expiryDate);
    await this.quantity.fill(productData.quantity);

    // Checkbox/dropdown
    await this.form.selectDropdown(this.freezeIndicator, productData.freezeIndicator);

    // Click Save/Create
    await this.createButton.click();
    await this.page.waitForLoadState('networkidle');

    // --- Handle "Continue" popup ---
    const continueButton = this.page.locator('button', { hasText: 'Continue' });
    await continueButton.waitFor({ state: 'visible', timeout: 5000 }); // wait for max 5s
    await continueButton.click();
    await this.page.waitForLoadState('networkidle'); // optional, wait for next page/network
}
}