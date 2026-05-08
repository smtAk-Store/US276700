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

  test.describe(`@regression12 Vaccination Flow real reafctored Validate Alerts for Vaccines and Diluents - Language: ${language}`, () => {

    let stockOverviewPage;

    test.beforeEach(async ({ page }) => {

      const loginPage = new LoginPage(page);
      const issuingPage = new IssuingPage(page, language);
      const storePageInstance = new StoreData(page, language);

      console.log(` Logging in as Store Operator for ${language}`);

      await loginPage.loginAs('syriaStoreOperator', language);

      await storePageInstance.selectStore(programmeData[0].Mainstore[language]);
      stockOverviewPage = new StockOverviewPage(page, language);
      await stockOverviewPage.navigateTostockOverviewpage();

      console.log(` Stock Overview page ready`);
    });

    // ================== TEST ==================

    test(`US-280112:TC-01 : Verify alert appears when stock is below minimum level for Vaccines`, async () => {
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

    test(`US-280112:TC-02 :  Verify No alert appears when stock is above minimum level for Vaccines`, async () => {
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


    test(`US-280112:TC-03: Verify  Zero Stock alert appears for Vaccines`, async () => {
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

    test(`US-280112:TC-04 : Verify alert appears when stock is below minimum level for Diluents`, async () => {
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

    test(`US-280112:TC-05: Verify No alert appears when stock is above minimum level for Diluents`, async () => {
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


    test(` US-280112:TC-06: Verify Zero Stock alert appears for Diluents`, async () => {
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

