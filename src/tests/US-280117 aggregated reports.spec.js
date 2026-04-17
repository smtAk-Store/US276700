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

const languages = ['fr'];
// const languages = ['en'];

languages.forEach(language => {

    test.describe(`Validate Alerts for Vaccines and Diluents - Language: ${language}`, () => {

        let stockOverviewPage;

        // ================== BEFORE ALL ==================verifyDialogHasText
        test.beforeAll(async ({ browser }) => {

            const page = await browser.newPage();

            try {

                const loginPage = new LoginPage(page);
                const homePage = new HomePage(page);
                const programmePage = new ProgrammeData(page, language);
                const arrivalPage = new ArrivalPage(page, language);
                const storeSetupPage = new StoreData(page, language);

                await loginPage.loginAs('countryAdminVietnam', language);
                await homePage.verifyMenus();

             
                await programmePage.highlightAndClickAdd();
                await programmePage.fillPopupForm(programDatanew, language);

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

        // ================== TEST 1 ==================
        test(`Aggregated reports for vaccines below minimum level`, async ({ page }) => {

            const stockOverviewPageLocal = new StockOverviewPage(page, language);
            const reportPage = new ReportPage(page, language);
            const loginPage = new LoginPage(page);
            const storeSetupPage = new StoreData(page, language);
            const homePage = new HomePage(page);

            // ----------- Substore 1 -----------
            await loginPage.loginAs('storeOperatorvietnam', language);
            await storeSetupPage.selectStore(programmeData[0].subStore1[language]);

            let stockOverviewPage = new StockOverviewPage(page, language);

            await stockOverviewPageLocal.addEquipmentForStoreOperator();
            await stockOverviewPage.navigateTostockOverviewpage();

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

            await homePage.logout();

            // ----------- Substore 2 -----------
            await loginPage.loginAs('storeOperatorvietnam', language);
            await storeSetupPage.selectStore(programmeData[0].subStore2[language]);

            stockOverviewPage = new StockOverviewPage(page, language);

            await stockOverviewPageLocal.addEquipmentForStoreOperator();
            await stockOverviewPage.navigateTostockOverviewpage();

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

            await homePage.logout();

            // ----------- Main Store -----------
            await loginPage.loginAs('storeOperatorvietnam', language);
            await storeSetupPage.selectStore(programmeData[0].Mainstore[language]);

            stockOverviewPage = new StockOverviewPage(page, language);

            await stockOverviewPageLocal.addEquipmentForStoreOperator();
            await stockOverviewPage.navigateTostockOverviewpage();

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

            // ----------- Navigate to Report -----------
            await reportPage.navigateToStockStatusAndOpenDropdowns('level2', {
                includeSubstore: true
            });

            // ----------- Extract Tooltips -----------
            const tooltipTexts = await reportPage.highlightProductColumn(
                programDatanew[0].vaccine[language]
            );

            // ----------- Expected Tooltip -----------
            let expectedTooltip;

            switch (language) {
                case 'fr':
                    expectedTooltip = 'Les semaines de stock ajustées pour ce produit sont inférieures au niveau minimum'
                    break;
                case 'pt':
                    expectedTooltip = 'As semanas de stock ajustadas para este produto são inferiores ao nível mínimo'
                    break;
                case 'es':
                    expectedTooltip = 'أسابيع المخزون المعدلة لهذا المنتج أقل من المستوى الأدنى'
                    break;
                default:
                    expectedTooltip =
                        'The adjusted weeks of stock for this product is less than the minimum level';
            }

            // ----------- Assertions -----------

            // Ensure tooltips exist
            expect(tooltipTexts).toBeTruthy();
            expect(tooltipTexts.length).toBeGreaterThan(0);

            // Validate each tooltip
            for (const tooltipText of tooltipTexts) {
                expect(tooltipText).toBeTruthy();
                expect(tooltipText.trim()).toContain(expectedTooltip);
            }

        });
        test(`Aggregated reports for vaccines above minimum level`, async ({ page }) => {

            const stockOverviewPageLocal = new StockOverviewPage(page, language);
            const reportPage = new ReportPage(page, language);
            const loginPage = new LoginPage(page);
            const storeSetupPage = new StoreData(page, language);
            const homePage = new HomePage(page);

            // ----------- Substore 1 -----------
            await loginPage.loginAs('storeOperatorvietnam', language);
            await storeSetupPage.selectStore(programmeData[0].subStore1[language]);

            let stockOverviewPage = new StockOverviewPage(page, language);

            await stockOverviewPageLocal.addEquipmentForStoreOperator();
            await stockOverviewPage.navigateTostockOverviewpage();

            const productType = 'Vaccines';

            await stockOverviewPageLocal.evaluateCurrentStockBalanceForReportPage(
                programDatanew[0].vaccine[language],
                addLineToIssueData.wastage[language],
                addLineToArrivalData.SimpleArrival[language],
                productTypeArrivalDataNew,
                productTypeIssueDataNew,
                productType,
                language,
                BCGData.CurrentStockAboveMinimumLevel
            );

            await homePage.logout();

            // ----------- Substore 2 -----------
            await loginPage.loginAs('storeOperatorvietnam', language);
            await storeSetupPage.selectStore(programmeData[0].subStore2[language]);

            stockOverviewPage = new StockOverviewPage(page, language);

            await stockOverviewPageLocal.addEquipmentForStoreOperator();
            await stockOverviewPage.navigateTostockOverviewpage();

            await stockOverviewPageLocal.evaluateCurrentStockBalanceForReportPage(
                programDatanew[0].vaccine[language],
                addLineToIssueData.wastage[language],
                addLineToArrivalData.SimpleArrival[language],
                productTypeArrivalDataNew,
                productTypeIssueDataNew,
                productType,
                language,
                BCGData.CurrentStockAboveMinimumLevel
            );

            await homePage.logout();

            // ----------- Main Store -----------
            await loginPage.loginAs('storeOperatorvietnam', language);
            await storeSetupPage.selectStore(programmeData[0].Mainstore[language]);

            stockOverviewPage = new StockOverviewPage(page, language);

            await stockOverviewPageLocal.addEquipmentForStoreOperator();
            await stockOverviewPage.navigateTostockOverviewpage();

            await stockOverviewPageLocal.evaluateCurrentStockBalanceForReportPage(
                programDatanew[0].vaccine[language],
                addLineToIssueData.wastage[language],
                addLineToArrivalData.SimpleArrival[language],
                productTypeArrivalDataNew,
                productTypeIssueDataNew,
                productType,
                language,
                BCGData.CurrentStockAboveMinimumLevel
            );

            // ----------- Navigate to Report -----------
            await reportPage.navigateToStockStatusAndOpenDropdowns('level2', {
                includeSubstore: true
            });

            // ----------- Extract Tooltips -----------
            const tooltipTexts = await reportPage.highlightProductColumn(
                programDatanew[0].vaccine[language]
            );

            // ----------- ASSERTION: NO TOOLTIP EXPECTED -----------

            expect(tooltipTexts == null || tooltipTexts.length === 0).toBeTruthy();

            console.log(" Verified: No tooltip is displayed for above minimum level");
        });

            test(`Aggregated reports for vaccines below minimum level when stock is zero`, async ({ page }) => {

            const stockOverviewPageLocal = new StockOverviewPage(page, language);
            const reportPage = new ReportPage(page, language);
            const loginPage = new LoginPage(page);
            const storeSetupPage = new StoreData(page, language);
            const homePage = new HomePage(page);

            // ----------- Substore 1 -----------
            await loginPage.loginAs('storeOperatorvietnam', language);
            await storeSetupPage.selectStore(programmeData[0].subStore1[language]);

            let stockOverviewPage = new StockOverviewPage(page, language);

            await stockOverviewPageLocal.addEquipmentForStoreOperator();
            await stockOverviewPage.navigateTostockOverviewpage();

            const productType = 'Vaccines';

            await stockOverviewPageLocal.evaluateCurrentStockBalanceForReportPage(
                programDatanew[0].vaccine[language],
                addLineToIssueData.wastage[language],
                addLineToArrivalData.SimpleArrival[language],
                productTypeArrivalDataNew,
                productTypeIssueDataNew,
                productType,
                language,
                BCGData.CurrentStockMinimumLevel
            );

            await homePage.logout();

            // ----------- Substore 2 -----------
            await loginPage.loginAs('storeOperatorvietnam', language);
            await storeSetupPage.selectStore(programmeData[0].subStore2[language]);

            stockOverviewPage = new StockOverviewPage(page, language);

            await stockOverviewPageLocal.addEquipmentForStoreOperator();
            await stockOverviewPage.navigateTostockOverviewpage();

            await stockOverviewPageLocal.evaluateCurrentStockBalanceForReportPage(
                programDatanew[0].vaccine[language],
                addLineToIssueData.wastage[language],
                addLineToArrivalData.SimpleArrival[language],
                productTypeArrivalDataNew,
                productTypeIssueDataNew,
                productType,
                language,
                BCGData.CurrentStockMinimumLevel
            );

            await homePage.logout();

            // ----------- Main Store -----------
            await loginPage.loginAs('storeOperatorvietnam', language);
            await storeSetupPage.selectStore(programmeData[0].Mainstore[language]);

            stockOverviewPage = new StockOverviewPage(page, language);

            await stockOverviewPageLocal.addEquipmentForStoreOperator();
            await stockOverviewPage.navigateTostockOverviewpage();

            await stockOverviewPageLocal.evaluateCurrentStockBalanceForReportPage(
                programDatanew[0].vaccine[language],
                addLineToIssueData.wastage[language],
                addLineToArrivalData.SimpleArrival[language],
                productTypeArrivalDataNew,
                productTypeIssueDataNew,
                productType,
                language,
                BCGData.CurrentStockMinimumLevel
            );

            // ----------- Navigate to Report -----------
              await reportPage.navigateToStockStatusAndOpenDropdowns('level2', {
                includeSubstore: true
            });

            // ----------- Extract Tooltips -----------
            const tooltipTexts = await reportPage.highlightProductColumn(
                programDatanew[0].vaccine[language]
            );

            // ----------- Expected Tooltip -----------
            let expectedTooltip;

             switch (language) {
                case 'fr':
                    expectedTooltip = 'La semaine de stock ajustée est  zéro';
                    break;
                case 'pt':
                    expectedTooltip = 'A semana ajustada de estoque é zero';
                    break;
                case 'es':
                    expectedTooltip = 'الأسبوع المعدل للمخزون هو صفر';
                    break;
                default:
                    expectedTooltip = 'The adjusted week of stock is zero';
            }


            // ----------- Assertions -----------

            // Ensure tooltips exist
            expect(tooltipTexts).toBeTruthy();
            expect(tooltipTexts.length).toBeGreaterThan(0);

            // Validate each tooltip
            for (const tooltipText of tooltipTexts) {
                expect(tooltipText).toBeTruthy();
                expect(tooltipText.trim()).toContain(expectedTooltip);
            }

        });

        test(`Aggregated reports for Supplies  minimum level`, async ({ page }) => {

            const stockOverviewPageLocal = new StockOverviewPage(page, language);
            const reportPage = new ReportPage(page, language);
            const loginPage = new LoginPage(page);
            const storeSetupPage = new StoreData(page, language);
            const homePage = new HomePage(page);

            // ----------- Substore 1 -----------
            await loginPage.loginAs('storeOperatorvietnam', language);
            await storeSetupPage.selectStore(programmeData[0].subStore1[language]);

            let stockOverviewPage = new StockOverviewPage(page, language);

            await stockOverviewPageLocal.addEquipmentForStoreOperator();
            await stockOverviewPage.navigateTostockOverviewpage();

            const productType = 'Supplies'

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

            await homePage.logout();

            //---------- Substore 2 -----------
            await loginPage.loginAs('storeOperatorvietnam', language);
            await storeSetupPage.selectStore(programmeData[0].subStore2[language]);

            stockOverviewPage = new StockOverviewPage(page, language);

            await stockOverviewPageLocal.addEquipmentForStoreOperator();
            await stockOverviewPage.navigateTostockOverviewpage();

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

            await homePage.logout();

            // ----------- Main Store -----------
            await loginPage.loginAs('storeOperatorvietnam', language);
            await storeSetupPage.selectStore(programmeData[0].Mainstore[language]);

            stockOverviewPage = new StockOverviewPage(page, language);

            await stockOverviewPageLocal.addEquipmentForStoreOperator();
            await stockOverviewPage.navigateTostockOverviewpage();

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

            // ----------- Navigate to Report -----------
            await reportPage.navigateToStockStatusAndOpenDropdowns('level2', {
                includeSubstore: true
            });

            // ----------- Extract Tooltips -----------
            const tooltipTexts = await reportPage.highlightProductColumn(
                programDatanew[0].administrationSyringe[language]
            );

            // ----------- Expected Tooltip -----------
            let expectedTooltip;

            switch (language) {
                case 'fr':
                    expectedTooltip = 'Les semaines de stock ajustées pour ce produit sont inférieures au niveau minimum'
                    break;
                case 'pt':
                    expectedTooltip = 'As semanas de stock ajustadas para este produto são inferiores ao nível mínimo'
                    break;
                case 'es':
                    expectedTooltip = 'أسابيع المخزون المعدلة لهذا المنتج أقل من المستوى الأدنى'
                    break;
                default:
                    expectedTooltip =
                        'The adjusted weeks of stock for this product is less than the minimum level';
            }

            // ----------- Assertions -----------

            // Ensure tooltips exist
            expect(tooltipTexts).toBeTruthy();
            expect(tooltipTexts.length).toBeGreaterThan(0);

            // Validate each tooltip
            for (const tooltipText of tooltipTexts) {
                expect(tooltipText).toBeTruthy();
                expect(tooltipText.trim()).toContain(expectedTooltip);
            }

        });
        test(`Aggregated reports for Supplies maximum level`, async ({ page }) => {

            const stockOverviewPageLocal = new StockOverviewPage(page, language);
            const reportPage = new ReportPage(page, language);
            const loginPage = new LoginPage(page);
            const storeSetupPage = new StoreData(page, language);
            const homePage = new HomePage(page);

            // ----------- Substore 1 -----------
            await loginPage.loginAs('storeOperatorvietnam', language);
            await storeSetupPage.selectStore(programmeData[0].subStore1[language]);

            let stockOverviewPage = new StockOverviewPage(page, language);

            await stockOverviewPageLocal.addEquipmentForStoreOperator();
            await stockOverviewPage.navigateTostockOverviewpage();

            const productType = 'Supplies'

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

            await homePage.logout();

            // ----------- Substore 2 -----------
            await loginPage.loginAs('storeOperatorvietnam', language);
            await storeSetupPage.selectStore(programmeData[0].subStore2[language]);

            stockOverviewPage = new StockOverviewPage(page, language);

            await stockOverviewPageLocal.addEquipmentForStoreOperator();
            await stockOverviewPage.navigateTostockOverviewpage();

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

            await homePage.logout();

            // ----------- Main Store -----------
            await loginPage.loginAs('storeOperatorvietnam', language);
            await storeSetupPage.selectStore(programmeData[0].Mainstore[language]);

            stockOverviewPage = new StockOverviewPage(page, language);

            await stockOverviewPageLocal.addEquipmentForStoreOperator();
            await stockOverviewPage.navigateTostockOverviewpage();

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

            // ----------- Navigate to Report -----------
            await reportPage.navigateToStockStatusAndOpenDropdowns('level2', {
                includeSubstore: true
            });

            // ----------- Extract Tooltips -----------
            const tooltipTexts = await reportPage.highlightProductColumn(
                programDatanew[0].administrationSyringe[language]
            );

            // ----------- ASSERTION: NO TOOLTIP EXPECTED -----------

            expect(tooltipTexts == null || tooltipTexts.length === 0).toBeTruthy();

            console.log("✅ Verified: No tooltip is displayed for above minimum level");
        });

    });

});