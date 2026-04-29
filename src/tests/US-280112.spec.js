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
const BCGData = require('../testdata/InputData/BCGImmunizationData.json');
const productTypeArrivalData = require('../testdata/InputData/addProductTypeArrival.json');
const productTypeIssueData = require('../testdata/InputData/ProductTypeIssue.json');
const programDatanew = require('../testdata/InputData/programdatafornewvaccine.json');
const productTypeArrivalDataNew = require('../testdata/InputData/productTypeArrivalnew.json');
const productTypeIssueDataNew = require('../testdata/InputData/productTypeNewIssue.json');
const languages = ['en'];


languages.forEach(language => {

  test.describe(` real reafctored Validate Alerts for Vaccines and Diluents - Language: ${language}`, () => {

    let stockOverviewPage;

    // ================== RUNS ONLY ONCE ==================
    // test.beforeAll(async ({ browser }) => {
    //   const page = await browser.newPage();
    //   try {

    //     const loginPage = new LoginPage(page);
    //     const homePage = new HomePage(page);
    //     const programmePage = new ProgrammeData(page, language);
    //     const arrivalPage = new ArrivalPage(page, language);
    //     const storeSetupPage = new StoreData(page, language);

    //     await loginPage.loginAs('countryAdmin', language);
    //     await homePage.verifyMenus();

    //     console.log(`Navigated to base URL`);

    //     await programmePage.highlightAndClickAdd();
    //     await programmePage.fillPopupForm(programmeData, language);

    //     await arrivalPage.waitForLoadingToFinish();

    //     await storeSetupPage.navigateToPopulationDemographics();
    //     await storeSetupPage.editGroup1AndSave();
    //     await storeSetupPage.editVaccine5AndSave();
    //     await storeSetupPage.fillStockParametersAndClickDocument();

    //     await homePage.logout();

    //     console.log(` Programme setup completed for ${language}`);

    //   } catch (error) {
    //     console.error(`Setup failed:`, error.message);
    //     try {
    //       await page.screenshot({ path: `setup-failed-${language}-${Date.now()}.png`, fullPage: true });
    //       console.log(`Screenshot saved for debugging`);
    //     } catch (e) { }
    //     throw error;
    //   } finally {
    //     await page.close().catch(() => { });
    //   }
    // });

    // ================== BEFORE EACH ==================
    test.beforeEach(async ({ page }) => {
      //test.setTimeout(180000);

      const loginPage = new LoginPage(page);
      const issuingPage = new IssuingPage(page, language);
      const storePageInstance = new StoreData(page, language);

      console.log(` Logging in as Store Operator for ${language}`);

      await loginPage.loginAs('syriaStoreOperator', language);
     // await storePageInstance.selectStore(programmeData[0].store[language]);
  await storePageInstance.selectStore(programmeData[0].Mainstore[language]);
      stockOverviewPage = new StockOverviewPage(page, language);
      await stockOverviewPage.navigateTostockOverviewpage();

      console.log(` Stock Overview page ready`);
    });

    // ================== TEST ==================

    test(` reafctored Verify alert appears when stock is below minimum level for Vaccines`, async () => {
      const expected = await calculationService.evaluateMinimumStockLevelForVaccines(BCGData,
        BCGData.CurrentStockBelowMinimumLevel
      );

      console.log(` expected: ${expected}, safety+lead: ${BCGData.saftyWeeks + BCGData.LeadWeeks}`);



      const productType = 'Vaccines';
      await stockOverviewPage.evaluateCurrentStockBalance(    
               programDatanew[0].vaccine[language],
                addLineToIssueData.wastage[language],
                addLineToArrivalData.SimpleArrival[language],
                productTypeArrivalDataNew,
                productTypeIssueDataNew,
                productType,
                language,
                BCGData.CurrentStockBelowMinimumLevel
      );

      const tooltipText = await stockOverviewPage.highlightTdAndVerifyTooltip(
        programDatanew[0].vaccine[language]
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

    test(` reafctored Verify No alert appears when stock is above minimum level for Vaccines`, async () => {
      const expected = await calculationService.evaluateMinimumStockLevelForVaccines(BCGData,
        BCGData.CurrentStockAboveMinimumLevel
      );

      console.log(` expected: ${expected}, safety+lead: ${BCGData.saftyWeeks + BCGData.LeadWeeks}`);

      const productType = 'Vaccines';
      await stockOverviewPage.evaluateCurrentStockBalance(    
               programDatanew[0].vaccine[language],
                addLineToIssueData.wastage[language],
                addLineToArrivalData.SimpleArrival[language],
                productTypeArrivalDataNew,
                productTypeIssueDataNew,
                productType,
                language,
                BCGData.CurrentStockAboveMinimumLevel
      );
      const tooltipCount = await stockOverviewPage.highlightTdAndVerifyNoTooltip(
       programDatanew[0].vaccine[language]
      );

      expect(expected).toBeGreaterThanOrEqual(
        BCGData.saftyWeeks + BCGData.LeadWeeks
      );

   expect(tooltipCount).toBe(true);
    });


    test(` reafctored Verify real Zero Stock alert appears for Vaccines`, async () => {
      const productType = 'Vaccines';
      await stockOverviewPage.validateZeroStockBalance(
         programDatanew[0].vaccine[language],
                addLineToIssueData.wastage[language],
                addLineToArrivalData.SimpleArrival[language],
                productTypeArrivalDataNew,
                productTypeIssueDataNew,
                productType,
                language,
                BCGData.CurrentStockMinimumLevel
      );

      const tooltipText = await stockOverviewPage.highlightTdAndVerifyTooltip(
       programDatanew[0].vaccine[language]
      );
      let expectedTooltip;

      switch (language) {
        case 'fr':
          expectedTooltip = 'Ce produit est en rupture de stock';
          break;
        case 'pt':
          expectedTooltip = 'Este produto está fora de estoque';
          break;
        case 'es':
          expectedTooltip = 'هذه المادة غير متوفرة';
          break;
        case 'en':
        default:
          expectedTooltip = 'This product is out of stock';
          break;
      }

      expect(tooltipText.trim()).toContain(expectedTooltip);
    });

    test(` reafctored Verify alert appears when stock is below minimum level for Diluents`, async () => {
      const expected = await calculationService.evaluateMinimumStockLevelForDiluents(
        BCGData, BCGData.CurrentStockBelowMinimumLevel
      );

      console.log(` expected: ${expected}, safety+lead: ${BCGData.saftyWeeks + BCGData.LeadWeeks}`);



      const productType = 'Diluents';
      await stockOverviewPage.evaluateCurrentStockBalance(   
          programDatanew[0].dilution[language],
                addLineToIssueData.wastage[language],
                addLineToArrivalData.SimpleArrival[language],
                productTypeArrivalDataNew,
                productTypeIssueDataNew,
                productType,
                language,
                BCGData.CurrentStockBelowMinimumLevel

      );

      const tooltipText = await stockOverviewPage.highlightTdAndVerifyTooltip(
       programDatanew[0].dilution[language]
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

    test(`reafctored Verify No alert appears when stock is above minimum level for Diluents`, async () => {
      const expected = await calculationService.evaluateMinimumStockLevelForDiluents(BCGData,
        BCGData.CurrentStockAboveMinimumLevel
      );

      console.log(` expected: ${expected}, safety+lead: ${BCGData.saftyWeeks + BCGData.LeadWeeks}`);

      const productType = 'Diluents';
      await stockOverviewPage.evaluateCurrentStockBalance(      
        programDatanew[0].dilution[language],
                addLineToIssueData.wastage[language],
                addLineToArrivalData.SimpleArrival[language],
                productTypeArrivalDataNew,
                productTypeIssueDataNew,
                productType,
                language,
                BCGData.CurrentStockAboveMinimumLevel
      );

      const tooltipCount = await stockOverviewPage.highlightTdAndVerifyNoTooltip(
        programDatanew[0].dilution[language]
      );

      expect(expected).toBeGreaterThanOrEqual(
        BCGData.saftyWeeks + BCGData.LeadWeeks
      );

     expect(tooltipCount).toBe(true);
    });


    test(` reafctored Verify Zero Stock alert appears for Diluents`, async () => {
      const productType = 'Diluents';
      await stockOverviewPage.validateZeroStockBalance(
        programDatanew[0].dilution[language],
                addLineToIssueData.wastage[language],
                addLineToArrivalData.SimpleArrival[language],
                productTypeArrivalDataNew,
                productTypeIssueDataNew,
                productType,
                language,
                BCGData.CurrentStockMinimumLevel
      );

      const tooltipText = await stockOverviewPage.highlightTdAndVerifyTooltip(
         programDatanew[0].dilution[language]
      );

      let expectedTooltip;

      switch (language) {
        case 'fr':
          expectedTooltip = 'Ce produit est en rupture de stock';
          break;
        case 'pt':
          expectedTooltip = 'Este produto está fora de estoque';
          break;
        case 'es':
          expectedTooltip = 'هذه المادة غير متوفرة';
          break;
        case 'en':
        default:
          expectedTooltip = 'This product is out of stock';
          break;
      }

      expect(tooltipText.trim()).toContain(expectedTooltip);
    });


  });
});

