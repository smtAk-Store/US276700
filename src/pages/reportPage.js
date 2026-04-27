import { expect } from '@playwright/test';
const BCGData = require('../testdata/InputData/BCGImmunizationData.json');
import StoreHierarchyData from '../testdata/InputData/StoreHierarchy.json';
const { FormComponent } = require('../components/FormComponent');
const calculationService = require('../service/CalculationService');

class ReportPage {
  constructor(page, language) {
    this.page = page;
    this.form = new FormComponent(page);
    this.language = language;
  }
  reportTab = () => this.page.locator('span[role="menuitem"]').nth(6);
  stockStatusTab = () => this.page.locator('[role="tab"]').nth(4);
  storeLevelDropdown = () =>
    this.page.locator('[role="button"][aria-labelledby="storeLevel"]');
  storeDropdown = () =>
    this.page.locator('[role="button"][aria-labelledby="storeId"]');
  includeSecondaryCheckbox = () =>
    this.page.locator("//div[contains(@class,'indicatorContainer')]");
  generateReportButton = () =>
    this.page.locator("//button[contains(@class,'MuiButton-containedPrimary')]");
includeSubstoreCheckbox = () =>
  this.page.locator('input[name="isChildInclude"]');

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
   // await this.page.waitForTimeout(500);

    
    await this.includeSubstoreCheckbox().click();

    console.log(' Include Substore selected');
  }

  //await this.page.waitForTimeout(500);
  await this.generateReportButton().click();

  //await this.page.waitForTimeout(500);


}
  async highlightTdAndVerifyTooltipForGenerateReportTable(vaccineName) {
    const rows = this.page.locator('tbody tr');
    const rowCount = await rows.count();

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);

      // get product name from first column
      const productCell = row.locator('td:nth-child(1)');
      const productValue = (await productCell.getAttribute('value'))?.trim();

      if (productValue === vaccineName) {

        
        await row.evaluate(el => {
          el.style.background = 'yellow';
        });

      //await this.page.waitForTimeout(15000);
     
        const td5 = row.locator('td:nth-child(5)');
        await td5.evaluate(el => {
          el.style.background = 'green';
          el.style.color = 'white';
          el.style.fontWeight = 'bold';
        });
       //await this.page.waitForTimeout(15000);

        // 🔍 tooltip check (if exists on td or inner span)
        const tooltipElement = td5.locator('[data-tooltip]').first();
        const tooltipText = await tooltipElement.getAttribute('data-tooltip');

        console.log(`✅ Vaccine: ${vaccineName}`);
        console.log(`🟢 Tooltip found : ${tooltipText || 'No tooltip found'}`);

        return tooltipText;
      }
    }

    throw new Error(` Vaccine not found: ${vaccineName}`);
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

      // 👉 IMPORTANT: pick ONLY ONE bar element
      const colorBar = row.locator('[class*="bc-fillbar"]').first();

      await colorBar.waitFor({ state: 'attached' });

      const classAttr = await colorBar.getAttribute('class');
      console.log(`🎨 Class attribute: ${classAttr}`);

      if (!classAttr) {
        throw new Error(`❌ No class found on fillbar`);
      }

      if (classAttr.includes('bc-fillbar-red')) {
        console.log(`🟥 FINAL COLOR: red`);
        return 'red';
      }

      if (classAttr.includes('bc-fillbar-blue')) {
        console.log(`🟦 FINAL COLOR: blue`);
        return 'blue';
      }

      throw new Error(`❌ Unknown color class: ${classAttr}`);
    }
  }

  throw new Error(`❌ Product not found: ${productName}`);
}
async highlightProductColumn(productName) {

    //await this.page.waitForTimeout(15000);

    if (!productName) {
        console.log("❌ No product name provided");
        return [];
    }

    console.log(`🔍 Highlighting & verifying column: "${productName}"`);

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
}

module.exports = { ReportPage };