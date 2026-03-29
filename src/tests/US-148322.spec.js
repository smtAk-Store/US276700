// src/tests/US-148322.spec.js

import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { HomePage } from '../pages/homePage';
const { ProgrammeData } = require('../pages/programmeData');
const programmeData = require('../testdata/InputData/ProgrammeData.json');
const { ArrivalPage } = require('../pages/arrivalPage');
const { StoreData } = require('../pages/StoreData');
const StockOverviewPage = require('../pages/StockOverviewPage');  // direct export, match file casing

// Languages to test
const languages = ['en']; // you can expand: ['en', 'fr', 'pt', 'es']

// Login as country admin before each test
test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  const homePage = new HomePage(page);
  await loginPage.loginAs('countryAdmin');
  await homePage.verifyMenus();
});

test.describe('Programme Data - Add entries for all languages', () => {

  languages.forEach(language => {

    test(`Add Programme Data entry for ${language}`, async ({ page }) => {
      // Instantiate page objects
      const programmePage = new ProgrammeData(page, language);
      const arrivalPage = new ArrivalPage(page, language);
      const storePage = new StoreData(page, language);
    const stockOverviewPage = new StockOverviewPage(page, language);
      const loginPage = new LoginPage(page);
      const homePage = new HomePage(page);

      const [data] = programmeData;

      // ---- Programme Data steps (uncomment when ready) ----
      // await programmePage.highlightAndClickAdd();
      // await programmePage.fillPopupForm(programmeData, language);
      // await arrivalPage.waitForLoadingToFinish();
      // await storePage.navigateToPopulationDemographics();
      // await storePage.editGroup1AndSave();
      // await storePage.editVaccine5AndSave();
      // await storePage.fillStockParametersAndClickDocument();

      // Logout country admin and login as store operator
      await homePage.logout();
      await loginPage.loginAs('storeOperator1');

      // Select the store and navigate to stock overview
      await storePage.selectStore(data.store[language]);
      await stockOverviewPage.navigateTostockOverviewpage();

      // You can add assertions here if needed
      // e.g., expect(await stockOverviewPage.someElement()).toBeVisible();
    });

  });

});