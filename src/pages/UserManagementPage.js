const { FormComponent } = require('../components/FormComponent');
const { TableComponent } = require('../components/TableComponent');

class UserManagementPage {

  constructor(page) {
    this.page = page;
    this.form = new FormComponent(page); // Use the reusable FormComponent
    this.table = new TableComponent(page);
  }

  // Navigate to the users page
  async navigate() {
    await this.page.goto('/users');
  }

  // Fill all fields in the user form (text + dropdowns)
  async fillUserFields(userData) {
    debugger;
    // Text inputs
    await this.form.fillInputs({
      firstName: userData.firstName,
      lastName: userData.lastName,
      userEmail: userData.email,
    });

    // Dropdowns
    await this.form.selectCustomDropdownById('communicationLanguage', userData.language);
    await this.form.selectCustomDropdownById('userRegion[0].role', userData.role);
    await this.form.selectReactSelectByLabel('Region', userData.region);
    await this.form.selectDropdownByPlaceholder(3, userData.country);
  }

  // Create a new user
  async createUser(userData) {
    // Click "Create New User"
    await this.page.getByRole('button', { name: 'Create New User' }).click();

    // Wait for the form to appear
    await this.page.waitForSelector('form');

    // Fill all fields
    await this.fillUserFields(userData);

    // Submit the form
    await this.form.submit();
  }

  // Verify that a user exists in the table — waits long enough (up to 2 minutes or more)
async verifyUserRowInTable(userData, timeout = 60000) {
    const email = userData.email;
    if (!email) throw new Error('userData.email is required');

    console.log(`[VERIFY] Verifying row for user: ${email}`);

    // Step 1: Use table search input (fast for large tables)
    const searchInput = this.page.locator('input[type="search"][placeholder*="filter data"], input[aria-label*="filter"]');

    if (await searchInput.count() > 0) {
      console.log('[DEBUG] Found search input - using filter');
      await searchInput.fill(email.trim());
     // await this.page.waitForTimeout(2000); // wait for filter
    } else {
      console.log('[DEBUG] No search input found - falling back to full scan');
    }

    // Step 2: Find row (case-insensitive partial match)
    const row = this.page.locator('tr').filter({
      hasText: new RegExp(email.trim(), 'i')
    }).first();

    // Step 3: Wait for row
    await row.waitFor({ state: 'visible', timeout }).catch(async () => {
      console.log('[DEBUG] Row not visible yet - scrolling to top');
      await this.page.evaluate(() => {
        const tbody = document.querySelector('table tbody') || document.body;
        tbody.scrollTop = 0;
      });
      //await this.page.waitForTimeout(2000);
      await row.waitFor({ state: 'visible', timeout: timeout / 2 });
    });

    if (await row.count() === 0) {
      await this.page.screenshot({ path: `fail-row-not-found-${Date.now()}.png`, fullPage: true });
      throw new Error(`No row found for email "${email}" after search/filter`);
    }

    console.log(`[VERIFY] Row found`);

    const cells = row.locator('td');

    // Status check - use title attribute (correct for MUI icon)
    const statusIcon = cells.nth(1).locator('span[title]');
    const statusTitle = await statusIcon.getAttribute('title') || '';

    if (!statusTitle.includes('Active')) {
      await row.screenshot({ path: `fail-status-${email}-${Date.now()}.png` });
      throw new Error(`Status is "${statusTitle || 'empty'}" instead of "Active"`);
    }

    console.log(`[VERIFY] Status confirmed: "${statusTitle}"`);

    // Verify other fields
    const checks = [
      { nth: 2, expected: userData.firstName, name: 'firstName' },
      { nth: 3, expected: userData.lastName, name: 'lastName' },
      { nth: 4, expected: email, name: 'email' },
      { nth: 5, expected: userData.role, name: 'Role' },
      { nth: 6, expected: userData.region, name: 'Region' },
      { nth: 7, expected: userData.country, name: 'Country' },
    ];

    for (const { nth, expected, name } of checks) {
      if (expected) {
        const text = await cells.nth(nth).innerText();
        if (!text.trim().includes(expected)) {
          throw new Error(`Mismatch in "${name}": expected "${expected}", found "${text.trim()}"`);
        }
        console.log(`[VERIFY] ${name} matches`);
      }
    }

    console.log(`[VERIFY] Entire row verified successfully for "${email}"`);

    await row.screenshot({ path: `success-row-verified-${Date.now()}.png` });
  }





  // // Deactivate a user
  // async deactivateUser() {
  //   // Open action menu (third button in the row, adjust index if needed)
  //   await this.page.getByRole('button').nth(3).click();

  //   // Change status
  //   await this.page.getByText('Active').click();

  //   // Click Update to save changes
  //   await this.page.getByRole('button', { name: 'Update' }).click();
  // }
}

module.exports = { UserManagementPage };