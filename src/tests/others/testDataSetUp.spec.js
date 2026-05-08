import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/loginPage';
import { HomePage } from '../../pages/homePage';
import { ProgrammeData } from '../../pages/programmeData';
import { ArrivalPage } from '../../pages/arrivalPage';
import { StoreData } from '../../pages/StoreData';

const programDatanew = require('../../testdata/InputData/programdatafornewvaccine.json');

const languages = ['en'];

languages.forEach(language => {

  test.describe(`Create test data for ${language}`, () => {

    test(`Create Program and Store Test Data [${language}]`, async ({ page }) => {

      const loginPage = new LoginPage(page);
      const homePage = new HomePage(page);
      const programmePage = new ProgrammeData(page, language);
      const arrivalPage = new ArrivalPage(page, language);
      const storeSetupPage = new StoreData(page, language);

      await loginPage.loginAs('syriaCountryAdmin', language);

      await homePage.verifyMenus();

      await programmePage.highlightAndClickAdd();

      await programmePage.fillPopupForm(programDatanew, language);
    //  await programmePage.fillPopupForm(programDatanew, language);

      await arrivalPage.waitForLoadingToFinish();

      await storeSetupPage.navigateToStoreHierarchy();

      await storeSetupPage.addStoreWithSubStore('level2', 'store2', 'substorelevel3', 'substore1');

      await storeSetupPage.addStoreWithSubStore('level2', 'store2', 'substorelevel3', 'substore2');

      await storeSetupPage.enterThePopulationDemographicsTabFilterByStoreNamesFillTotalPopulationAndAdultPopulation('store2');

      await storeSetupPage.enterPopulationDemographicsForSubStore('substore1');

      await storeSetupPage.enterPopulationDemographicsForSubStore('substore2');

      await storeSetupPage.enterTheVaccineCoverageTabFilterByStoreNamesFillAlltheValuesFORAllElements('store2');

      await storeSetupPage.enterVaccineCoverageForSubStore('substore1');

      await storeSetupPage.enterVaccineCoverageForSubStore('substore2');

      await storeSetupPage.enterTheStockLevelAndLeadTimeInStockParameters('level2');

      await storeSetupPage.enterTheStockLevelAndLeadTimeInStockParameters('level3');

      await homePage.logout();

    });

  });

});