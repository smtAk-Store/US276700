const { translate } = require('../utils/translator');
const { FormComponent } = require('../components/FormComponent');
const { log } = require('node:console');
const { generateUniqueSMT, getCurrentDate, verifyButtonEnabled } = require('../utils/reusableFunction');
const { expect } = require('@playwright/test');

class StoreData {
     constructor(page, language) {
    this.page = page;
    this.form = new FormComponent(page);
    this.language = language;
  }
storeDataMenu = () =>
    this.page.locator("//span[contains(@class,'MuiMenuItem-root') and normalize-space(text())='Store Data']");
populationDemographicsTab = () =>
    this.page.locator("//button[contains(@class,'MuiTab-root') and normalize-space(span/text())='Population & Demographics']");
editButton = () => this.page.locator('button[title="Edit"]');
 saveButton = () =>this.page.locator('div.MuiDialogActions-root button[type="submit"]');
 group1Input = () => this.page.locator('input[name="group1"]');
 vaccineCoverageTab = () => this.page.locator('button#simple-tab-3');
 editButtonVaccineCoverage = () =>  this.page.locator('div[style="display: flex;"] > button[title="Edit"]');
 vaccine5Input = () => this.page.locator('input[name="vaccine1"]');
 stockParametersTab = () => this.page.locator('#simple-tab-4');
 safetyStockInput = () => this.page.locator('input[aria-label="Safety Stock (weeks)"]');
 leadTimeInput = () => this.page.locator('input[aria-label="Lead Time (weeks)"]');
 documentButton = () => this.page.locator('button:has(svg.sc-iNqMTl.hFrbFX.arScaleX)');
 storeDropdown = () => this.page.locator('#storeId');
 applyButton = () => this.page.locator("//button[contains(@class,'MuiButton-containedPrimary') and @type='button']");


  async navigateToPopulationDemographics() {
        await this.storeDataMenu().click();
        await this.page.waitForLoadState('networkidle'); // optional: wait for menu click to render tabs
        await this.populationDemographicsTab().click();
        await this.page.waitForLoadState('networkidle'); // optional: wait for tab content to load
    }
   async editGroup1AndSave() {
    // Click the Edit button at the 3rd row (nth index 2)
    await this.editButton().nth(2).click();
    await this.group1Input().fill('50000');
    await this.saveButton().click();
}
async editVaccine5AndSave() {
   await this.vaccineCoverageTab().click();
  await this.editButton().nth(6).click();
  await this.vaccine5Input().fill('80');
  await this.saveButton().click();
}
 async fillStockParametersAndClickDocument() {
    
    await this.stockParametersTab().click();
    await this.editButton().nth(6).click();
    await this.safetyStockInput().fill('2');
    await this.leadTimeInput().fill('4');
    await this.documentButton().click();
  }
  async selectStore(value) {
  await this.form.selectDropdown(this.storeDropdown(), value);
  await this.applyButton().click();

}
}
module.exports = { StoreData };