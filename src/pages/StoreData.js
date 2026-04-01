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

  saveButton = () => this.page.locator('div.MuiDialogActions-root button[type="submit"]');
  group1Input = () => this.page.locator('input[name="group1"]');
  vaccineCoverageTab = () => this.page.locator('button#simple-tab-3');
  editButtonVaccineCoverage = () => this.page.locator('div[style="display: flex;"] > button[title="Edit"]');
  vaccine5Input = () => this.page.locator('input[name="vaccine1"]');
  stockParametersTab = () => this.page.locator('#simple-tab-4');
  safetyStockInput = () => this.page.locator('input[aria-label*="Safety Stock"]');
  leadTimeInput = () => this.page.locator('input[aria-label*="Lead Time"]');
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
    console.log('📌 Navigating to Stock Parameters tab...');
    await this.stockParametersTab().click();

    await this.page.waitForTimeout(1500);

    console.log('🔍 Clicking Edit button for CRR row...');

    const crrEditButton = this.page.locator('tr')
      .filter({ hasText: /CRR/i })
      .locator('button[title="Edit"]')
      .first();

    await crrEditButton.click({ timeout: 15000 });

    console.log('✅ Edit button clicked. Waiting for input fields to appear...');

    // Wait for the edit inputs to become visible
    await this.page.waitForSelector('input[aria-label*="Safety Stock"]', { 
      state: 'visible', 
      timeout: 12000 
    });

    await this.page.waitForTimeout(800); // small buffer for MUI

    // Fill the values ONLY ONCE
    await this.safetyStockInput().fill('2');
    await this.leadTimeInput().fill('4');

    console.log('✅ Safety Stock = 2, Lead Time = 4 filled');

    // Click the Document / Save button
    await this.documentButton().click({ timeout: 10000 });

    console.log('✅ Document button clicked for CRR row');
}

  async selectStore(value) {
    await this.form.selectDropdown(this.storeDropdown(), value);
    await this.applyButton().click();

  }
}
module.exports = { StoreData };