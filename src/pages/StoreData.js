const { translate } = require('../utils/translator');
const { FormComponent } = require('../components/FormComponent');
const { log } = require('node:console');
const { generateUniqueSMT, getCurrentDate, verifyButtonEnabled } = require('../utils/reusableFunction');
const { expect } = require('@playwright/test');
import StoreHierarchyData from '../testdata/InputData/StoreHierarchy.json';
const BCGData = require('../testdata/InputData/BCGImmunizationData.json');

class StoreData {
  constructor(page, language) {
    this.page = page;
    this.form = new FormComponent(page);
    this.language = language;

  }
  createButton = () => this.page.locator('button[type="submit"]');
  storeDataMenu = () =>
    this.page.locator('span[role="menuitem"]').nth(1);
  AddiconinSHtab = () =>
    this.page.locator('button svg path[d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"]').nth(0);
  populationDemographicsTab = () =>
    this.page.locator('button[aria-controls="simple-tabpanel-1"]');
  storeHierarchyTab = () =>
    this.page.locator('button[aria-controls="simple-tabpanel-0"]');
  editButton = () => this.page.locator(
    'button[title="Edit"], button[title="Modifier"], button[title="Editar"], button:has(svg[class*="arRotate270"])'
  );
  saveButton = () => this.page.locator('div.MuiDialogActions-root button[type="submit"]');
  group1Input = () => this.page.locator('input[name="group1"]');
  vaccineCoverageTab = () => this.page.locator('button#simple-tab-3');
  editButtonVaccineCoverage = () => this.page.locator('div[style="display: flex;"] > button[title="Edit"]');
  vaccine5Input = () => this.page.locator('input[name="vaccine1"]');
  stockParametersTab = () => this.page.locator('#simple-tab-4');
  totalPopulation = () => this.page.locator('input[name="population"]');
  adultPopulation = () => this.page.locator('input[name="group3"][type="number"],input[name="group1"][type="number"]');
  survivingInfants = () => this.page.locator('input[name="group2"][type="number"]');
  adolescentGirls = () => this.page.locator('input[name="group1"][type="number"]');
  liveBirths = () => this.page.locator('input[name="group4"][type="number"]');
  safetyStockInput = () => this.page.locator('div.MuiInputBase-root.MuiInput-root input[type="text"]').nth(1);
  leadTimeInput = () => this.page.locator('div.MuiInputBase-root.MuiInput-root input[type="text"]').nth(2);
  minimumStock = () => this.page.locator('div.MuiInputBase-root.MuiInput-root input[type="text"]').nth(3);
  maximumStock = () => this.page.locator('div.MuiInputBase-root.MuiInput-root input[type="text"]').nth(4);
  documentButton = () => this.page.locator('button:has(svg.sc-iNqMTl.hFrbFX.arScaleX)');
  storeDropdown = () => this.page.locator('#storeId');
  applyButton = () => this.page.locator("//button[contains(@class,'MuiButton-containedPrimary') and @type='button']");
  StockLEVEL = () => this.page.locator("//div[@role='button' and @aria-haspopup='listbox' and @aria-labelledby='levelId']");
  StoreName = () => this.page.locator("input[name='sdName']");
  safetyStockInputtop = () =>
    this.page.locator('td input[type="text"]').nth(1);
  leadStockInputtop = () =>
    this.page.locator('td input[type="text"]').nth(2);

  async navigateToPopulationDemographics() {
    await this.storeDataMenu().click();
    await this.page.waitForLoadState('networkidle');
    await this.populationDemographicsTab().click();
    await this.page.waitForLoadState('networkidle');
  }
  async navigateToStoreHierarchy() {
    await this.storeDataMenu().click();
    await this.page.waitForLoadState('networkidle');
    await this.storeHierarchyTab().click();
    await this.page.waitForLoadState('networkidle');
  }

