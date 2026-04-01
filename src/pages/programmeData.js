const { translate } = require('../utils/translator');
const { FormComponent } = require('../components/FormComponent');
const { log } = require('node:console');
const { generateUniqueSMT, getCurrentDate, verifyButtonEnabled } = require('../utils/reusableFunction');
const { expect } = require('@playwright/test');

class ProgrammeData {
  constructor(page, language) {
    this.page = page;
    this.form = new FormComponent(page);
    this.language = language;
  }
  programmeDataMenu = () =>
    this.page.locator("//span[contains(@class,'MuiMenuItem-root') and contains(@class,'active-menu-item')]");
  addButton = () =>
    this.page.locator("//button[contains(@class,'MuiButton-root') and contains(@class,'MuiButton-containedPrimary')]").first();
  vaccineDropdown = () => 
  this.page.locator('div[role="button"][aria-labelledby="vaccineNameId"]');
  formulationDropdown = () =>
  this.page.locator('div[role="button"][aria-labelledby="formulation"]');
  dosesTargetInput = () => this.page.locator('input[name="dosesTarget"]');
  targetGroupDropdown = () =>
  this.page.locator('div[role="button"][aria-labelledby="targetGroupId"]');
  coverageExpectedInput = () => this.page.locator('input[name="coverageExpected"]');
  presentationDropdown = () =>
  this.page.locator('div[role="button"][aria-labelledby="presentation"]');
  wastageRatesInput = () => this.page.locator('input[name="wastageRates"]');
  administrationSyringeDropdown = () =>
  this.page.locator('div[role="button"][aria-labelledby="administrationSyringeId"]');
  syringesDropdown = () =>
  this.page.locator('div[role="button"][aria-labelledby="syringesId"]');
  safetyStockInput = () => this.page.locator('input[name="safetyStock"]');
  leadTimeInput = () => this.page.locator('input[name="leadTime"]');
  saveButton = () => this.page.locator('button.MuiButton-containedPrimary[type="submit"]');


  async highlightAndClickAdd() {
    // Highlight the active tab (optional visual effect)
    await this.page.evaluate((el) => {
      el.style.border = '2px solid orange';
      el.style.backgroundColor = '#fff8e1';
    }, await this.programmeDataMenu().elementHandle());

    // Small pause to see highlight (optional)
    await this.page.waitForTimeout(500);

    // Click the Add button
    await this.addButton().click();
  }
   async fillPopupForm(dataArray, language = 'en') {
    for (const data of dataArray) {
        // Dropdowns
        if (data.vaccine) {
            await this.form.selectCustomDropdownById('vaccineNameId', data.vaccine[language]);
        }
        if (data.formulation) {

          await this.form.selectOptionByIndex('formulation',1);
          //  await this.form.selectCustomDropdownById('formulation', data.formulation[language]);
        }
        if (data.targetGroup) {
           // await this.form.selectCustomDropdownById('targetGroupId', data.targetGroup[language]);
            await this.form.selectOptionByIndex('targetGroupId',2);
        }
        if (data.presentation) {
            await this.form.selectCustomDropdownById('presentation', data.presentation[language]);
        }
        if (data.administrationSyringe) {
            await this.form.selectCustomDropdownById('administrationSyringeId', data.administrationSyringe[language]);
        }
        if (data.syringes) {
            await this.form.selectCustomDropdownById('syringesId', data.syringes[language]);
        }

        // Text/Number Inputs
        if (data.dosesTarget) await this.form.fillInput(this.dosesTargetInput(), data.dosesTarget[language]);
        if (data.coverageExpected) await this.form.fillInput(this.coverageExpectedInput(), data.coverageExpected[language]);
        if (data.wastageRates) await this.form.fillInput(this.wastageRatesInput(), data.wastageRates[language]);
        if (data.safetyStock) await this.form.fillInput(this.safetyStockInput(), data.safetyStock[language]);
        if (data.leadTime) await this.form.fillInput(this.leadTimeInput(), data.leadTime[language]);
    }
     await this.saveButton().click();
}
}


module.exports = { ProgrammeData };