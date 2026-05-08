import { expect } from '@playwright/test';
const BCGData = require('../testdata/InputData/BCGImmunizationData.json');
import StoreHierarchyData from '../testdata/InputData/StoreHierarchy.json';
const { FormComponent } = require('../components/FormComponent');
const calculationService = require('../service/CalculationService');


class ReportPage {
  constructor(page, language,testData) {
    this.page = page;
    this.form = new FormComponent(page);
    this.language = language;
    this.testData = testData;
  }
  pdfExportOption = () =>this.page.locator('li[role="menuitem"]').first();
  exportButton = () =>this.page.locator('button[aria-controls="long-menu"]');
  reportTab = () => this.page.locator('span[role="menuitem"]').nth(6);
  reportTabInCA = () => this.page.locator('span[role="menuitem"]').nth(4);
  stockStatusTab = () => this.page.locator('[role="tab"]').nth(4);
   iSCPerformance = () => this.page.locator('[role="tab"]').nth(6);
  storeLevelDropdown = () =>
    this.page.locator('[role="button"][aria-labelledby="storeLevel"]');
  startDateInput = () =>
  this.page.locator('input[name="startDate"][type="text"]');
  endDateInput = () =>
  this.page.locator('input[name="endDate"][type="text"]');
  storeDropdown = () =>
    this.page.locator('[role="button"][aria-labelledby="storeId"]');
  includeSecondaryCheckbox = () =>
    this.page.locator("//div[contains(@class,'indicatorContainer')]");
  generateReportButton = () =>
    this.page.locator("//button[contains(@class,'MuiButton-containedPrimary')]");
includeSubstoreCheckbox = () =>
  this.page.locator('input[name="isChildInclude"]');
cceFunctionalityButton = () =>
  this.page.locator('button:has(span.rptname)').nth(1);

  async navigateTOReportsTabAndIscPerfomanceTab(){
  await this.reportTab().click();
  await this.page.waitForLoadState('networkidle');
  await this.iSCPerformance().click();
  }
 async IscPerfomanceTabCceFunctionality(){
  await this.cceFunctionalityButton().click();
  await this.page.waitForLoadState('networkidle');
  }

