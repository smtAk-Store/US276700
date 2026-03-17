import { test, expect } from '@playwright/test';

test('verify Draft filter in issuing screen in all languages', async ({ page }) => {

  await page.goto('https://uni-sd-smt-dev.azurewebsites.net/');

  // detect number of languages automatically
  await page.locator('//div[@aria-haspopup="listbox"]').click();
  const totalLanguages = await page.locator('li[role="option"]').count();
  await page.keyboard.press('Escape');

  console.log("Total languages found:", totalLanguages);

  for (let i = 0; i < totalLanguages; i++) {

    console.log("Testing language index:", i);

    // open language dropdown
    await page.locator('//div[@aria-haspopup="listbox"]').click();

    // select language by index
    await page.locator('li[role="option"]').nth(i).click();

    // Login
    await page.locator("(//button[contains(@class,'MuiButton-colorInherit')]/span)[1]").click();
    await page.locator("(//div[contains(@class,'MuiGrid-root MuiGrid-item')]/button)[3]").click();

    await page.locator('//input[@type="email"]').fill('operatorstore26@gmail.com');
    await page.locator('//input[@type="password"]').fill('Yawmtech@');

    await page.locator('//button[@id="next"]').click();

    // Select role
    await page.locator('//div[@aria-labelledby="roleId"]').click();
    await page.locator('(//ul[@role="listbox"]/li)[3]').click();
    await page.locator('//button[@type="button"]').click();

    // Navigate to Issuing tab
    await page.locator('span[role="menuitem"]').nth(3).click();

    // Apply Draft filter
    await page.locator('.MuiSelect-root').first().click();
    await page.locator('li[role="option"]').first().click();
    await page.keyboard.press('Escape');

    // Locate Draft badge
    const secondRow = page.locator('tbody tr').nth(1);
    const statusCell = secondRow.locator('td').nth(4);
    const statusBadge = statusCell.locator('span');

    // Highlight element
    await statusBadge.evaluate(el => {
      el.style.border = '4px solid red';
      el.style.transition = 'all 0.4s ease';
    });

    // Get color
    const stateColor = await statusBadge.evaluate(el =>
      getComputedStyle(el).backgroundColor
    );

    console.log('Draft Issue State color:', stateColor);

    // Assertion
    expect(stateColor).toBe('rgb(255, 193, 7)');

    // Logout
    await page.locator("(((//div[contains(@class,'MuiGrid-root MuiGrid-container')])[2]/div)[3]/div/div/div/div)[3]/*").click();
    await page.locator("(//button[contains(@class,'dd-logout-button')]/span)[1]").click();

    // wait for login screen again
   // reset application for next language
await page.goto('https://uni-sd-smt-dev.azurewebsites.net/');
    

  }

});

test('verify Completed filter in issuing screen in all languages', async ({ page }) => {

  await page.goto('https://uni-sd-smt-dev.azurewebsites.net/');

  // detect number of languages automatically
  await page.locator('//div[@aria-haspopup="listbox"]').click();
  const totalLanguages = await page.locator('li[role="option"]').count();
  await page.keyboard.press('Escape');

  console.log("Total languages:", totalLanguages);

  for (let i = 0; i < totalLanguages; i++) {

    console.log("Testing language index:", i);

    // open language dropdown
    await page.locator('//div[@aria-haspopup="listbox"]').click();

    // select language by index
    await page.locator('li[role="option"]').nth(i).click();

    // Login
    await page.locator("(//button[contains(@class,'MuiButton-colorInherit')]/span)[1]").click();
    await page.locator("(//div[contains(@class,'MuiGrid-root MuiGrid-item')]/button)[3]").click();

    await page.locator('//input[@type="email"]').fill('operatorstore26@gmail.com');
    await page.locator('//input[@type="password"]').fill('Yawmtech@');

    await page.locator('//button[@id="next"]').click();

    // Select role
    await page.locator('//div[@aria-labelledby="roleId"]').click();
    await page.locator('(//ul[@role="listbox"]/li)[3]').click();
    await page.locator('//button[@type="button"]').click();

    // Navigate to Issuing tab
    await page.locator('span[role="menuitem"]').nth(3).click();

    // Open filter dropdown
    await page.locator('.MuiSelect-root').first().click();

    // Select Completed option
    await page.locator('li[role="option"]').nth(1).click();

    // Close dropdown
    await page.keyboard.press('Escape');

    // Locate status badge (same generic locator as Draft)
    const secondRow = page.locator('tbody tr').nth(1);
    const statusCell = secondRow.locator('td').nth(4);
    const statusBadge = statusCell.locator('span');

    // Highlight element
    await statusBadge.evaluate(el => {
      el.style.border = '4px solid red';
      el.style.transition = 'all 0.4s ease';
    });

    // Get color
    const stateColor = await statusBadge.evaluate(el =>
      getComputedStyle(el).backgroundColor
    );

    console.log('Completed Issue State color:', stateColor);

    // Assertion
    expect(stateColor).toBe('rgb(76, 175, 80)');

    // Logout
    await page.locator("(((//div[contains(@class,'MuiGrid-root MuiGrid-container')])[2]/div)[3]/div/div/div/div)[3]/*").click();
    await page.locator("(//button[contains(@class,'dd-logout-button')]/span)[1]").click();

    // restart application for next language
    await page.goto('https://uni-sd-smt-dev.azurewebsites.net/');
  }

});

