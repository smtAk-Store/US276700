import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { StoreData } from '../pages/StoreData';
import { HomePage } from '../pages/homePage';
const StockOverviewPage = require('../pages/StockOverviewPage');
const { ReportPage } = require('../pages/reportPage');
const programmeData = require('../testdata/InputData/ProgrammeData.json');

// const languages = ['en', 'fr', 'pt', 'es'];
const languages = ['en'];

languages.forEach(language => {

  test.describe(
    `@regression12 US-149817 ISC Performance - Percentage of Stores with Full Functionality [${language}]`,
    () => {

      test(`US-149817:TC-01:Verify Calculation Logic and Color Coding for Percentage of Stores with Full Functionality in Aggregated Reports [${language}]`,
        async ({ page }) => {

          const stockOverviewPageLocal = new StockOverviewPage(page, language, programmeData[0]);
          const reportPage = new ReportPage(page, language, programmeData[0]);
          const loginPage = new LoginPage(page);
          const homePage = new HomePage(page);
          const storeSetupPage = new StoreData(page, language);
          const subStore1 = programmeData[0].subStore1[language];
          const subStore2 = programmeData[0].subStore2[language];
          const mainStore = programmeData[0].Mainstore[language];


          await loginPage.loginAs('syriaStoreOperator', language);
          await storeSetupPage.selectStore(subStore1);
          await stockOverviewPageLocal.addEquipmentForStoreOperator('firstsubStoreSyriaEquipment1', 'statusFunctional', subStore1);
          await stockOverviewPageLocal.addEquipmentForStoreOperator('firstsubStoreSyriaEquipment2', 'statusFunctional', subStore1);
          await homePage.logout();



          await loginPage.loginAs('syriaStoreOperator', language);
          await storeSetupPage.selectStore(subStore2);
          await stockOverviewPageLocal.addEquipmentForStoreOperator('secondsubStoreSyriaEquipment3', 'statusNonFunctional', subStore2);
          await stockOverviewPageLocal.addEquipmentForStoreOperator('secondsubStoreSyriaEquipment1', 'statusFunctional', subStore2);
          await homePage.logout();

          await loginPage.loginAs('syriaStoreOperator', language);
          await storeSetupPage.selectStore(mainStore);
          await stockOverviewPageLocal.addEquipmentForStoreOperator('mainStoreEquipment1', 'statusFunctional', mainStore);
          await stockOverviewPageLocal.addEquipmentForStoreOperator('mainStoreEquipment2','statusFunctional',mainStore );
          await stockOverviewPageLocal.addEquipmentForStoreOperator( 'mainStoreEquipment3','statusNonFunctional',mainStore );
          await stockOverviewPageLocal.addEquipmentForStoreOperator('mainStoreEquipment4','statusNonFunctional', mainStore);

          

          await reportPage.navigateTOReportsTabAndIscPerfomanceTab();
          await reportPage.selectLevelsStorePeriodStartAndPeriodEndYear(
            'level2',
            { includeSubstore: true }
          );
          await reportPage.IscPerfomanceTabCceFunctionality();
          await reportPage.waitForFunctionalityToLoad();
          const storeObject =
            stockOverviewPageLocal.getTheStoreObjectData();

          for (const [storeName, equipments]of Object.entries(storeObject)) {
            const expectedNonFunctional =
              Object.values(equipments)
                .filter(
                  status => status === 'statusNonFunctional'
                )
                .length;

            const result =
              await reportPage.getNonFunctionalCellDataByStore(
                storeName
              );

            console.log(`Store: ${storeName}`);
            console.log(`Expected Count: ${expectedNonFunctional}`);
            console.log(`Actual Count: ${result.value}`);
            console.log(`Actual Color: ${result.color}`);

            expect(result.value)
              .toBe(expectedNonFunctional);

            const expectedColor =
              expectedNonFunctional > 0
                ? 'red'
                : 'green';

            expect(result.color)
              .toBe(expectedColor);
          }

         
          const expectedPercentage =
            await reportPage
              .calculateTheExpectedPercentageForAggregatedReports();

          const actualPercentage =
            await reportPage.expectedPercentageInUI();

          console.log(`Expected %: ${expectedPercentage}`);
          console.log(`Actual %: ${actualPercentage}`);

          expect(actualPercentage)
            .toBe(expectedPercentage);

        });
  test(`US-149817:TC-02:Verify pdf is downloaded and export [${language}]`,
        async ({ page }) => {

          const stockOverviewPageLocal = new StockOverviewPage(page, language, programmeData[0]);
          const reportPage = new ReportPage(page, language, programmeData[0]);
          const loginPage = new LoginPage(page);
          const storeSetupPage = new StoreData(page, language);
          const mainStore = programmeData[0].Mainstore[language];


          await loginPage.loginAs('syriaStoreOperator', language);
          await storeSetupPage.selectStore(mainStore);
          await reportPage.navigateTOReportsTabAndIscPerfomanceTab();
          await reportPage.selectLevelsStorePeriodStartAndPeriodEndYear(
            'level2',
            { includeSubstore: true }
          );
          await reportPage.IscPerfomanceTabCceFunctionality();
          await reportPage.waitForFunctionalityToLoad();
          await reportPage.verifyExportOptionAndDownloadPdf();
          
    });
  });
});