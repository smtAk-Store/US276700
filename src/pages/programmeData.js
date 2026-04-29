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
     this.addButtonroutineVaccinations = this.page

  .locator("//button[contains(@class,'MuiButton-containedPrimary')]")
  .nth(0);
  this.closeButton = this.page.locator('button[aria-label="close"]');
   this.addButtonsupplementaryVaccinations = this.page
  .locator("//button[contains(@class,'MuiButton-containedPrimary')]")
  .nth(1);
   this.addButtonotherVaccinations = this.page
  .locator("//button[contains(@class,'MuiButton-containedPrimary')]")
  .nth(2);
  this.routineVaccinations = page
  .locator("div.MuiGrid-root span.sc-fbkhIv")
  .nth(0);
  this.supplyVaccinations = page
  .locator("div.MuiGrid-root span.sc-fbkhIv")
  .nth(1);
  this.otherVaccinations = page
  .locator("div.MuiGrid-root span.sc-fbkhIv")
  .nth(2);
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
  cancelbutton = () => this.page.locator("//button[@aria-label='close']");
  noOfRounds = () => this.page.locator('input[name="noOfRounds"]')
  //button[contains(@class,'MuiButton-containedPrimary')]

 async clickCancelButton() {

  await this.cancelbutton().click();
 }
  async highlightAndClickAdd() {
    // Highlight the active tab (optional visual effect)
    await this.page.evaluate((el) => {
      el.style.border = '2px solid orange';
      el.style.backgroundColor = '#fff8e1';
    }, await this.programmeDataMenu().elementHandle());

    // Small pause to see highlight (optional)
    //await this.page.waitForTimeout(500);

    await this.addButton().click();
    
  }
   async highlightAndClickAddSupplyVaccinations() {
    // Highlight the active tab (optional visual effect)
    await this.page.evaluate((el) => {
      el.style.border = '2px solid orange';
      el.style.backgroundColor = '#fff8e1';
    }, await this.programmeDataMenu().elementHandle());

    // Small pause to see highlight (optional)
    //await this.page.waitForTimeout(500);

    await this.addButtonsupplementaryVaccinations.click();
   
  }
  async fillPopupForm(dataArray, language = 'en') {

  for (const data of dataArray) {

    // =========================
    // DROPDOWNS
    // =========================

    if (data.vaccine?.[language]) {
      await this.form.selectCustomDropdownById(
        'vaccineNameId',
        data.vaccine[language]
      );
    }

    if (data.formulation?.[language]) {
      await this.form.selectCustomDropdownById(
        'formulation',
        data.formulation[language]
      );
    } else {
      await this.form.selectOptionByIndex('formulation', 1);
    }

    if (data.targetGroup?.[language]) {
      await this.form.selectCustomDropdownById(
        'targetGroupId',
        data.targetGroup[language]
      );
    } else {
      await this.form.selectOptionByIndex('targetGroupId', 2);
    }

    if (data.presentation?.[language]) {
      await this.form.selectCustomDropdownById(
        'presentation',
        data.presentation[language]
      );
    }

    if (data.administrationSyringe?.[language]) {
      await this.form.selectCustomDropdownById(
        'administrationSyringeId',
        data.administrationSyringe[language]
      );
    }

    if (data.syringes?.[language]) {
      await this.form.selectCustomDropdownById(
        'syringesId',
        data.syringes[language]
      );
    }

    // =========================
    // TEXT INPUTS
    // =========================

    if (data.dosesTarget?.[language]) {
      await this.form.fillInput(
        this.dosesTargetInput(),
        data.dosesTarget[language]
      );
    }

    if (data.coverageExpected?.[language]) {
      await this.form.fillInput(
        this.coverageExpectedInput(),
        data.coverageExpected[language]
      );
    }

    if (data.wastageRates?.[language]) {
      await this.form.fillInput(
        this.wastageRatesInput(),
        data.wastageRates[language]
      );
    }

    if (data.safetyStock?.[language]) {
      await this.form.fillInput(
        this.safetyStockInput(),
        data.safetyStock[language]
      );
    }

    if (data.leadTime?.[language]) {
      await this.form.fillInput(
        this.leadTimeInput(),
        data.leadTime[language]
      );
    }

    // =========================
    // NEW FIELD: noOfRounds
    // =========================

    if (data.noOfRounds?.[language]) {
      await this.form.fillInput(
        this.noOfRounds(),
        data.noOfRounds[language]
      );
    }
  }

  // ✅ submit at end
  await this.saveButton().click();
}
async createRoutineVaccination(productName, dropdownLocator) {

  await this.routineVaccinations.scrollIntoViewIfNeeded();

  await this.routineVaccinations.evaluate(el => {
    el.style.border = "3px solid red";
    el.style.background = "yellow";
  });

  await this.addButtonroutineVaccinations.click();

  const selectedValue = await this.form.selectDropdown(
    dropdownLocator(),
    productName
  );

  console.log(" The created  supply appearead in Routine Vaccinations :", selectedValue);

  return selectedValue;
}
async createSupplyVaccination(productName, dropdownLocator) {

if (await this.closeButton.count() > 0) {
  await this.closeButton.first().click();
}
  await this.supplyVaccinations.scrollIntoViewIfNeeded();

  await this.supplyVaccinations.evaluate(el => {
    el.style.border = "3px solid red";
    el.style.background = "yellow";
  });

  await this.addButtonsupplementaryVaccinations.click();

  const selectedValue = await this.form.selectDropdown(
    dropdownLocator(),
    productName
  );

  console.log(" The created  supply appearead in Supplymentary Vaccinations :", selectedValue);

  return selectedValue;
}
async createOtherVaccination(productName, dropdownLocator) {

if (await this.closeButton.count() > 0) {
  await this.closeButton.first().click();
}
  await this.otherVaccinations.scrollIntoViewIfNeeded();

  await this.otherVaccinations.evaluate(el => {
    el.style.border = "3px solid red";
    el.style.background = "yellow";
  });

  await this.addButtonotherVaccinations.click();

  const selectedValue = await this.form.selectDropdown(
    dropdownLocator(),
    productName
  );

  console.log(" The created  supply appearead in other Vaccinations :", selectedValue);

  return selectedValue;
}
}


module.exports = { ProgrammeData };