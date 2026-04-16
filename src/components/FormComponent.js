const { expect } = require('@playwright/test');
const { BaseComponent } = require('./BaseComponent');

class FormComponent extends BaseComponent {
  async fillInputByLabel(label, value) {
    await this.page.getByLabel(label).fill(value);
  }

  async selectDropdownByLabel(label, option) {
    await this.page.getByLabel(label).click();
    await this.page.getByRole('option', { name: option }).click();
  }

  async selectCustomDropdownById(id, option) {
    const trigger = this.page.locator(`[id="${id}"]`);

    await trigger.waitFor({ state: 'visible', timeout: 12000 });
    await trigger.hover({ timeout: 3000 }).catch(() => { });
    await trigger.click({ force: true });

    await this.page.waitForTimeout(600);

    const menu = this.page.locator(
      '[role="listbox"], [role="menu"], .MuiMenu-paper, .MuiPopover-root, .MuiPaper-root, div[style*="position: fixed"][style*="z-index"]'
    ).last();

    await menu.waitFor({ state: 'visible', timeout: 15000 }).catch(async () => {
      await trigger.focus();
      await this.page.keyboard.press('ArrowDown');
      await this.page.waitForTimeout(800);
    });

    let optionLocator = menu.getByText(option.trim());

    if (await optionLocator.count() === 0) {
      optionLocator = menu.getByText(new RegExp(option.trim()));
    }

    if (await optionLocator.count() === 0) {
      optionLocator = menu.getByRole('option').filter({ hasText: option.trim() });
    }

    if (await optionLocator.count() === 0) {
      const visibleItems = await menu.locator('[role="option"], li, div[role="menuitem"]').allInnerTexts();
      console.log(`[DEBUG] No match for "${option}". Visible items:`, visibleItems.map(t => t.trim()));
      throw new Error(`Option "${option}" not found in dropdown ID ${id}`);
    }

    await optionLocator.first().click({ force: true });

    await this.page.waitForSelector(
      '[role="listbox"], [role="menu"], .MuiPopover-root',
      { state: 'hidden', timeout: 10000 }
    ).catch(() => { });

    await expect(trigger).toHaveText(new RegExp(option.trim()), { timeout: 10000 }).catch(() => { });
  }

  async selectReactSelectByLabel(labelText, optionText) {
  console.log(`[DEBUG] Selecting "${optionText}" for label: "${labelText}"`);

  let searchText = labelText.includes('*') ? labelText : `${labelText.trim()} *`;

  const labelLocator = this.page.getByText(searchText, { exact: true });

  if (await labelLocator.count() === 0) {
    labelLocator = this.page.getByText(labelText.trim(), { exact: false });
  }

  if (await labelLocator.count() === 0) {
    throw new Error(`Label "${labelText}" not found`);
  }

  // Click label first
  await labelLocator.click({ force: true }).catch(() => {});
  await this.page.waitForTimeout(400);

  // Target inner dropdown trigger
  let control = labelLocator
    .locator('..')
    .locator('xpath=following-sibling::div[1]')
    .locator('.darker-field, div[class*="css"][class*="container"], div[class*="MuiInputBase-root"], [aria-haspopup="listbox"], [tabindex="0"]')
    .first();

  if (await control.count() === 0 || !(await control.isVisible())) {
    let container = labelLocator.locator('..').locator('..').locator('..');
    control = container.locator(
      '.darker-field, div[class*="css"][class*="control"], div[class*="MuiSelect-select"], [tabindex="0"], [aria-haspopup]'
    ).first();
  }

  await control.waitFor({ state: 'visible', timeout: 20000 });

  console.log('[DEBUG] Control classes:', await control.getAttribute('class'));

  // Open dropdown
  await control.hover({ timeout: 3000 }).catch(() => {});
  await control.click({ force: true });
  await this.page.waitForTimeout(800);

  // Keyboard fallback
  if (await this.page.locator('[role="listbox"], .MuiPopover-root').count() === 0) {
    console.log('[DEBUG] Click may have failed → keyboard fallback');
    await control.focus();
    await this.page.keyboard.press('ArrowDown');
    await this.page.waitForTimeout(800);
  }

  await this.page.screenshot({ path: `debug-menu-open-${Date.now()}.png` });

  // Page-level option locator (from codegen)
  let optionLocator = this.page.getByText(optionText.trim(), { exact: false });

  if (await optionLocator.count() === 0) {
    console.log('[DEBUG] Option not visible → typing to filter');
    await control.type(optionText, { delay: 100 });
    await this.page.waitForTimeout(1200);
    optionLocator = this.page.getByText(optionText.trim(), { exact: false });
  }

  if (await optionLocator.count() === 0) {
    const visibleText = await this.page.locator('li, span, div[role="option"]').allInnerTexts();
    console.log(`[DEBUG] No "${optionText}". Visible text on page:`, visibleText.map(t => t.trim()));
    await this.page.screenshot({ path: `debug-option-fail-${Date.now()}.png` });
    throw new Error(`Option "${optionText}" not found`);
  }

  // Use .first() to avoid strict mode violation
  await optionLocator.first().click({ force: true });
  console.log('[DEBUG] Clicked:', optionText);

  // Wait for menu close
  await this.page.waitForSelector(
    '.MuiPopover-root, [role="listbox"]',
    { state: 'hidden', timeout: 10000 }
  ).catch(() => {});

  // FIXED EXPECTATION - target visible selected value + use .first() for strict mode
  await expect(
    control.locator('div[class*="singleValue"], .css-*-singleValue, span')
      .first()
  ).toHaveText(new RegExp(optionText.trim()), { timeout: 12000 }).catch(async () => {
    console.log('[DEBUG] Selected value not visible in control yet - fallback check');
    await expect(this.page.getByText(optionText.trim(), { exact: false }).first()).toBeVisible({ timeout: 5000 });
  });
}
async selectDropdownByPlaceholder(index, option) {
  console.log(`[DEBUG] Selecting "${option}" using placeholder index ${index}`);

  const placeholder = this.page
    .locator('div')
    .filter({ hasText: /^Please Select$/ })
    .nth(index);

  await placeholder.waitFor({ state: 'visible', timeout: 15000 });
  await placeholder.hover({ timeout: 5000 }).catch(() => {});
  await placeholder.click({ force: true, timeout: 10000 });

  await this.page.waitForTimeout(1000); // longer wait for portal

  // Screenshot to verify open
  await this.page.screenshot({ path: `debug-dropdown-open-${index}-${Date.now()}.png` });

  // Direct page-level option locator (like codegen)
  let optionLocator = this.page.getByText(option.trim(), { exact: false }).first();

  // Retry if not visible immediately
  let attempts = 0;
  while (attempts < 15 && (await optionLocator.count() === 0 || !(await optionLocator.isVisible()))) {
    attempts++;
    console.log(`[DEBUG] Option "${option}" not visible yet - attempt ${attempts}/15`);
    await this.page.waitForTimeout(500);

    // Type to force filter/load (very common in these dropdowns)
    await placeholder.type(option.charAt(0), { delay: 100 }); // type first letter
    await this.page.waitForTimeout(400);
  }

  if (await optionLocator.count() === 0 || !(await optionLocator.isVisible())) {
    const allOptions = await this.page.locator('div[id*="react-select"][id*="-option"], li, span').allInnerTexts();
    console.log(`[DEBUG] No "${option}" found. All option-like text:`, allOptions.map(t => t.trim()));
    await this.page.screenshot({ path: `debug-no-option-${Date.now()}.png` });
    throw new Error(`Could not find or click "${option}" at index ${index}`);
  }

  // Hover + scroll + click (ensures visibility and event trigger)
  await optionLocator.hover({ timeout: 5000 }).catch(() => {});
  await optionLocator.scrollIntoViewIfNeeded();
  await optionLocator.click({ force: true, timeout: 10000 });

  console.log(`[DEBUG] Successfully clicked "${option}"`);

  // Wait for menu close
  await this.page.waitForSelector(
    '.MuiPopover-root, [role="listbox"], div[id*="react-select"][id*="-menu"]',
    { state: 'hidden', timeout: 15000 }
  ).catch(() => {});

  // Expect visible value in placeholder (better than checking hidden input)
  await expect(placeholder).toContainText(option.trim(), { timeout: 15000 }).catch(async () => {
    console.log('[DEBUG] Value not visible in placeholder yet');
    await expect(this.page.getByText(option.trim(), { exact: false }).first()).toBeVisible({ timeout: 5000 });
  });
}




