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

const productTypeArrivalData = require('../testdata/InputData/addProductTypeArrival.json');
const productTypeIssueData = require('../testdata/InputData/ProductTypeIssue.json');
const productTypeArrivalDataNew = require('../testdata/InputData/productTypeArrivalnew.json');
const productTypeIssueDataNew = require('../testdata/InputData/productTypeNewIssue.json');
const { ReportPage } = require('../pages/reportPage');

const languages = ['fr', 'pt', 'es'];
// const languages = ['en'];

languages.forEach(language => {

    test.describe(`Validate Alerts for Vaccines and Diluents - Language: ${language}`, () => {

        let stockOverviewPage;

        // ================== BEFORE ALL ==================
        test.beforeAll(async ({ browser }) => {

            const page = await browser.newPage();

            try {

                const loginPage = new LoginPage(page);
                const homePage = new HomePage(page);
                const programmePage = new ProgrammeData(page, language);
                const arrivalPage = new ArrivalPage(page, language);
                const storeSetupPage = new StoreData(page, language);

                await loginPage.loginAs('countryAdminVietnam', language);
                // await homePage.verifyMenus();

                // await programmePage.deleteAllProgrammeData();
                // await programmePage.highlightAndClickAdd();
                // await programmePage.fillPopupForm(programDatanew, language);

                // await arrivalPage.waitForLoadingToFinish();

                // await storeSetupPage.navigateToStoreHierarchy();
                // await storeSetupPage.addNewStoreInStoreHierarchy('level2', 'store2');


                // await storeSetupPage.enterThePopulationDemographicsTabFilterByStoreNamesFillTotalPopulationAndAdultPopulation('store2');

                // await storeSetupPage.enterTheVaccineCoverageTabFilterByStoreNamesFillAlltheValuesFORAllElements('store2');

                // await storeSetupPage.enterTheStockLevelAndLeadTimeInStockParameters('level2');

                await homePage.logout();

            } catch (error) {
                console.error('Setup failed:', error.message);
                throw error;
            } finally {
                await page.close().catch(() => { });
            }
        });



        // ================== TEST 1 ==================
        test(`Verify that an alert is displayed on the Reports page when vaccine stock reaches the minimum level.`, async ({ page }) => {

            const stockOverviewPageLocal = new StockOverviewPage(page);
            const reportPage = new ReportPage(page, language);
            const loginPage = new LoginPage(page);
            const storeSetupPage = new StoreData(page, language);

            await loginPage.loginAs('storeOperatorvietnam', language);
            await storeSetupPage.selectStore(programmeData[0].Mainstore[language]);
            const productType = 'Vaccines';

            await stockOverviewPageLocal.evaluateCurrentStockBalanceForReportPage(
                programDatanew[0].vaccine[language],
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

            const expectedValue =
                await calculationService.evaluateMinimumStockLevelForVaccines(
                    BCGData,
                    minimumStock
                );

            const threshold = BCGData.saftyWeeks;

            const expectedColor =
                expectedValue <= threshold ? 'red' : 'green';

            const actualColor = await reportPage.verifyStockColor(
                programDatanew[0].vaccine[language]
            );

            expect(actualColor).toBe(expectedColor);

            const tooltipText =
                await reportPage.highlightTdAndVerifyTooltipForGenerateReportTable(
                    programDatanew[0].vaccine[language]
                );

            let expectedTooltip;

            switch (language) {
                case 'fr':
                    expectedTooltip =
                        ' Les semaines de stock ajustées pour ce produit sont inférieures au niveau minimum'
                    break;
                case 'pt':
                    expectedTooltip =
                        'As semanas de stock ajustadas para este produto são inferiores ao nível mínimo'
                    break;
                case 'es':
                    expectedTooltip = 'أسابيع المخزون المعدلة لهذا المنتج أقل من المستوى الأدنى'
                    break;
                default:
                    expectedTooltip =
                        'The adjusted weeks of stock for this product is less than the minimum level';
            }

            expect(tooltipText).not.toBeNull();
            expect(tooltipText.trim()).toContain(expectedTooltip);

        });

        // ================== TEST 2 (NEW) ==================
        test(`Verify that an alert is NOT displayed on the Reports page when vaccine stock reaches the maximum level.`, async ({ page }) => {

            const stockOverviewPageLocal = new StockOverviewPage(page);
            const reportPage = new ReportPage(page, language);
            const loginPage = new LoginPage(page);
            const storeSetupPage = new StoreData(page, language);

            await loginPage.loginAs('storeOperatorvietnam', language);
            await storeSetupPage.selectStore(programmeData[0].Mainstore[language]);
            const productType = 'Vaccines';

            // 🔹 Use HIGH stock (max level scenario)
            await stockOverviewPageLocal.evaluateCurrentStockBalanceForReportPage(
                programDatanew[0].vaccine[language],
                addLineToIssueData.wastage[language],
                addLineToArrivalData.SimpleArrival[language],
                productTypeArrivalDataNew,
                productTypeIssueDataNew,
                productType,
                language,
                BCGData.CurrentStockAboveMinimumLevel // 👈 important

            );
            await reportPage.navigateToStockStatusAndOpenDropdowns('level2');
            const maximumStock = BCGData.CurrentStockAboveMinimumLevel;

            const expectedValue =
                await calculationService.evaluateMinimumStockLevelForVaccines(
                    BCGData,
                    maximumStock
                );

            const threshold = BCGData.saftyWeeks;

            const expectedColor =
                expectedValue <= threshold ? 'green' : 'red';

            const actualColor = await reportPage.verifyStockColor(
                programDatanew[0].vaccine[language]
            );

            expect(actualColor).toBe(expectedColor);

        });
        test(`Verify that an alert is  displayed on the Reports page when Supplies stock reaches the minimum level.`, async ({ page }) => {

            const stockOverviewPageLocal = new StockOverviewPage(page);
            const reportPage = new ReportPage(page, language);
            const loginPage = new LoginPage(page);
            const storeSetupPage = new StoreData(page, language);

            await loginPage.loginAs('storeOperatorvietnam', language);
            await storeSetupPage.selectStore(programmeData[0].Mainstore[language]);
            const productType = 'Supplies';

            // 🔹 Use HIGH stock (max level scenario)
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

            const expectedValue =
                await calculationService.evaluateMinimumStockLevelForSupplies(
                    BCGData,
                    minimumStock
                );

            const threshold = BCGData.saftyWeeks;

            const expectedColor =
                expectedValue <= threshold ? 'red' : 'green';

            const actualColor = await reportPage.verifyStockColor(
                programDatanew[0].vaccine[language]
            );

            expect(actualColor).toBe(expectedColor);

            const tooltipText =
                await reportPage.highlightTdAndVerifyTooltipForGenerateReportTable(
                    programDatanew[0].administrationSyringe[language]
                );

            let expectedTooltip;

            switch (language) {
                case 'fr':
                    expectedTooltip =
                        'Les semaines de stock ajustées pour ce produit sont inférieures au niveau minimum'
                    break;
                case 'pt':
                    expectedTooltip =
                        'As semanas de stock ajustadas para este produto são inferiores ao nível mínimo'
                    break;
                case 'es':
                    expectedTooltip = 'أسابيع المخزون المعدلة لهذا المنتج أقل من المستوى الأدنى'
                    break;
                default:
                    expectedTooltip =
                        'The adjusted weeks of stock for this product is less than the minimum level';
            }

            expect(tooltipText).not.toBeNull();
            expect(tooltipText.trim()).toContain(expectedTooltip);

        });
        test(`Verify that an alert is  displayed on the Reports page when Supplies stock reaches the maximum level.`, async ({ page }) => {

            const stockOverviewPageLocal = new StockOverviewPage(page);
            const reportPage = new ReportPage(page, language);
            const loginPage = new LoginPage(page);
            const storeSetupPage = new StoreData(page, language);

            await loginPage.loginAs('storeOperatorvietnam', language);
            await storeSetupPage.selectStore(programmeData[0].Mainstore[language]);
            const productType = 'Supplies';

            // 🔹 Use HIGH stock (max level scenario)
            await stockOverviewPageLocal.evaluateCurrentStockBalanceForReportPage(
                programDatanew[0].administrationSyringe[language],
                addLineToIssueData.wastage[language],
                addLineToArrivalData.SimpleArrival[language],
                productTypeArrivalDataNew,
                productTypeIssueDataNew,
                productType,
                language,
                BCGData.CurrentStockAboveMinimumLevel // 👈 important

            );
            await reportPage.navigateToStockStatusAndOpenDropdowns('level2');
            const minimumStock = BCGData.CurrentStockAboveMinimumLevel;

            const expectedValue =
                await calculationService.evaluateMinimumStockLevelForSupplies(
                    BCGData,
                    minimumStock
                );

            const threshold = BCGData.saftyWeeks;

            const expectedColor =
                expectedValue <= threshold ? 'green' : 'red';

            const actualColor = await reportPage.verifyStockColor(
                programDatanew[0].administrationSyringe[language]
            );

            expect(actualColor).toBe(expectedColor);

        });

    });

});