 async selectLevelsStorePeriodStartAndPeriodEndYear(levelKey,options = {}){
   const { includeSubstore = false } = options;
    await this.form.selectDropdown(this.storeLevelDropdown(), StoreHierarchyData.levels[levelKey][this.language] );
    await this.form.selectOptionByIndex('storeId', 1);
   await this.startDateInput().fill(this.getStartDateMinus3Months());
  if (includeSubstore) { 
    await this.includeSubstoreCheckbox().click();
  }
    await this.generateReportButton().click();
 }
 getStartDateMinus3Months() {
  const date = new Date();

  // subtract 3 months
  date.setMonth(date.getMonth() - 3);

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${month}-${year}`;
}

  async navigateToStockStatusAndOpenDropdowns(levelKey, options = {}) {
  const { includeSubstore = false } = options;

  // Click Reports tab
  await this.reportTab().click();
  await this.page.waitForLoadState('networkidle');

  // Click Stock Status tab
  await this.stockStatusTab().click();
  //await this.page.waitForTimeout(8000);

  await this.form.selectDropdown(
    this.storeLevelDropdown(),
    StoreHierarchyData.levels[levelKey][this.language]
  );

  await this.form.selectOptionByIndex('storeId', 1);

  await this.form.selectReactSelectByIndex(
    this.includeSecondaryCheckbox(),
     [0,1
] );

  
  if (includeSubstore) {
  
    await this.includeSubstoreCheckbox().click();

    console.log(' Include Substore selected');
  }

  //await this.page.waitForTimeout(500);
  await this.generateReportButton().click();

  //await this.page.waitForTimeout(500);


}
 async highlightTdAndVerifyTooltipForGenerateReportTable(vaccineName) {

  // wait until actual data rows appear
  await this.page.waitForFunction(() => {

    const rows = document.querySelectorAll('tbody tr');

    return Array.from(rows).some(row =>
      !row.innerText.includes('No records to display')
    );

  }, { timeout: 15000 });

  const rows = this.page.locator('tbody tr');
  const rowCount = await rows.count();

  for (let i = 0; i < rowCount; i++) {

    const row = rows.nth(i);

    const productCell = row.locator('td:nth-child(1)');

    const productValue =
      (await productCell.textContent())?.trim();

    console.log(`Checking row: ${productValue}`);

    if (productValue === vaccineName) {

      await row.evaluate(el => {
        el.style.background = 'yellow';
      });

      const td5 = row.locator('td:nth-child(5)');

      await td5.evaluate(el => {
        el.style.background = 'green';
        el.style.color = 'white';
        el.style.fontWeight = 'bold';
      });

      const tooltipElement =
        td5.locator('[data-tooltip]').first();

      const tooltipText =
        await tooltipElement.getAttribute('data-tooltip');

      console.log(`Vaccine: ${vaccineName}`);
      console.log(`Tooltip found: ${tooltipText || 'No tooltip found'}`);

      return tooltipText;
    }
  }

  throw new Error(`Vaccine not found: ${vaccineName}`);
}
async getNonFunctionalCellDataByStore(storeName) {

  const row = this.page.locator('tbody tr', {
    has: this.page.locator('td:nth-child(2)', {
      hasText: new RegExp(`^${storeName}$`)
    })
  }).first();

  await row.waitFor({ state: 'visible' });

  const lastCell = row.locator('td').last();

  // ✅ get text
  const text = await lastCell.textContent();
  const value = parseInt(text?.trim() || '0', 10);

  // ✅ get class (color)
  const className = await lastCell.getAttribute('class');

  let color = 'unknown';

  if (className.includes('red-alram')) {
    color = 'red';
  } else if (className.includes('green-alram')) {
    color = 'green';
  } else if (className.includes('gray-alram')) {
    color = 'gray';
  }

  // console.log(`Store: ${storeName}`);
  // console.log(`Value: ${value}`);
  // console.log(`Color: ${color}`);

  return {
    value,
    color
  };
}

async verifyStockColor(productName) {
const row = this.page.locator('tbody tr')
  .filter({ hasText: productName })
  .first();
   await expect(row).toBeVisible();
  // await this.page.locator('tbody tr').first().waitFor();
   await this.page.waitForLoadState('networkidle');
  const rows = this.page.locator('.bc-row-parent');
  const count = await rows.count();

  console.log(` Total rows found: ${count}`);

  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);

    const name = await row.locator('.bc-cell-title').innerText();
    const trimmedName = name.trim();

    console.log(`➡️ Checking row ${i}: ${trimmedName}`);

    if (trimmedName === productName) {
      console.log(`✅ Match found: ${productName}`);

    
      const colorBar = row.locator('[class*="bc-fillbar"]').first();

      await colorBar.waitFor({ state: 'attached' });

      const classAttr = await colorBar.getAttribute('class');
      console.log(` Class attribute: ${classAttr}`);

      if (!classAttr) {
        throw new Error(` No class found on fillbar`);
      }

      if (classAttr.includes('bc-fillbar-red')) {
        console.log(` FINAL COLOR: red`);
        return 'red';
      }

      if (classAttr.includes('bc-fillbar-blue')) {
        console.log(` FINAL COLOR: blue`);
        return 'blue';
      }

      throw new Error(` Unknown color class: ${classAttr}`);
    }
  }

  throw new Error(` Product not found: ${productName}`);
}
async highlightProductColumn(productName) {

   const row = this.page.locator('thead th')
  .filter({ hasText: productName })
  .first();

try {
  await expect(row).toBeVisible(); 
} catch {
  console.warn(`Row "${productName}" not present`);
  return;
}

    if (!productName) {
        console.log(" No product name provided");
        return [];
    }

    console.log(` Highlighting & verifying column: "${productName}"`);

    // =========================
    // 1. FIND START COLUMN (FIXED)
    // =========================
    const startCol = await this.page.evaluate((prod) => {
        const ths = Array.from(document.querySelectorAll('thead tr:first-child th'));

        let colIndex = 0;

        for (const th of ths) {
            const text = th.textContent.trim();
            const colSpan = parseInt(th.getAttribute('colspan') || '1', 10);

            if (text.includes(prod)) {
                return colIndex + 1; // 1-based index for tbody
            }

            colIndex += colSpan;
        }

        return -1;
    }, productName);

    if (startCol === -1) {
        console.log(`❌ Column not found for "${productName}"`);
        return [];
    }

    console.log(` Product "${productName}" starts at column: ${startCol}`);

    // =========================
    // 2. ROW LOOP
    // =========================
    const rows = this.page.locator('tbody tr');
    const rowCount = await rows.count();

    let tooltips = [];

    for (let i = 0; i < rowCount; i++) {

        const row = rows.nth(i);

        // skip filter row
        const isFilterRow = await row.locator('input').count() > 0;
        if (isFilterRow) continue;

        const dosesCell = row.locator(`td:nth-child(${startCol})`);
        const weeksCell = row.locator(`td:nth-child(${startCol + 1})`);

        // =========================
        // 3. HIGHLIGHT CELLS
        // =========================
        await dosesCell.evaluate(el => {
            el.style.backgroundColor = "#fff3cd";
            el.style.border = "3px solid red";
        });

        await weeksCell.evaluate(el => {
            el.style.backgroundColor = "#fff3cd";
            el.style.border = "3px solid red";
        });

        // =========================
        // 4. READ VALUES
        // =========================
        const dosesValue = (await dosesCell.textContent() || '').trim();
        const weeksValue = (await weeksCell.textContent() || '').trim();

        console.log(`Row ${i} → Doses: ${dosesValue}, Weeks: ${weeksValue}`);

        // =========================
        // 5. TOOLTIP CHECK (Weeks only)
        // =========================
        const tooltipLocator = weeksCell.locator('.current-stock-bal-tooltip');
        const count = await tooltipLocator.count();

        if (count > 0) {

            const firstTooltip = tooltipLocator.first();

            const visibility = await firstTooltip.evaluate(el =>
                getComputedStyle(el).visibility
            );

            if (visibility === 'visible') {
                const tooltipText = await firstTooltip.getAttribute('data-tooltip');

                if (tooltipText && tooltipText.trim() !== '') {
                    console.log(` Row ${i} Tooltip: "${tooltipText}"`);
                    tooltips.push(tooltipText.trim());
                }
            } else {
                console.log(`Row ${i} tooltip exists but hidden`);
            }

        } else {
            console.log(` Row ${i} No tooltip element found`);
        }
    }

    console.log(` Completed for "${productName}"`);

    //await this.page.waitForTimeout(1000);

    return tooltips;
}
async waitForFunctionalityToLoad() {
  const cell = this.page.locator('tbody tr').first().locator('td').last();

  await expect.poll(async () => {
    const text = await cell.textContent();
    return text?.trim();
  }, {
    timeout: 10000
  }).not.toBe('');
}
async calculateFunctionalityPercentage() {
  const rows = this.page.locator('tbody tr');
  const rowCount = await rows.count();

  let functional = 0;
  let nonFunctional = 0;

  for (let i = 1; i < rowCount - 1; i++) {
    const row = rows.nth(i);
    const lastCell = row.locator('td').last();

    const color = await lastCell.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );

    if (color === 'rgb(167, 218, 111)') {
      functional++;
    } else if (color === 'rgb(237, 125, 57)') {
      nonFunctional++;
    }
  }

  const total = functional + nonFunctional;

  if (total === 0) {
    throw new Error('No equipment rows found');
  }

  const percentage = Math.round((functional / total) * 100);

  console.log(`Functional: ${functional}`);
  console.log(`Non-Functional: ${nonFunctional}`);
  console.log(`Calculated %: ${percentage}`);

  return percentage;
}
async getFunctionalityPercentageFromUI() {
  const row = this.page.locator('tbody tr').first();
  const lastCell = row.locator('td').last();

  const text = await lastCell.textContent();

  const percentage = parseInt(text.trim().replace('%', ''), 10);

  console.log(`UI Percentage: ${percentage}`);

  return percentage;
}
async findAndHighlightRowByName(equipmentKey) {
  const language = this.language || 'en';

  // 🔑 resolve key → actual name
  const equipmentName = this.testData?.[equipmentKey]?.[language];

  if (!equipmentName) {
    throw new Error(`Equipment not found for key: ${equipmentKey}`);
  }

  const row = this.page.locator('tbody tr', {
    has: this.page.locator('td:first-child', {
      hasText: new RegExp(`^${equipmentName}$`)
    })
  }).first();

  await expect(row).toBeVisible();
  await row.scrollIntoViewIfNeeded();

  await row.evaluate((el) => {
    el.style.outline = '3px solid red';
    el.style.outlineOffset = '-2px';
    el.style.backgroundColor = 'rgba(255, 255, 0, 0.4)';
  });

  // ✅ latest month cell
  const lastCell = row.locator('td').last();

  const color = await lastCell.evaluate(el =>
    window.getComputedStyle(el).backgroundColor
  );

  console.log(`Highlighted row: ${equipmentName}, Color: ${color}`);

  return {
    row,
    color
  };
}
async calculateTheExpectedPercentageForAggregatedReports() {

  const rows = this.page.locator('tbody tr');
  const rowCount = await rows.count();

  let totalStores = 0;
  let fullyFunctionalStores = 0;

  // ❗ skip last row (percentage row)
  for (let i = 0; i < rowCount - 1; i++) {

    const row = rows.nth(i);

    const lastCell = row.locator('td').last();

    const className = await lastCell.getAttribute('class');

    // count this as a store row
    totalStores++;

    if (className.includes('green-alram')) {
      fullyFunctionalStores++;
    }
  }

  if (totalStores === 0) {
    throw new Error('No store rows found');
  }

  const percentage = Math.round(
    (fullyFunctionalStores / totalStores) * 100
  );

  console.log(`Total Stores: ${totalStores}`);
  console.log(`Fully Functional Stores: ${fullyFunctionalStores}`);
  console.log(`Calculated %: ${percentage}`);

  return percentage;
}
async expectedPercentageInUI() {

  const lastRow = this.page.locator('tbody tr').last();

  const lastCell = lastRow.locator('td').last();

  const text = await lastCell.textContent();

  const percentage = parseInt(text?.trim().replace('%', '') || '0', 10);

  console.log(`UI %: ${percentage}`);

  return percentage;
}
async verifyExportOptionAndDownloadPdf() {

  const downloadPromise =
    this.page.waitForEvent('download');

  await this.exportButton().click();

  await this.pdfExportOption().click();

  const download =
    await downloadPromise;

  const fileName =
    download.suggestedFilename();

  const filePath =
    await download.path();

  console.log(`Downloaded File: ${fileName}`);
  expect(fileName).toContain('.pdf');
  expect(filePath).toBeTruthy();
}
}

module.exports = { ReportPage };