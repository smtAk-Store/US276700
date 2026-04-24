const { FormComponent } = require('../components/FormComponent');

class MasterDataPage {
  constructor(page) {
    this.page = page;
 this.form = new FormComponent(page);
   

    this.masterDataTab = this.page
      .locator("//span[@role='menuitem' and contains(@class,'menu-item')]")
      .nth(1);
      this.masterListTab = this.page.locator('#simple-tab-4');
        this.suppliesTab = this.page.locator('#simple-tab-1');
         this.addButton = this.page
  .locator("//button[contains(@class,'MuiButton-containedPrimary')]")
  .nth(2);
      this.productTypeheader = this.page.locator("(//table[contains(@class,'arabic-list-table')])[11]//thead")
        this.safeInjectionLiElements = this.page.locator("(//table[contains(@class,'arabic-list-table')])[11]//tbody//tr[contains(.,'Safe Injection Equipment')]")
        this.productName = this.page.locator("//div[contains(@class,'MuiTextField-root')]//input[@name='name']");
        this.designationEn = this.page.locator("input[name='designation_en']");
        this.productType = this.page.locator("#productType");
        this.presentation = this.page.locator("input[name='presentation']");
        this.packedVol = this.page.locator("input[name='packedVol']");
        this.packedWeight = this.page.locator("input[name='packedWeight']");
        this.pricePerUnit = this.page.locator("input[name='pricePerUnit']");
        this.freightPercentage = this.page.locator("input[name='frightPercentage']");
        this.submitButton = this.page.locator("button[type='submit']");
  }
  async openAndVerifySafeInjectionEquipment() {

  await this.masterDataTab.click();
  await this.masterListTab.click();
  await this.page.waitForTimeout(2000);

  const header = await this.productTypeheader.first();
  await header.scrollIntoViewIfNeeded();
  await this.page.waitForTimeout(1000);
  await header.evaluate(el => {
    el.style.border = "3px solid red";
    el.style.background = "yellow";
  });

  await this.page.waitForTimeout(1500);
  const count = await this.safeInjectionLiElements.count();
  console.log(`Total matched elements: ${count}`);

  for (let i = 0; i < count; i++) {
    const element = this.safeInjectionLiElements.nth(i);
    await element.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(800);
    await element.evaluate(el => {
      el.style.border = "2px solid blue";
      el.style.background = "lightgreen";
    });
    await this.page.waitForTimeout(1200);
    const text = await element.textContent();
    console.log(`Item ${i + 1}: ${text?.trim()}`);
  }
}
async fillMasterDataForm(masterData, productnames,productTypeValue) {

  await this.suppliesTab.click();
  await this.addButton.click();

  await this.productName.fill(productnames);
  await this.designationEn.fill(productnames);
  await this.presentation.fill(String(masterData.presentation));

  // ✅ fully parameterized dropdown
 await this.form.selectDropdown(this.productType, productTypeValue);

  await this.packedVol.fill(String(masterData.packedVol));
  await this.packedWeight.fill(String(masterData.packedWeight));
  await this.page.waitForTimeout(800);
  await this.pricePerUnit.fill(String(masterData.pricePerUnit));
  await this.freightPercentage.fill(String(masterData.freightPercentage));
  await this.page.waitForTimeout(800);
  await this.submitButton.click();
}
}

export { MasterDataPage };