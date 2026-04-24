import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { StoreData } from '../pages/StoreData';

const StockOverviewPage = require('../pages/StockOverviewPage');
const addLineToArrivalData = require('../testdata/addlinetoarrival.json');
const addLineToIssueData = require('../testdata/addLineToIssue.json');
const productTypeArrivalDataNew = require('../testdata/InputData/productTypeArrivalnew.json');
const productTypeIssueDataNew = require('../testdata/InputData/productTypeNewIssue.json');
const BCGData = require('../testdata/InputData/BCGImmunizationData.json');
const programDatanew = require('../testdata/InputData/programdatafornewvaccine.json');
const programmeData = require('../testdata/InputData/ProgrammeData.json');
import testData from '../testdata/InputData/draftandcomplete.json';

const languages = ['en'];
test.describe('Stock Overview - Draft/Complete Filter & Color Validation', () => {

    languages.forEach(language => {

        test(`Draft filter and color coding for supplies (${language})`, async ({ page }) => {

            const stockOverviewPageLocal = new StockOverviewPage(page);
            const loginPage = new LoginPage(page);
            const storeSetupPage = new StoreData(page, language);
            await loginPage.loginAs('storeOperatorvietnam', language);
            await storeSetupPage.selectStore(programmeData[0].Mainstore[language]);
            const productType = 'Supplies';
            const dropdownKey = 'Draft';
            const dropdownvalue = testData[dropdownKey][language];

            const issueDate =
                await stockOverviewPageLocal.verifyTheColorOfDraftAndCompletedFilters(
                    programDatanew[0].administrationSyringe[language],
                    addLineToIssueData.wastage[language],
                    addLineToArrivalData.SimpleArrival[language],
                    productTypeArrivalDataNew,
                    productTypeIssueDataNew,
                    productType,
                    language,
                    BCGData.CurrentStockBelowMinimumLevel,
                    dropdownKey
                );

            await stockOverviewPageLocal.applyFilter(dropdownvalue, issueDate);
            const data = await stockOverviewPageLocal.getStatusDataByFilter(dropdownvalue);
            expect(data.text).toBe(dropdownvalue);
            expect(data.color).toBe('rgb(255, 193, 7)');
        });

        test(`Complete filter and color coding for supplies (${language})`, async ({ page }) => {

            const stockOverviewPageLocal = new StockOverviewPage(page);
            const loginPage = new LoginPage(page);
            const storeSetupPage = new StoreData(page, language);
            await loginPage.loginAs('storeOperatorvietnam', language);
            await storeSetupPage.selectStore(programmeData[0].Mainstore[language]);
            const productType = 'Supplies';
            const dropdownKey = 'Complete';
            const dropdownvalue = testData[dropdownKey][language];

            const issueDate =
                await stockOverviewPageLocal.verifyTheColorOfDraftAndCompletedFilters(
                    programDatanew[0].administrationSyringe[language],
                    addLineToIssueData.wastage[language],
                    addLineToArrivalData.SimpleArrival[language],
                    productTypeArrivalDataNew,
                    productTypeIssueDataNew,
                    productType,
                    language,
                    BCGData.CurrentStockBelowMinimumLevel,
                    dropdownKey
                );

            await stockOverviewPageLocal.applyFilter(dropdownvalue, issueDate);
            const data = await stockOverviewPageLocal.getStatusDataByFilter(dropdownvalue);
            expect(data.text).toBe(dropdownvalue);
            expect(data.color).toBe('rgb(76, 175, 80)');
        });

        test(`Color before and after finalize for supplies (${language})`, async ({ page }) => {

            const stockOverviewPageLocal = new StockOverviewPage(page);
            const loginPage = new LoginPage(page);
            const storeSetupPage = new StoreData(page, language);
            await loginPage.loginAs('storeOperatorvietnam', language);
            await storeSetupPage.selectStore(programmeData[0].Mainstore[language]);
            const productType = 'Supplies';
            const dropdownKey = 'Draft';
            const dropdownvalue = testData[dropdownKey][language];

            const issueDate =
                await stockOverviewPageLocal.verifyTheColorOfDraftAndCompletedFilters(
                    programDatanew[0].administrationSyringe[language],
                    addLineToIssueData.wastage[language],
                    addLineToArrivalData.SimpleArrival[language],
                    productTypeArrivalDataNew,
                    productTypeIssueDataNew,
                    productType,
                    language,
                    BCGData.CurrentStockBelowMinimumLevel,
                    dropdownKey
                );

            await stockOverviewPageLocal.applyFilter(dropdownvalue, issueDate);
            const result =
                await stockOverviewPageLocal.verifyTheColorBeforeAndAfterFinalize();
            expect(result.draftColor).toBe('rgb(255, 193, 7)');
            expect(result.completeColor).toBe('rgb(76, 175, 80)');
        });

        test(`Draft filter and color coding for vaccines (${language})`, async ({ page }) => {

            const stockOverviewPageLocal = new StockOverviewPage(page);
            const loginPage = new LoginPage(page);
            const storeSetupPage = new StoreData(page, language);
            await loginPage.loginAs('storeOperatorvietnam', language);
            await storeSetupPage.selectStore(programmeData[0].Mainstore[language]);
            const productType = 'Vaccines';
            const dropdownKey = 'Draft';
            const dropdownvalue = testData[dropdownKey][language];

            const issueDate =
                await stockOverviewPageLocal.verifyTheColorOfDraftAndCompletedFilters(
                    programDatanew[0].vaccine[language],
                    addLineToIssueData.wastage[language],
                    addLineToArrivalData.SimpleArrival[language],
                    productTypeArrivalDataNew,
                    productTypeIssueDataNew,
                    productType,
                    language,
                    BCGData.CurrentStockBelowMinimumLevel,
                    dropdownKey
                );

            await stockOverviewPageLocal.applyFilter(dropdownvalue, issueDate);
            const data = await stockOverviewPageLocal.getStatusDataByFilter(dropdownvalue);
            expect(data.text).toBe(dropdownvalue);
            expect(data.color).toBe('rgb(255, 193, 7)');
        });

        test(`Complete filter and color coding for vaccines (${language})`, async ({ page }) => {

            const stockOverviewPageLocal = new StockOverviewPage(page);
            const loginPage = new LoginPage(page);
            const storeSetupPage = new StoreData(page, language);
            await loginPage.loginAs('storeOperatorvietnam', language);
            await storeSetupPage.selectStore(programmeData[0].Mainstore[language]);
            const productType = 'Vaccines';
            const dropdownKey = 'Complete';
            const dropdownvalue = testData[dropdownKey][language];
            const issueDate =
                await stockOverviewPageLocal.verifyTheColorOfDraftAndCompletedFilters(
                    programDatanew[0].vaccine[language],
                    addLineToIssueData.wastage[language],
                    addLineToArrivalData.SimpleArrival[language],
                    productTypeArrivalDataNew,
                    productTypeIssueDataNew,
                    productType,
                    language,
                    BCGData.CurrentStockBelowMinimumLevel,
                    dropdownKey
                );

            await stockOverviewPageLocal.applyFilter(dropdownvalue, issueDate);
            const data = await stockOverviewPageLocal.getStatusDataByFilter(dropdownvalue);
            expect(data.text).toBe(dropdownvalue);
            expect(data.color).toBe('rgb(76, 175, 80)');
        });

        test(`Color before and after finalize for vaccines (${language})`, async ({ page }) => {

            const stockOverviewPageLocal = new StockOverviewPage(page);
            const loginPage = new LoginPage(page);
            const storeSetupPage = new StoreData(page, language);
            await loginPage.loginAs('storeOperatorvietnam', language);
            await storeSetupPage.selectStore(programmeData[0].Mainstore[language]);
            const productType = 'Vaccines';
            const dropdownKey = 'Draft';
            const dropdownvalue = testData[dropdownKey][language];
            const issueDate =
                await stockOverviewPageLocal.verifyTheColorOfDraftAndCompletedFilters(
                    programDatanew[0].vaccine[language],
                    addLineToIssueData.wastage[language],
                    addLineToArrivalData.SimpleArrival[language],
                    productTypeArrivalDataNew,
                    productTypeIssueDataNew,
                    productType,
                    language,
                    BCGData.CurrentStockBelowMinimumLevel,
                    dropdownKey
                );

            await stockOverviewPageLocal.applyFilter(dropdownvalue, issueDate);
            const result =
                await stockOverviewPageLocal.verifyTheColorBeforeAndAfterFinalize();
            expect(result.draftColor).toBe('rgb(255, 193, 7)');
            expect(result.completeColor).toBe('rgb(76, 175, 80)');
        });

    });

});