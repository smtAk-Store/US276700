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
    this.page.locator('span[role="menuitem"]').nth(1);
populationDemographicsTab = () =>
    this.page.locator('button[aria-controls="simple-tabpanel-1"]');
editButton = () => this.page.locator('//button[@title="Edit"] | //button[@title="Modifier"]');
 saveButton = () =>this.page.locator('div.MuiDialogActions-root button[type="submit"]');
 group1Input = () => this.page.locator('input[name="group1"]');
 vaccineCoverageTab = () => this.page.locator('button#simple-tab-3');
 editButtonVaccineCoverage = () =>  this.page.locator('div[style="display: flex;"] > button[title="Edit"]');
 vaccine5Input = () => this.page.locator('input[name="vaccine1"]');
 stockParametersTab = () => this.page.locator('#simple-tab-4');
 safetyStockInput = () => this.page.locator('div.MuiInputBase-root.MuiInput-root input[type="text"]').nth(1);
 leadTimeInput = () => this.page.locator('div.MuiInputBase-root.MuiInput-root input[type="text"]').nth(2);
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
  // Find the row that contains td with value="CRR"
  const rowWithCRR = this.page.locator('tr').filter({
    has: this.page.locator('td[value="CRR"]')
  }).first(); // ensure only 1 row

  // Highlight the CRR cell
  const crrCell = rowWithCRR.locator('td[value="CRR"]').first();
  await crrCell.evaluate(el => {
    el.style.backgroundColor = 'lightyellow';
    el.style.border = '2px solid red';
  });

  // Optional: highlight entire row with lighter color
  await rowWithCRR.evaluate(el => {
    el.style.backgroundColor = 'rgba(255, 255, 0, 0.2)';
  });

  // Click the edit button inside that row only
  const editBtnInRow = rowWithCRR.locator('button[title="Edit"], button[title="Modifier"]').first();
  await editBtnInRow.scrollIntoViewIfNeeded();
  await editBtnInRow.click();

  // Fill the input and save
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
  console.log('✅ Clicked on Stock Parameters tab');

  await this.page.waitForTimeout(10000);           // ← 30 seconds as requested
  await this.page.waitForLoadState('networkidle', { timeout: 40000 }).catch(() => {});

  // Find the row containing 'CRR'
  const rowWithCRR = this.page.locator('tbody.MuiTableBody-root tr').filter({
    hasText: 'CRR'
  }).first();

  // Highlight the 'CRR' cell (second or third td depending on table)
  const crrCell = rowWithCRR.locator('td[value="CRR"]').first();
  await crrCell.evaluate(el => {
    el.style.backgroundColor = 'lightyellow';
    el.style.border = '2px solid red';
  });

  // Click the edit button inside that row
  const editBtnInRow = rowWithCRR.locator('button[title="Modifier"], button[title="Edit"], button:has(svg.arRotate270)').first();
  await editBtnInRow.scrollIntoViewIfNeeded();
  await editBtnInRow.click();

  await this.page.waitForTimeout(10000);
  await this.page.waitForLoadState('networkidle', { timeout: 40000 }).catch(() => {});

// Step 5: Fill Safety Stock (nth(1))
  const safetyInput = this.safetyStockInput();   // ← Call the function!
  await safetyInput.waitFor({ state: 'visible', timeout: 20000 });
  await safetyInput.scrollIntoViewIfNeeded();
  await safetyInput.fill('2');
  await safetyInput.press('Tab');

  // Step 6: Fill Lead Time (nth(2))
  const leadInput = this.leadTimeInput();        // ← Call the function!
  await leadInput.waitFor({ state: 'visible', timeout: 15000 });
  await leadInput.scrollIntoViewIfNeeded();
  await leadInput.fill('4');
  await leadInput.press('Tab');

  // Step 7: Click Document button
  const docButton = this.documentButton();
  await docButton.waitFor({ state: 'visible', timeout: 15000 });
  await docButton.scrollIntoViewIfNeeded();
  await docButton.click();

  // Final wait after save
  await this.page.waitForLoadState('networkidle', { timeout: 40000 }).catch(() => {});

  console.log('✅ Stock parameters (Safety=2, Lead=4) saved successfully');
}
  async selectStore(value) {
  await this.form.selectDropdown(this.storeDropdown(), value);
  await this.applyButton().click();

}
}
module.exports = { StoreData };