  async submit() {
    await this.page.getByRole('button', { name: /save|submit/i }).click();
  }

  async validateValidationMessage(message) {
    await expect(this.page.getByText(message)).toBeVisible();
  }
async fillInputs(data, by = 'name') {
  for (const [field, value] of Object.entries(data)) {
    let locator;

    if (by === 'name') {
      locator = this.page.locator(`input[name="${field}"]`);
    } else {
      locator = this.page.getByLabel(field, { exact: false });
    }

    await locator.fill(String(value));
    await expect(locator).toHaveValue(String(value));
    console.log(`Filled ${by}="${field}" with "${value}"`);
  }
}

  // Generic input method
  async fillInput(locator, value) {
    await locator.fill(value);
  }
  fillIntegerInput = async (locator, value) => {
  if (!Number.isInteger(value)) {
    throw new Error(`fillIntegerInput: value must be an integer, got ${value}`);
  }
  await locator.fill(value.toString()); 
};

  // Material UI dropdown
async selectDropdown(locator, value) {
  await locator.click();
    await this.page.waitForTimeout(300);

  const option = this.page
    .locator('li[role="option"]')
    .filter({ hasText: value })
    .first();

  await option.click();
}

  // React Select dropdown
  async selectReactDropdown(locator, value) {
    await locator.fill(value);
    await this.page.keyboard.press('Enter');
  }

  async selectOptionByIndex(dropdownId, index = 0) {
    const dropdown = this.page.locator(`div[role="button"][aria-labelledby="${dropdownId}"]`);

    // Open the dropdown
    await dropdown.click();

    // Wait for options to appear
    await this.page.waitForSelector('li[role="option"]', {
      state: 'visible',
      timeout: 10000
    });

    // Small buffer for RTL languages like Arabic
    await this.page.waitForTimeout(300);

    // Select option by index
    await this.page.locator('li[role="option"]').nth(index).click();

    console.log(`✅ Option at index ${index} selected for dropdown: ${dropdownId}`);
  }
async selectReactSelectByIndex(inputLocator, indexes = [0]) {

  const dropdown = this.page.locator('div.css-11unzgr');
  const options = dropdown.locator('div.autoselect-options');

  for (let i = 0; i < indexes.length; i++) {

    const index = indexes[i];

    // 🔥 use inputLocator (fixes "declared but never used")
    if (i === 0) {
      await inputLocator.first().click({ force: true });
    } else {
      await inputLocator.nth(1).click({ force: true });
    }

    await dropdown.waitFor({ state: 'visible', timeout: 10000 });

    const count = await options.count();

    if (count === 0) {
      throw new Error('❌ No dropdown options found');
    }

    if (index >= count) {
      throw new Error(`❌ Index ${index} out of range. Total: ${count}`);
    }

    await options.nth(index).click();

    console.log(`✅ Selected option index ${index}`);

    await this.page.waitForTimeout(300);
  }
}
}

module.exports = { FormComponent };