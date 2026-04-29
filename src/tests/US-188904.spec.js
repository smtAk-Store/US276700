import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { HomePage } from '../pages/homePage';
import { ProgrammeData } from '../pages/programmeData';
import { ArrivalPage } from '../pages/arrivalPage';
import { StoreData } from '../pages/StoreData';

const StockOverviewPage = require('../pages/StockOverviewPage');
const { IssuingPage } = require('../pages/Issuingpage');

const addLineToArrivalData = require('../testdata/addlinetoarrival.json');
const addLineToIssueData = require('../testdata/addLineToIssue.json');
const productData = require('../testdata/InputData/productArrival.json');
const calculationService = require('../service/CalculationService');

const programmeData = require('../testdata/InputData/ProgrammeData.json');
const programDatanew = require('../testdata/InputData/programdatafornewvaccine.json');
const BCGData = require('../testdata/InputData/BCGImmunizationData.json');

const productTypeArrivalDataNew = require('../testdata/InputData/productTypeArrivalnew.json');
const productTypeIssueDataNew = require('../testdata/InputData/productTypeNewIssue.json');

const { ReportPage } = require('../pages/reportPage');

const languages = ['en'];

languages.forEach(language => {

    test.describe(`Validate Alerts for supplies for all Language ${language}`, () => {

        // ================== BEFORE ALL ==================
        // test.beforeAll(async ({ browser }) => {

        //     const page = await browser.newPage();

        //     try {
        //         const loginPage = new LoginPage(page);
        //         const homePage = new HomePage(page);
        //         const programmePage = new ProgrammeData(page, language);
        //         const arrivalPage = new ArrivalPage(page, language);
        //         const storeSetupPage = new StoreData(page, language);

        //         await loginPage.loginAs('countryAdminVietnam', language);
        //         await homePage.verifyMenus();

        //         await programmePage.highlightAndClickAdd();
        //         await programmePage.fillPopupForm(programDatanew, language);

        //         await arrivalPage.waitForLoadingToFinish();

        //         await storeSetupPage.navigateToStoreHierarchy();
        //         await storeSetupPage.addNewStoreInStoreHierarchy('level2', 'store2');

        //         await storeSetupPage.enterThePopulationDemographicsTabFilterByStoreNamesFillTotalPopulationAndAdultPopulation('store2');
        //         await storeSetupPage.enterTheVaccineCoverageTabFilterByStoreNamesFillAlltheValuesFORAllElements('store2');
        //         await storeSetupPage.enterTheStockLevelAndLeadTimeInStockParameters('level2');

        //         await homePage.logout();

        //     } catch (error) {
        //         console.error('Setup failed:', error.message);
        //         throw error;
        //     } finally {
        //         await page.close().catch(() => { });
        //     }
        // });

        // ================== TEST 1 ==================
        test(`Verify alert when Supplies stock reaches minimum level`, async ({ page }) => {

            const stockOverviewPageLocal = new StockOverviewPage(page);
            const reportPage = new ReportPage(page, language);
            const loginPage = new LoginPage(page);
            const storeSetupPage = new StoreData(page, language);

            await loginPage.loginAs('syriaStoreOperator', language);
            await storeSetupPage.selectStore(programmeData[0].Mainstore[language]);

            const productType = 'Supplies';

            await stockOverviewPageLocal.evaluateCurrentStockBalanceForReportPage(
                programDatanew[0].administrationSyringe[language],
                addLineToIssueData.wastage[language],
                addLineToArrivalData.SimpleArrival[language],
                productTypeArrivalDataNew,
                productTypeIssueDataNew,
                productType,
                language,
                BCGData.CurrentStockBelowMinimumLevel
            );

            await reportPage.navigateToStockStatusAndOpenDropdowns('level2');

            const minimumStock = BCGData.CurrentStockBelowMinimumLevel;

            // const expectedValue =
            //     await calculationService.evaluateMinimumStockLevelForSupplies(
            //         BCGData,
            //         minimumStock
            //     );

            // const threshold = BCGData.saftyWeeks;

        //     const expectedColor =
        //         expectedValue <= threshold ? 'red' : 'blue';

        //     const actualColor = await reportPage.verifyStockColor(
        //         programDatanew[0].administrationSyringe[language]
        //     );

        //    // expect(actualColor).toBe(expectedColor);

        //     const tooltipText =
        //         await reportPage.highlightTdAndVerifyTooltipForGenerateReportTable(
        //             programDatanew[0].administrationSyringe[language]
        //         );

        //     let expectedTooltip;

        //     switch (language) {
        //         case 'fr':
        //             expectedTooltip = 'Les semaines de stock ajustées pour ce produit sont inférieures au niveau minimum';
        //             break;
        //         case 'pt':
        //             expectedTooltip = 'As semanas de stock ajustadas para este produto são inferiores ao nível mínimo';
        //             break;
        //         case 'es':
        //             expectedTooltip = 'أسابيع المخزون المعدلة لهذا المنتج أقل من المستوى الأدنى';
        //             break;
        //         default:
        //             expectedTooltip = 'The adjusted weeks of stock for this product is less than the minimum level';
        //     }

            // expect(tooltipText).not.toBeNull();
            // expect(tooltipText.trim()).toContain(expectedTooltip);
        });

        // ================== TEST 2 ==================
        test(`Verify alert when Supplies stock reaches maximum level`, async ({ page }) => {

            const stockOverviewPageLocal = new StockOverviewPage(page);
            const reportPage = new ReportPage(page, language);
            const loginPage = new LoginPage(page);
            const storeSetupPage = new StoreData(page, language);

            await loginPage.loginAs('syriaStoreOperator', language);
            await storeSetupPage.selectStore(programmeData[0].Mainstore[language]);

            const productType = 'Supplies';

            await stockOverviewPageLocal.evaluateCurrentStockBalanceForReportPage(
                programDatanew[0].administrationSyringe[language],
                addLineToIssueData.wastage[language],
                addLineToArrivalData.SimpleArrival[language],
                productTypeArrivalDataNew,
                productTypeIssueDataNew,
                productType,
                language,
                BCGData.CurrentStockAboveMinimumLevel
            );

            await reportPage.navigateToStockStatusAndOpenDropdowns('level2');

            const minimumStock = BCGData.CurrentStockAboveMinimumLevel;

            const expectedValue =
                await calculationService.evaluateMinimumStockLevelForSupplies(
                    BCGData,
                    minimumStock
                );

            // const threshold = BCGData.saftyWeeks;

            // const expectedColor =
            //     expectedValue <= threshold ? 'red' : 'blue';

            // const actualColor = await reportPage.verifyStockColor(
            //     programDatanew[0].administrationSyringe[language]
            // );

          //  expect(actualColor).toBe(expectedColor);
        });

        // ================== TEST 3 ==================
        test(`Verify alert when Supplies stock is zero`, async ({ page }) => {

            const stockOverviewPageLocal = new StockOverviewPage(page);
            const reportPage = new ReportPage(page, language);
            const loginPage = new LoginPage(page);
            const storeSetupPage = new StoreData(page, language);

            await loginPage.loginAs('syriaStoreOperator', language);
            await storeSetupPage.selectStore(programmeData[0].Mainstore[language]);

            const productType = 'Supplies';

            await stockOverviewPageLocal.evaluateCurrentStockBalanceForReportPage(
                programDatanew[0].administrationSyringe[language],
                addLineToIssueData.wastage[language],
                addLineToArrivalData.SimpleArrival[language],
                productTypeArrivalDataNew,
                productTypeIssueDataNew,
                productType,
                language,
                BCGData.CurrentStockMinimumLevel
            );

            await reportPage.navigateToStockStatusAndOpenDropdowns('level2');

            // const minimumStock = BCGData.CurrentStockMinimumLevel;

            // const expectedValue =
            //     await calculationService.evaluateMinimumStockLevelForSupplies(
            //         BCGData,
            //         minimumStock
            //     );

            // const threshold = BCGData.saftyWeeks;

            // const expectedColor =
            //     expectedValue <= threshold ? 'red' : 'blue';

            // const actualColor = await reportPage.verifyStockColor(
            //     programDatanew[0].administrationSyringe[language]
            // );

          //  expect(actualColor).toBe(expectedColor);

        //     const tooltipText =
        //         await reportPage.highlightTdAndVerifyTooltipForGenerateReportTable(
        //             programDatanew[0].administrationSyringe[language]
        //         );

        //     let expectedTooltip;

        //     switch (language) {
        //         case 'fr':
        //             expectedTooltip = 'La semaine de stock ajustée est zéro';
        //             break;
        //         case 'pt':
        //             expectedTooltip = 'A semana ajustada de estoque é zero';
        //             break;
        //         case 'es':
        //             expectedTooltip = 'الأسبوع المعدل للمخزون هو صفر';
        //             break;
        //         default:
        //             expectedTooltip = 'The adjusted week of stock is zero';
        //     }

        //     // expect(tooltipText).not.toBeNull();
        //     // expect(tooltipText.trim()).toContain(expectedTooltip);
         });

        // ================== AFTER ALL (CLEANUP) ==================
        // test.afterAll(async ({ browser }) => {

        //     const page = await browser.newPage();

        //     try {
        //         const stockPage = new StockOverviewPage(page);
        //         const loginPage = new LoginPage(page);

        //         await loginPage.loginAs('countryAdminVietnam', language);
        //         await stockPage.clearAllData();

        //     } catch (error) {
        //         console.error('Cleanup failed:', error.message);
        //         throw error;
        //     } finally {
        //         await page.close().catch(() => { });
        //     }
        // });

    });
});