const { expect } = require('@playwright/test');
const { BaseComponent } = require('./BaseComponent');

class TableComponent extends BaseComponent {

  async isRowPresent(text) {
    await expect(this.page.getByRole('row', { name: new RegExp(text) })).toBeVisible();
  }

  async clickDeleteInRow(text) {
    const row = this.page.getByRole('row', { name: new RegExp(text) });
    await row.getByRole('button', { name: /delete/i }).click();
  }

  async verifyUserInTable(email, expectedData = {}, timeout = 30000) {
    console.log(`[VERIFY] Checking if user with email "${email}" exists in table`);

    // Wait for table to load
    await this.page.locator('table').waitFor({ state: 'visible', timeout: 15000 });

    // Search for the user by email
    const row = this.page.locator('tr').filter({ hasText: email }).first();

    await row.waitFor({ state: 'visible', timeout }).catch(async () => {
      // Try scrolling to bottom if paginated
      await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await this.page.waitForTimeout(1000);
    });

    // Check if row exists
    if (await row.count() === 0) {
      throw new Error(`User with email "${email}" not found in table after ${timeout}ms`);
    }

    console.log(`[VERIFY] Row found for "${email}"`);

    // Extract visible text from the row
    const rowText = await row.innerText();

    // Basic validation
    if (!rowText.includes(email)) {
      throw new Error(`Email "${email}" not found in row text`);
    }

    // Optional field validations
    if (expectedData.firstName) {
      await expect(row.locator('td').nth(2)).toContainText(expectedData.firstName, { timeout: 5000 });
    }

    if (expectedData.lastName) {
      await expect(row.locator('td').nth(3)).toContainText(expectedData.lastName, { timeout: 5000 });
    }

    if (expectedData.role) {
      await expect(row.locator('td').nth(5)).toContainText(expectedData.role, { timeout: 5000 });
    }

    if (expectedData.region) {
      await expect(row.locator('td').nth(6)).toContainText(expectedData.region, { timeout: 5000 });
    }

    if (expectedData.country) {
      await expect(row.locator('td').nth(7)).toContainText(expectedData.country, { timeout: 5000 });
    }

    if (expectedData.status) {
      await expect(row.locator('td').nth(1).locator('span[title]')).toHaveAttribute('title', expectedData.status);
    }

    console.log(`[VERIFY] All checks passed for user "${email}"`);
    return true;
  }

  /**
   * Verifies user creation by email and refreshes table if needed
   */
  async verifyNewUserCreated(email, expected = {}) {
    console.log(`[VERIFY] Verifying new user creation for "${email}"`);

    // Optional: Refresh table if needed
    await this.page.locator('button', { hasText: /refresh/i }).click().catch(() => { });

    await this.page.waitForTimeout(2000); // wait for refresh

    await this.verifyUserInTable(email, expected);
  }

  /**
   * Searches table by email and verifies user details in the row
   */
  async searchAndVerifyUser(email, expected) {
    const searchInput = this.page.locator('input[type="search"][placeholder*="filter data"]');

    await searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await searchInput.fill(email);
    await this.page.waitForTimeout(1500); // wait for table filter

    await this.verifyUserInTable(email, expected);
  }

  /**
   * Main reusable method — verifies full row using userData object
   * Uses case-insensitive match, status via title attribute, screenshots on fail/success
   */
  async verifyUserRowInTable(userData, timeout = 60000) {
    const email = userData.email;

    if (!email) {
      throw new Error('userData.email is required to locate the row');
    }

    console.log(`[VERIFY] Checking entire row for user: ${email}`);

    // Wait for table rows to load
    await this.page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 15000 });

    // ✅ Updated locator to match your DOM (email inside span title)
    const row = this.page.locator(`tbody tr:has(span[title="${email}"])`).first();

    // Wait for row with retry
    await row.waitFor({ state: 'visible', timeout }).catch(async () => {
      console.log('[DEBUG] Row not visible initially — scrolling table');
      await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await this.page.waitForTimeout(1500);
      await row.waitFor({ state: 'visible', timeout: timeout / 2 });
    });

    if (await row.count() === 0) {
      await this.page.screenshot({ path: `fail-row-not-found-${Date.now()}.png` });
      throw new Error(`User row with email "${email}" not found in table after ${timeout/1000}s`);
    }

    console.log(`[VERIFY] Row located for "${email}"`);

    const cells = row.locator('td');

    // Status check - use title attribute of the icon
    const statusIcon = cells.nth(1).locator('span[title]');
    const statusTitle = await statusIcon.getAttribute('title') || '';

    if (!statusTitle.includes('Active')) {
      await row.screenshot({ path: `fail-status-${email}-${Date.now()}.png` });
      throw new Error(`Status is "${statusTitle || 'empty'}" instead of "Active"`);
    }

    console.log(`[VERIFY] Status confirmed: "${statusTitle}"`);

    // Verify other fields
    const assertions = [
      { column: 2, expected: userData.firstName, name: 'First Name' },
      { column: 3, expected: userData.lastName, name: 'Last Name' },
      { column: 4, expected: email, name: 'Email' },
      { column: 5, expected: userData.role, name: 'Role' },
      { column: 6, expected: userData.region, name: 'Region' },
      { column: 7, expected: userData.country, name: 'Country' },
    ];

    for (const { column, expected, name } of assertions) {
      if (expected) {
        const cellText = await cells.nth(column).innerText();
        if (!cellText.trim().includes(expected)) {
          throw new Error(`Mismatch in "${name}": expected "${expected}", found "${cellText.trim()}"`);
        }
        console.log(`[VERIFY] ${name} matches: "${expected}"`);
      }
    }

    console.log(`[VERIFY] Entire row verified successfully for "${email}"`);

    await this.page.screenshot({ path: `success-row-verified-${Date.now()}.png` });
  }
  async deleteAllRecords() {
    await this.page.waitForTimeout(8000);

    console.log('🟢 deleteAllRecords ENTERED');

    let i = 0;

    while (i++ < 50) {

        const deleteBtn = this.page.locator('button:has(svg path[d*="M6 19"])');
        const deleteCount = await deleteBtn.count();

        const nextBtn = this.page.locator('span[title="Next Page"] button');
        const nextCount = await nextBtn.count();

        console.log(`Loop ${i} - delete: ${deleteCount}, next: ${nextCount}`);

        // ✅ CASE 1: DELETE EXISTS
        if (deleteCount > 0) {

            await deleteBtn.first().click();
            await this.page.waitForTimeout(2000);

            await this.page.locator('button:has-text("Yes")').click();
            await this.page.waitForTimeout(4000);

            continue;
        }

        // ✅ CASE 2: NO DELETE + NO NEXT → EMPTY TABLE
        if (deleteCount === 0 && nextCount === 0) {
            console.log('✅ No items found to delete (table already empty)');
            return;
        }

        // ✅ CASE 3: NO DELETE BUT NEXT EXISTS → PAGINATE
        const isDisabled = await nextBtn.isDisabled().catch(() => true);

        if (isDisabled) {
            console.log('✅ No more pages - deletion complete');
            return;
        }

        await nextBtn.click();
        await this.page.waitForTimeout(2000);
    }

    throw new Error('Loop safety exit triggered (too many iterations)');
}
}

module.exports = { TableComponent };