test('verify Draft filter shows only Draft records', async ({ page }) => {

  // 1️⃣ Navigate to SMT
  await page.goto('https://uni-sd-smt-dev.azurewebsites.net/');

  // 2️⃣ Login
  await page.locator("(//button[contains(@class,'MuiButton-colorInherit')]/span)[1]").click();
  await page.getByRole('button', { name: 'Proceed To Login' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('operatorstore26@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('Yawmtech@');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // 3️⃣ Select role
  await page.getByRole('button', { name: 'Store Operator‎' }).click();
  await page.locator('#menu-roleId').getByText('Store Operator‎').click();
  await page.getByRole('button', { name: 'Apply' }).click();

  // 4️⃣ Navigate to Issuing screen
  await page.getByRole('menuitem', { name: 'Issuing' }).click();

  // 5️⃣ Apply Draft filter
  await page.locator('.MuiSelect-root').first().click();
  await page.getByText('Draft').click();
  await page.keyboard.press('Escape');

  // 6️⃣ Locate all Draft states
  const states = page.locator('td[value="Draft"] span');

  const count = await states.count();
  console.log('Total Draft records:', count);

  // 7️⃣ Verify each row shows Draft
  for (let i = 0; i < count; i++) {
    await expect(states.nth(i)).toHaveText('Draft');
  }

});

test('verify Completed filter shows only Completed records', async ({ page }) => {

  // 1️⃣ Navigate to SMT
  await page.goto('https://uni-sd-smt-dev.azurewebsites.net/');

  // 2️⃣ Login
  await page.locator("(//button[contains(@class,'MuiButton-colorInherit')]/span)[1]").click();
  await page.getByRole('button', { name: 'Proceed To Login' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('operatorstore26@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('Yawmtech@');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // 3️⃣ Select role
  await page.getByRole('button', { name: 'Store Operator‎' }).click();
  await page.locator('#menu-roleId').getByText('Store Operator‎').click();
  await page.getByRole('button', { name: 'Apply' }).click();

  // 4️⃣ Navigate to Issuing screen
  await page.getByRole('menuitem', { name: 'Issuing' }).click();

  // 5️⃣ Apply Completed filter
  await page.locator('.MuiSelect-root').first().click();
  await page.locator('#menu-').getByText('Complete', { exact: true }).click();
  await page.keyboard.press('Escape');

  // 6️⃣ Locate all Completed states
  const states = page.locator('td[value="Complete"] span');

  const count = await states.count();
  console.log('Total Completed records:', count);

  // 7️⃣ Verify each row shows Complete
  for (let i = 0; i < count; i++) {
    await expect(states.nth(i)).toHaveText('Complete ');
  }

});


test('verify Issue Date column is sorted descending by default', async ({ page }) => {
  // 1️⃣ Navigate to SMT login page
  await page.goto('https://uni-sd-smt-dev.azurewebsites.net/');

  // 2️⃣ Login
  await page.locator("(//button[contains(@class,'MuiButton-colorInherit')]/span)[1]").click();
  await page.getByRole('button', { name: 'Proceed To Login' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('operatorstore26@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('Yawmtech@');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // 3️⃣ Set role to Store Operator
  await page.getByRole('button', { name: 'Store Operator‎' }).click();
  await page.locator('#menu-roleId').getByText('Store Operator‎').click();
  await page.getByRole('button', { name: 'Apply' }).click();

  // 4️⃣ Navigate to Issuing screen
  await page.getByRole('menuitem', { name: 'Issuing' }).click();

  // 5️⃣ Get all Issue Date cells
  const dateCells = page.locator('td[data-column="issueDate"]'); // adjust selector if needed
  const count = await dateCells.count();

  let previousDate = null;

  for (let i = 0; i < count; i++) {
    const text = await dateCells.nth(i).innerText();
    const currentDate = new Date(text);

    console.log(`Row ${i}: ${text}`);

    if (previousDate) {
      // Assert current date <= previous date (descending)
      expect(currentDate.getTime()).toBeLessThanOrEqual(previousDate.getTime());
    }

    previousDate = currentDate;
  }
});

test('verify Issue Date column is sorted descending by default with highlight', async ({ page }) => {
  await page.goto('https://uni-sd-smt-dev.azurewebsites.net/');

  // --- Login ---
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('button', { name: 'Proceed To Login' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('operatorstore26@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('Yawmtech@');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // --- Set Role ---
  await page.getByRole('button', { name: 'Store Operator‎' }).click();
  await page.locator('#menu-roleId').getByText('Store Operator‎').click();
  await page.getByRole('button', { name: 'Apply' }).click();

  // --- Navigate to Issuing ---
  await page.getByRole('menuitem', { name: 'Issuing' }).click();

  // --- Get all table rows ---
  const rows = page.locator('//tbody/tr');
  const rowCount = await rows.count();

  let prevDate = null;

  // Start from 1 if first row is header
  for (let i = 1; i < rowCount; i++) {
    const row = rows.nth(i);
    const dateCell = row.locator('td').nth(0); // Issue Date column

    // Highlight for visual verification
    await dateCell.evaluate(el => {
      el.style.border = '3px solid orange';
      el.style.transition = 'border 0.3s';
    });

    const text = (await dateCell.innerText()).trim();
    const cellDate = new Date(text.split(' ').reverse().join(' ')); 
    // Simple parsing: "08 Sep 2022" -> "2022 Sep 08"

    console.log(`Row ${i} Issue Date: ${text} -> ${cellDate.toISOString()}`);

    // Verify descending order
    if (prevDate) {
      expect(cellDate.getTime()).toBeLessThanOrEqual(prevDate.getTime());
    }
    prevDate = cellDate;

    // Short pause to visually see highlight
    await page.waitForTimeout(200);
  }
});


test('Create issuing draft and finalize', async ({ page }) => {

// Open application
await page.goto('https://uni-sd-smt-dev.azurewebsites.net/');

// Login
await page.getByRole('button', { name: 'Login' }).click();
await page.getByRole('button', { name: 'Proceed To Login' }).click();

await page.getByRole('textbox', { name: 'Email Address' }).fill('operatorstore26@gmail.com');
await page.getByRole('textbox', { name: 'Password' }).fill('Yawmtech@');
await page.getByRole('textbox', { name: 'Password' }).press('Enter');

// Select Role
await page.getByRole('button', { name: 'Store Operator‎' }).click();
await page.locator('#menu-roleId').getByText('Store Operator‎').click();
await page.getByRole('button', { name: 'Apply' }).click();

// Go to Issuing
await page.getByRole('menuitem', { name: 'Issuing' }).click();
await page.getByRole('button', { name: 'Issue New Stock' }).click();

 await page.locator("//label[@aria-labelledby='issueTypes']").click();

 await page.locator("(//ul[@role='listbox']/li)[2]").click();
// Create new issue


// Issue type


// Select recipient
await page.getByText('Recipient Store / Reason', { exact: true }).click();
await page.getByText('Ahmed').click();

// Add product line
await page.getByRole('button', { name: 'Add Line to Issue' }).click();

await page.locator('#productType').click();
await page.getByRole('option', { name: 'Vaccine‎' }).click();

await page.locator('#product').click();
await page.getByRole('option', { name: 'Dengue‎' }).click();

await page.locator('#batch').click();
await page.getByText('BT1102‎').click();

// Enter quantity
await page.locator('input[name="dosesOrUnit"]').fill('50');

// Add comment
await page.locator('input[name="comment"]').fill('testing');

// Save draft
await page.getByRole('button', { name: 'Save' }).click();
await page.getByRole('button', { name: 'Save as draft and go back' }).click();

// Search recipient
await page.getByRole('searchbox', { name: 'filter data by Recipient' }).fill('Ahmed');

// Open created draft
await page.getByRole('cell', { name: 'Ahmed' }).first().click();

// Verify Draft status
await page.getByText('Draft').click();

// Finalize issue
await page.locator('button').nth(2).click();
await page.getByRole('button', { name: 'Finalize' }).click();

// Verify completed
await page.getByText('Complete').nth(1).click();

// Open completed row
await page.getByRole('cell', { name: 'GMBAhm1672' }).click();

});
