import { test } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { HomePage } from '../pages/homePage';
import { UserManagementPage } from '../pages/UserManagementPage';

import { loginData } from '../testdata/loginData';
import userData from '../testdata/createUser.json';

let userPage;

test.describe('User Creation Flow', () => {

  test.beforeEach(async ({ page }) => {

    const loginPage = new LoginPage(page);

    await loginPage.openApplication();
    await loginPage.login(loginData.email, loginData.password);

    userPage = new UserManagementPage(page);

    await userPage.navigate();

  });

  test('Create user using JSON', async () => {

   await userPage.createUser(userData);

    await userPage.verifyUserRowInTable(userData);

  });

  // test.afterAll(async () => {

  //   await userPage.deactivateUser();

  // });

});