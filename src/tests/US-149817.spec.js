import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { StoreData } from '../pages/StoreData';
import { HomePage } from '../pages/homePage';
const StockOverviewPage = require('../pages/StockOverviewPage');
const { ReportPage } = require('../pages/reportPage');
const programmeData = require('../testdata/InputData/ProgrammeData.json');
const languages = ['en', 'fr', 'pt', 'es'];
//const languages = ['es'];

languages.forEach(language => {

  test(`Verify Calculation Logic & color coding - Aggregated reports [${language}]`, async ({ page }) => {

    const stockOverviewPageLocal = new StockOverviewPage(page, language, programmeData[0]);
    const reportPage = new ReportPage(page, language, programmeData[0]);
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const storeSetupPage = new StoreData(page, language);

    const subStore1 = programmeData[0].subStore1[language];
    const subStore2 = programmeData[0].subStore2[language];
    const mainStore = programmeData[0].Mainstore[language];

    // =========================
    // SUB STORE 1
    // =========================
    await loginPage.loginAs('syriaStoreOperator', language);
    await storeSetupPage.selectStore(subStore1);

    await stockOverviewPageLocal.addEquipmentForStoreOperator(
      'firstsubStoreSyriaEquipment1',
      'statusFunctional',
      subStore1
    );

    await stockOverviewPageLocal.addEquipmentForStoreOperator(
      'firstsubStoreSyriaEquipment2',
      'statusFunctional',
      subStore1
    );

    await homePage.logout();

    // =========================
    // SUB STORE 2
    // =========================
    await loginPage.loginAs('syriaStoreOperator', language);
    await storeSetupPage.selectStore(subStore2);

    await stockOverviewPageLocal.addEquipmentForStoreOperator(
      'secondsubStoreSyriaEquipment3',
      'statusNonFunctional',
      subStore2
    );

    await stockOverviewPageLocal.addEquipmentForStoreOperator(
      'secondsubStoreSyriaEquipment1',
      'statusFunctional',
      subStore2
    );

    await homePage.logout();

    // =========================
    // MAIN STORE
    // =========================
    await loginPage.loginAs('syriaStoreOperator', language);
    await storeSetupPage.selectStore(mainStore);

    await stockOverviewPageLocal.addEquipmentForStoreOperator(
      'mainStoreEquipment1',
      'statusFunctional',
      mainStore
    );

    await stockOverviewPageLocal.addEquipmentForStoreOperator(
      'mainStoreEquipment2',
      'statusFunctional',
      mainStore
    );

    await stockOverviewPageLocal.addEquipmentForStoreOperator(
      'mainStoreEquipment3',
      'statusNonFunctional',
      mainStore
    );

    await stockOverviewPageLocal.addEquipmentForStoreOperator(
      'mainStoreEquipment4',
      'statusNonFunctional',
      mainStore
    );

    // =========================
    // REPORT
    // =========================
    await reportPage.navigateTOReportsTabAndIscPerfomanceTab();

    await reportPage.selectLevelsStorePeriodStartAndPeriodEndYear(
      'level2',
      { includeSubstore: true }
    );

    await reportPage.IscPerfomanceTabCceFunctionality();
    await reportPage.waitForFunctionalityToLoad();

    // =========================
    // ✅ ASSERTION (VALUE + COLOR)
    // =========================
    const storeMap = stockOverviewPageLocal.getStoreEquipmentMap();

    for (const [storeName, equipments] of Object.entries(storeMap)) {

      const expectedNonFunctional = Object.values(equipments)
        .filter(status => status === 'statusNonFunctional')
        .length;

      const result =
        await reportPage.getNonFunctionalCellDataByStore(storeName);

      console.log(`Store: ${storeName}`);
      console.log(`Expected Count: ${expectedNonFunctional}`);
      console.log(`Actual Count: ${result.value}`);
      console.log(`Actual Color: ${result.color}`);

      // ✅ VALUE ASSERTION
      expect(result.value).toBe(expectedNonFunctional);

      // ✅ COLOR ASSERTION
      const expectedColor = expectedNonFunctional > 0 ? 'red' : 'green';
      expect(result.color).toBe(expectedColor);
    }

    // =========================
    // ✅ PERCENTAGE ASSERTION
    // =========================
    const expectedPercentage =
      await reportPage.calculateTheExpectedPercentageForAggregatedReports();

    const actualPercentage =
      await reportPage.expectedPercentageInUI();

    console.log(`Expected %: ${expectedPercentage}`);
    console.log(`Actual %: ${actualPercentage}`);

    expect(actualPercentage).toBe(expectedPercentage);

  });

});