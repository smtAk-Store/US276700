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

const programmeData = require('../testdata/InputData/ProgrammeData.json');
const BCGData = require('../testdata/InputData/BCGImmunizationData.json');
const productTypeArrivalData = require('../testdata/InputData/addProductTypeArrival.json');
const productTypeIssueData = require('../testdata/InputData/ProductTypeIssue.json');
const productTypeArrivalDataNew = require('../testdata/InputData/productTypeArrivalnew.json');
const productTypeIssueDataNew = require('../testdata/InputData/productTypeNewIssue.json');
//const languages = ['en','fr','pt','es'];
const languages = ['en'];

languages.forEach(language => {

  test.describe(`@regression12 Refctored Validate Alerts for Supplies - Language: ${language}`, () => {

    let stockOverviewPage;

    test.beforeEach(async ({ page }) => {
      test.setTimeout(280000);

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

    test(`US-148322:TC-01 : Verify alert appears when stock is below minimum level for supplies`, async () => {
      const expected = await validateCalculateStockLevelsAndAlerts(
        BCGData.CurrentStockBelowMinimumLevel
      );

      console.log(` expected: ${expected}, safety+lead: ${BCGData.saftyWeeks + BCGData.LeadWeeks}`);
      const productType= 'Supplies'; 
      console.log('langauage is ',language);
      
      await stockOverviewPage.evaluateCurrentStockBalance(
                programmeData[0].administrationSyringe[language],
                addLineToIssueData.wastage[language],
                addLineToArrivalData.SimpleArrival[language],
                productTypeArrivalDataNew,
                productTypeIssueDataNew,
                productType,
                language,
                BCGData.CurrentStockBelowMinimumLevel
      );

      const tooltipText = await stockOverviewPage.highlightTdAndVerifyTooltip(
         programmeData[0].administrationSyringe[language]
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

    test(`US-148322:TC-02 :Verify No alert appears when stock is Above minimum level for supplies`, async () => {
      const expected = await validateCalculateStockLevelsAndAlerts(
        BCGData.CurrentStockAboveMinimumLevel
      );
      const productType= 'Supplies'; 
      console.log('langauage is ',language);

      console.log(` expected: ${expected}, safety+lead: ${BCGData.saftyWeeks + BCGData.LeadWeeks}`);

    await stockOverviewPage.evaluateCurrentStockBalance(  
                 programmeData[0].administrationSyringe[language],
                addLineToIssueData.wastage[language],
                addLineToArrivalData.SimpleArrival[language],
                productTypeArrivalDataNew,
                productTypeIssueDataNew,
                productType,
                language,
                BCGData.CurrentStockBelowMinimumLevel
      );

      const tooltipCount = await stockOverviewPage.highlightTdAndVerifyNoTooltip(
        programmeData[0].administrationSyringe[language]
      );

      expect(expected).toBeGreaterThanOrEqual(
        BCGData.saftyWeeks + BCGData.LeadWeeks
      );

      expect(tooltipCount).toBe(false);
    });

  
  });
});

/** Helper Function */
async function validateCalculateStockLevelsAndAlerts(CurrentStockThresholdLevel) {
  const targetPopulation = BCGData.target_population;
  const dosesPerTarget = BCGData.doses_per_target;
  const wastageRate = BCGData.wastage_rate;
  const estimatedCoverage = BCGData.estimated_coverage;

  const QtyNeededPerYear =
    targetPopulation *
    (estimatedCoverage / 100) *
    dosesPerTarget *
    (100 / (100 - wastageRate));

  const QtyNeededPerWeek = QtyNeededPerYear / 52;

  return Math.round(CurrentStockThresholdLevel / QtyNeededPerWeek);
}