  async addNewStoreInStoreHierarchy(levelKey, storeKey) {
    await this.AddiconinSHtab().click();
    await this.page.waitForLoadState('networkidle');
    await this.page.pause();
    await this.form.selectDropdown(this.StockLEVEL(), StoreHierarchyData.levels[levelKey][this.language]);
    await this.form.selectReactDropdown(this.StoreName(), StoreHierarchyData.storeNames[storeKey][this.language]);
    await this.page.waitForLoadState('networkidle');
    await this.createButton().click();
  }

  async editGroup1AndSave() {

    const rowWithCRR = this.page.locator('tr').filter({
      has: this.page.locator('td[value="CRR"]')
    }).first();


    const crrCell = rowWithCRR.locator('td[value="CRR"]').first();
    await crrCell.evaluate(el => {
      el.style.backgroundColor = 'lightyellow';
      el.style.border = '2px solid red';
    });


    await rowWithCRR.evaluate(el => {
      el.style.backgroundColor = 'rgba(255, 255, 0, 0.2)';
    });


    const editBtnInRow = rowWithCRR.locator(
      'button[title="Edit"], button[title="Modifier"], button[title="Editar"], button:has(svg[class*="arRotate270"])'
    ).first();
    await editBtnInRow.scrollIntoViewIfNeeded();
    await editBtnInRow.click();


    await this.group1Input().fill('50000');
    await this.saveButton().click();
  }
  async editVaccine5AndSave() {
    await this.vaccineCoverageTab().click();
    await this.editButton().nth(6).click();
    await this.vaccine5Input().fill('80');
    await this.saveButton().click();
  }
  async enterTheStockLevelAndLeadTimeInStockParameters(levelKey) {

    await this.stockParametersTab().click();
    await this.page.waitForTimeout(5000);
    const Value = StoreHierarchyData.levels[levelKey][this.language];

    const row = this.page.locator('tbody tr')
      .filter({
        has: this.page.locator(`td[value="${Value}"]`)
      })
      .first();


    if (!(await row.count())) {
      throw new Error(`Row not found for level: ${Value}`);
    }

    await row.scrollIntoViewIfNeeded();

    const editButton = row.locator('button[title="Edit"]');

    await editButton.click();

    console.log(` Clicked Edit for level: ${Value}`);

    await this.form.fillIntegerInput(this.safetyStockInputtop(), BCGData.saftyWeekstop);
    await this.form.fillIntegerInput(this.leadStockInputtop(), BCGData.LeadWeekstop);
    const docButton = this.documentButton();
    await docButton.waitFor({ state: 'visible', timeout: 15000 });
    await docButton.scrollIntoViewIfNeeded();
    await docButton.click();
  }
  async enterTheVaccineCoverageTabFilterByStoreNamesFillAlltheValuesFORAllElements(storeKey) {

    await this.vaccineCoverageTab().click();
    await this.page.waitForTimeout(3000);

    const Value = StoreHierarchyData.storeNames[storeKey][this.language];

    const row = this.page.locator('tbody tr')
      .filter({ has: this.page.locator(`td[value="${Value}"]`) })
      .first();

    if (!(await row.count())) {
      throw new Error(`Row not found for store: ${Value}`);
    }
    await row.scrollIntoViewIfNeeded();
    await this.page.evaluate((el) => {
      el.style.backgroundColor = '#fff3cd';
      el.style.border = '2px solid #ffc107';
    }, await row.elementHandle());

    await row.locator('button[title="Edit"]').click();
    console.log(` Find the Row Filling all vaccineInputs for : ${Value}`);

    await this.page.waitForTimeout(2000);
    const allVaccineInputs = this.page.locator('input[name^="vaccine"]');

    const count = await allVaccineInputs.count();
    if (count === 0) {
      throw new Error('No vaccine input fields found!');
    }

    for (let i = 0; i < count; i++) {
      const input = allVaccineInputs.nth(i);
      await input.scrollIntoViewIfNeeded();
      await input.fill('');
      await this.form.fillIntegerInput(input, BCGData.ValueforAllVaccineCoverageInputs);
      const fieldName = await input.getAttribute('name');
      console.log(`   Filled ${fieldName} → ${BCGData.ValueforAllVaccineCoverageInputs}`);
    }
    await this.saveButton().click();
  }
  async enterThePopulationDemographicsTabFilterByStoreNamesFillTotalPopulationAndAdultPopulation(storeKey) {

    await this.populationDemographicsTab().click();
    await this.page.waitForTimeout(3000);

    const Value = StoreHierarchyData.storeNames[storeKey][this.language];

    const row = this.page.locator('tbody tr')
      .filter({ has: this.page.locator(`td[value="${Value}"]`) })
      .first();

    if (!(await row.count())) {
      throw new Error(`Row not found for store: ${Value}`);
    }
    await row.scrollIntoViewIfNeeded();
    await this.page.evaluate((el) => {
      el.style.backgroundColor = '#fff3cd';
      el.style.border = '2px solid #ffc107';
    }, await row.elementHandle());

    await row.locator('button[title="Edit"]').click();
    console.log(`Giving the count to : ${Value}`);

    await this.page.waitForTimeout(2000);
    await this.form.fillIntegerInput(this.totalPopulation(), BCGData.total_population);
    await this.form.fillIntegerInput(this.adultPopulation(), BCGData.adult_population);
    await this.page.waitForTimeout(800);
    await this.saveButton().click();
  }


