import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { StoreData } from '../pages/StoreData';
const StockOverviewPage = require('../pages/StockOverviewPage');
const { ReportPage } = require('../pages/reportPage');
const programmeData = require('../testdata/InputData/ProgrammeData.json');
const languages = ['en', 'fr', 'pt', 'es'];
//const languages = ['en'];

languages.forEach(language => {
const mainStore = programmeData[0].Mainstore[language];
  test.describe(`ISC Performance Suite (${language})`, () => {

    test(`ISC performance for Functional and Verify Color Coding`, async ({ page }) => {
      const stockOverviewPageLocal = new StockOverviewPage(page, language, programmeData[0]);
      const reportPage = new ReportPage(page, language, programmeData[0]);
      const loginPage = new LoginPage(page);
      const storeSetupPage = new StoreData(page, language);
      await loginPage.loginAs('syriaStoreOperator', language);
      await storeSetupPage.selectStore(mainStore);

      await stockOverviewPageLocal.addEquipmentForStoreOperator('mainStoreEquipment1','statusFunctional',mainStore);
      await stockOverviewPageLocal.addEquipmentForStoreOperator('mainStoreEquipment2','statusFunctional',mainStore);

      await reportPage.navigateTOReportsTabAndIscPerfomanceTab();
      await reportPage.selectLevelsStorePeriodStartAndPeriodEndYear('level2');
      await reportPage.IscPerfomanceTabCceFunctionality();
      await reportPage.waitForFunctionalityToLoad();
      const result = await reportPage.findAndHighlightRowByName('mainStoreEquipment1');
      expect(result.color).toBe('rgb(167, 218, 111)');

      const result1 = await reportPage.findAndHighlightRowByName('mainStoreEquipment2');
      expect(result1.color).toBe('rgb(167, 218, 111)');
    });


    test(`ISC performance for Non Functional and Verify Color Coding`, async ({ page }) => {
      const stockOverviewPageLocal = new StockOverviewPage(page, language, programmeData[0]);
      const reportPage = new ReportPage(page, language, programmeData[0]);
      const loginPage = new LoginPage(page);
      const storeSetupPage = new StoreData(page, language);
      await loginPage.loginAs('syriaStoreOperator', language);
      await storeSetupPage.selectStore(programmeData[0].Mainstore[language]);

      await stockOverviewPageLocal.addEquipmentForStoreOperator('mainStoreEquipment3','statusNonFunctional',mainStore);
      await stockOverviewPageLocal.addEquipmentForStoreOperator('mainStoreEquipment4','statusNonFunctional',mainStore);

      await reportPage.navigateTOReportsTabAndIscPerfomanceTab();
      await reportPage.selectLevelsStorePeriodStartAndPeriodEndYear('level2');
      await reportPage.IscPerfomanceTabCceFunctionality();
      await reportPage.waitForFunctionalityToLoad();
      const result = await reportPage.findAndHighlightRowByName('mainStoreEquipment3');
      expect(result.color).toBe('rgb(237, 125, 57)');

      const result1 = await reportPage.findAndHighlightRowByName('mainStoreEquipment4');
      expect(result1.color).toBe('rgb(237, 125, 57)');
    });


    test(`Verify the Calculation logic for ISC performance`, async ({ page }) => {
      const stockOverviewPageLocal = new StockOverviewPage(page, language, programmeData[0]);
      const reportPage = new ReportPage(page, language, programmeData[0]);
      const loginPage = new LoginPage(page);
      const storeSetupPage = new StoreData(page, language);
      await loginPage.loginAs('syriaStoreOperator', language);
      await storeSetupPage.selectStore(programmeData[0].Mainstore[language]);

      await stockOverviewPageLocal.addEquipmentForStoreOperator('mainStoreEquipment1','statusFunctional',mainStore);
      await stockOverviewPageLocal.addEquipmentForStoreOperator('mainStoreEquipment2','statusFunctional',mainStore);
      await stockOverviewPageLocal.addEquipmentForStoreOperator('mainStoreEquipment3','statusNonFunctional',mainStore);
      await stockOverviewPageLocal.addEquipmentForStoreOperator('mainStoreEquipment4','statusNonFunctional',mainStore);

      await reportPage.navigateTOReportsTabAndIscPerfomanceTab();
      await reportPage.selectLevelsStorePeriodStartAndPeriodEndYear('level2');
      await reportPage.IscPerfomanceTabCceFunctionality();

      await reportPage.waitForFunctionalityToLoad();

      const expectedValue = await reportPage.calculateFunctionalityPercentage();
      const actualValue = await reportPage.getFunctionalityPercentageFromUI();

      expect(actualValue).toBe(expectedValue);
    });

  });

});