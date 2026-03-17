import { test } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { HomePage } from '../pages/homePage';
import { loginData } from '../testdata/loginData';

test.describe('SMT Login & Logout', () => {

  test('Verify Login', async ({ page }) => {

    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);

    await loginPage.openApplication();
    await loginPage.login(loginData.email, loginData.password);

    await homePage.verifyMenus();

  });

  test('Verify Logout', async ({ page }) => {

    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);

    await loginPage.openApplication();
    await loginPage.login(loginData.email, loginData.password);
    

    await homePage.logout();

  });

});