import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { HomePage } from '../pages/homePage';
import { ProgrammeData } from '../pages/programmeData';
import { ArrivalPage } from '../pages/arrivalPage';
import { StoreData } from '../pages/StoreData';
import { MasterDataPage } from '../pages/masterDatapage.js';

const StockOverviewPage = require('../pages/StockOverviewPage');
const { ReportPage } = require('../pages/reportPage');
const programmeData = require('../testdata/InputData/ProgrammeData.json');

const languages = ['en'];

languages.forEach(language => {

   test(` ISC performance`, async ({ page }) => {
            const stockOverviewPageLocal = new StockOverviewPage(page, language);
            const reportPage = new ReportPage(page, language);
            const loginPage = new LoginPage(page);
            const storeSetupPage = new StoreData(page, language);
            const homePage = new HomePage(page);
            const masterDataPage = new MasterDataPage(page);

             await loginPage.loginAs('syriaStoreOperator', language);
             await storeSetupPage.selectStore(programmeData[0].Mainstore[language]);
             await stockOverviewPageLocal.addEquipmentForStoreOperator('Equipment 1');
              await stockOverviewPageLocal.addEquipmentForStoreOperator('Equipment 12');
             await reportPage.navigateTOReportsTabAndIscPerfomanceTab();
             await reportPage.selectLevelsStorePeriodStartAndPeriodEndYear('level2');
             await reportPage.IscPerfomanceTabCceFunctionality();
           
            });



    });