  async fillStockParametersAndClickDocument() {
    await this.stockParametersTab().click();
    console.log(' Clicked on Stock Parameters tab');

    await this.page.waitForTimeout(10000);
    await this.page.waitForLoadState('networkidle', { timeout: 40000 }).catch(() => { });


    const rowWithCRR = this.page.locator('tbody.MuiTableBody-root tr').filter({
      hasText: 'CRR'
    }).first();


    const crrCell = rowWithCRR.locator('td[value="CRR"]').first();
    await crrCell.evaluate(el => {
      el.style.backgroundColor = 'lightyellow';
      el.style.border = '2px solid red';
    });


    const editBtnInRow = rowWithCRR.locator(
      'button[title="Modifier"], button[title="Edit"], button[title="Editar"], button:has(svg[class*="arRotate270"])'
    ).first();
    await editBtnInRow.scrollIntoViewIfNeeded();
    await editBtnInRow.click();

    await this.page.waitForTimeout(10000);
    await this.page.waitForLoadState('networkidle', { timeout: 40000 }).catch(() => { });


    const safetyInput = this.safetyStockInput();
    await safetyInput.waitFor({ state: 'visible', timeout: 20000 });
    await safetyInput.scrollIntoViewIfNeeded();
    await safetyInput.fill('2');
    await safetyInput.press('Tab');

    
    const leadInput = this.leadTimeInput();
    const minimumStock = this.minimumStock();
    const maximumStock = this.maximumStock();       
    await leadInput.waitFor({ state: 'visible', timeout: 15000 });
    await leadInput.scrollIntoViewIfNeeded();
    await leadInput.fill('4');
    await leadInput.press('Tab');
    await minimumStock.fill('2');
    await minimumStock.press('Tab');
    await maximumStock.fill('4');
    await maximumStock.press('Tab');


    const docButton = this.documentButton();
    await docButton.waitFor({ state: 'visible', timeout: 15000 });
    await docButton.scrollIntoViewIfNeeded();
    await docButton.click();


    await this.page.waitForLoadState('networkidle', { timeout: 40000 }).catch(() => { });

    console.log(' Stock parameters (Safety=2, Lead=4) saved successfully');
  }
  async selectStore(value) {
    await this.form.selectDropdown(this.storeDropdown(), value);
    await this.applyButton().click();

  }
}
module.exports = { StoreData };

