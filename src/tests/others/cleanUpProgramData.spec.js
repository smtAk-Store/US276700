import { test, expect } from '@playwright/test';
const StockOverviewPage = require('../../pages/StockOverviewPage');
import { LoginPage } from '../../pages/loginPage';
import { HomePage } from '../../pages/homePage';

test('delete all records in country admin', async ({ page }) => {

    const stockPage = new StockOverviewPage(page);
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);

    const language = 'en';

    await loginPage.loginAs('syriaCountryAdmin', language);

    await stockPage.clearAllData();
});
//  const noRecords = this.page.locator(`
//       //span[contains(text(),'Routine Vaccinations')]
//       /ancestor::div[contains(@class,'sc-kfzAmx')]
//       //td[text()='No records to display']
//     `);