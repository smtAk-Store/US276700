import { test, expect } from '@playwright/test';
const StockOverviewPage = require('../pages/StockOverviewPage');
import { LoginPage } from '../pages/loginPage';
import { HomePage } from '../pages/homePage';

test('delete all records', async ({ page }) => {

    const stockPage = new StockOverviewPage(page);
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);

    const language = 'en';

    await loginPage.loginAs('countryAdminVietnam', language);

    await stockPage.clearAllData();
});
