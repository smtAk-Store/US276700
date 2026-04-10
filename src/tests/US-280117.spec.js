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

const languages = ['en'];


languages.forEach(language => {

    test.describe(`Validate Alerts for Vaccines and Diluents - Language: ${language}`, () => {

        let stockOverviewPage;

        // ================== RUNS ONLY ONCE ==================
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

                console.log(`Navigated to base URL`);

                await programmePage.highlightAndClickAdd();
                await programmePage.fillPopupForm(programDatanew, language);
                await arrivalPage.waitForLoadingToFinish();
                await storeSetupPage.navigateToStoreHierarchy();
                await storeSetupPage.addNewStoreInStoreHierarchy('level4', 'store4');
                 await storeSetupPage.addNewStoreInStoreHierarchy('level4', 'store41');
                await storeSetupPage.addNewStoreInStoreHierarchy('level5', 'store5');
                await storeSetupPage.enterThePopulationDemographicsTabFilterByStoreNamesFillTotalPopulationAndAdultPopulation('store4');
                await storeSetupPage.enterThePopulationDemographicsTabFilterByStoreNamesFillTotalPopulationAndAdultPopulation('store5');
                  await storeSetupPage.enterThePopulationDemographicsTabFilterByStoreNamesFillTotalPopulationAndAdultPopulation('store41');
                await storeSetupPage.enterTheVaccineCoverageTabFilterByStoreNamesFillAlltheValuesFORAllElements('store4');
                  await storeSetupPage.enterTheVaccineCoverageTabFilterByStoreNamesFillAlltheValuesFORAllElements('store41');
                await storeSetupPage.enterTheVaccineCoverageTabFilterByStoreNamesFillAlltheValuesFORAllElements('store5');
                await storeSetupPage.enterTheStockLevelAndLeadTimeInStockParameters('level4');
                await storeSetupPage.enterTheStockLevelAndLeadTimeInStockParameters('level5');
                await homePage.logout();
                console.log(` Programme setup completed for ${language}`);

            } catch (error) {
                console.error(`Setup failed:`, error.message);
                try {
                    await page.screenshot({ path: `setup-failed-${language}-${Date.now()}.png`, fullPage: true });
                    console.log(`Screenshot saved for debugging`);
                } catch (e) { }
                throw error;
            } finally {
                await page.close().catch(() => { });
            }
        });

        // ================== BEFORE EACH ==================
        test.beforeEach(async ({ page }) => {
            test.setTimeout(180000);

            const loginPage = new LoginPage(page);
            const issuingPage = new IssuingPage(page, language);
            const storePageInstance = new StoreData(page, language);

            console.log(` Logging in as Store Operator for ${language}`);

            await loginPage.loginAs('storeOperatorvietnam', language);
            await storePageInstance.selectStore(programDatanew[0].store[language]);

            stockOverviewPage = new StockOverviewPage(page, language);
            await stockOverviewPage.navigateTostockOverviewpage();

            console.log(` Stock Overview page ready`);
        });

        // ================== TEST ==================

        test(`Verify alert apRrfhenjpears when stock is`, async () => {
            const expected = await calculationService.evaluateMinimumStockLevelForVaccines(BCGData,
                BCGData.CurrentStockBelowMinimumLevel
            );

            console.log(` expected: ${expected}, safety+lead: ${BCGData.saftyWeeks + BCGData.LeadWeeks}`);



            const productType = 'Vaccines';
            await stockOverviewPage.evaluateCurrentStockBalance(programmeData[0].vaccine[language],
                addLineToIssueData.wastage[language],
                addLineToArrivalData,
                productTypeArrivalData,
                productTypeIssueData,
                productType,
                language,
                BCGData.CurrentStockBelowMinimumLevel
            );

            const tooltipText = await stockOverviewPage.highlightTdAndVerifyTooltip(
                programmeData[0].vaccine[language]
            );

            expect(expected).toBeLessThanOrEqual(
                BCGData.saftyWeeks + BCGData.LeadWeeks
            );

            let expectedTooltip;

            switch (language) {
                case 'fr':
                    expectedTooltip = 'Le solde actuel de ce produit est inférieur au niveau minimum';
                    break;
                case 'pt':
                    expectedTooltip = 'O saldo atual deste produto é inferior ao nível mínimo';
                    break;
                case 'es':
                    expectedTooltip = 'الرصيد الحالي لهذا المنتج أقل من الحد الأدنى المطلوب';
                    break;
                case 'en':
                default:
                    expectedTooltip = 'The current balance of this product is less than minimum level';
                    break;
            }

            expect(tooltipText.trim()).toContain(expectedTooltip);
        });


    });
});