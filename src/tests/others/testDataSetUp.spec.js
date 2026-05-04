
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/loginPage';
import { HomePage } from '../../pages/homePage';
import { ProgrammeData } from '../../pages/programmeData';
import { ArrivalPage } from '../../pages/arrivalPage';
import { StoreData } from '../../pages/StoreData';

const StockOverviewPage = require('../../pages/StockOverviewPage');
const { IssuingPage } = require('../../pages/Issuingpage');

const addLineToArrivalData = require('../../testdata/addlinetoarrival.json');
const addLineToIssueData = require('../../testdata/addLineToIssue.json');
const productData = require('../../testdata/InputData/productArrival.json');
const calculationService = require('../../service/CalculationService');

const programmeData = require('../../testdata/InputData/ProgrammeData.json');
const programDatanew = require('../../testdata/InputData/programdatafornewvaccine.json');
const BCGData = require('../../testdata/InputData/BCGImmunizationData.json');

const productTypeArrivalDataNew = require('../../testdata/InputData/productTypeArrivalnew.json');
const productTypeIssueDataNew = require('../../testdata/InputData/productTypeNewIssue.json');

const { ReportPage } = require('../../pages/reportPage');

 test.describe(`Create test data for all Language ${language}`, () => {

// ================== BEFORE ALL ==================verifyDialogHasText
        test.beforeAll(async ({ browser }) => {

            const page = await browser.newPage();

            try {

                const loginPage = new LoginPage(page);
                const homePage = new HomePage(page);
                const programmePage = new ProgrammeData(page, language);
                const arrivalPage = new ArrivalPage(page, language);
                const storeSetupPage = new StoreData(page, language);

                await loginPage.loginAs('syriaCountryAdmin', language);
                await homePage.verifyMenus();

             
                // await programmePage.highlightAndClickAdd();
                // await programmePage.fillPopupForm(programDatanew, language);

                await arrivalPage.waitForLoadingToFinish();

                await storeSetupPage.navigateToStoreHierarchy();
                await storeSetupPage.addStoreWithSubStore(
                    'level2',
                    'store2',
                    'substorelevel3',
                    'substore1');
                await storeSetupPage.addStoreWithSubStore(
                    'level2',
                    'store2',
                    'substorelevel3',
                    'substore2'
                );
                await storeSetupPage.enterThePopulationDemographicsTabFilterByStoreNamesFillTotalPopulationAndAdultPopulation('store2');
                await storeSetupPage.enterPopulationDemographicsForSubStore('substore1');
                await storeSetupPage.enterPopulationDemographicsForSubStore('substore2');
                await storeSetupPage.enterTheVaccineCoverageTabFilterByStoreNamesFillAlltheValuesFORAllElements('store2');
                await storeSetupPage.enterVaccineCoverageForSubStore('substore1');
                await storeSetupPage.enterVaccineCoverageForSubStore('substore2');
                await storeSetupPage.enterTheStockLevelAndLeadTimeInStockParameters('level2');
                await homePage.logout();

            } catch (error) {
                console.error('Setup failed:', error.message);
                throw error;
            } finally {
                await page.close().catch(() => { });
            }
        });
 });