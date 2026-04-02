
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { HomePage } from '../pages/homePage';
import { ProgrammeData } from '../pages/programmeData';
import { ArrivalPage } from '../pages/arrivalPage';
import { StoreData } from '../pages/StoreData';
const StockOverviewPage = require('../pages/StockOverviewPage');
const { IssuingPage } = require('../pages/Issuingpage');
const testData = require('../testdata/arrival.json');
const issuingData = require('../testdata/IssuingTab.json');

const programmeData = require('../testdata/InputData/ProgrammeData.json');
const BCGData = require('../testdata/InputData/BCGImmunizationData.json');
const sunset = require('../testdata/InputData/sunsetProduct.json');

const languages = ['en', 'fr', 'pt', 'es'];

//const languages = ['es'];

languages.forEach(language => {

  test.describe(`Validate Alerts for Supplies - Language: ${language}`, () => {

    let stockOverviewPage;

    // ================== RUNS ONLY ONCE (Programme Creation) ==================
    test.beforeAll(async ({ browser }) => {
      const page = await browser.newPage();
      try {

        const loginPage = new LoginPage(page);
        const homePage = new HomePage(page);
        const programmePage = new ProgrammeData(page, language);
        const arrivalPage = new ArrivalPage(page, language);
        const storeSetupPage = new StoreData(page, language);

        await loginPage.loginAs('countryAdmin', language);

        await homePage.verifyMenus();

        console.log(`✅ Navigated to base URL`);

        await programmePage.highlightAndClickAdd();   // Now more stable

        await programmePage.fillPopupForm(programmeData, language);

        await arrivalPage.waitForLoadingToFinish();

        await storeSetupPage.navigateToPopulationDemographics();
        await storeSetupPage.editGroup1AndSave();
        await storeSetupPage.editVaccine5AndSave();
        await storeSetupPage.fillStockParametersAndClickDocument();

        await homePage.logout();

        console.log(` Programme setup completed for ${language}`);

      } catch (error) {
        console.error(`Setup failed:`, error.message);
        try {
          await page.screenshot({ path: `setup-failed-${language}-${Date.now()}.png`, fullPage: true });
          console.log(`📸 Screenshot saved for debugging`);
        } catch (e) { }
        throw error;
      } finally {
        await page.close().catch(() => { });
      }
    });
    // ================== RUNS BEFORE EVERY TEST ==================
    test.beforeEach(async ({ page }) => {
      test.setTimeout(180000);

      const loginPage = new LoginPage(page);
      const issuingPage = new IssuingPage(page, language);
      const storePageInstance = new StoreData(page, language);

      console.log(` Logging in as Store Operator for ${language}`);

      await loginPage.loginAs('storeOperator1', language);
      await storePageInstance.selectStore(programmeData[0].store[language]);

      stockOverviewPage = new StockOverviewPage(page, language);
      await stockOverviewPage.navigateTostockOverviewpage();


      console.log(` Stock Overview page ready`);
    });

    // ================== TESTS ==================
    test(`Verify alert appears when stock is below minimum level`, async () => {
      const expected = await validateCalculateStockLevelsAndAlerts(BCGData.CurrentStockBelowMinimumLevel);

      console.log(` expected: ${expected}, safety+lead: ${BCGData.saftyWeeks + BCGData.LeadWeeks}`);
      await stockOverviewPage.verifyAndHighlightFromJson(
        programmeData[0].administrationSyringe[language],
        issuingData.wastage[language],
        sunset,
        language,
        BCGData.CurrentStockBelowMinimumLevel
      );
      await stockOverviewPage.highlightTdAndVerifyTooltip(
        programmeData[0].administrationSyringe[language]
      );

      expect(expected).toBeLessThanOrEqual(BCGData.saftyWeeks + BCGData.LeadWeeks);
    });

    test(`Verify No alert appears when stock is Above minimum level`, async () => {
      const expected = await validateCalculateStockLevelsAndAlerts(BCGData.CurrentStockAboveMinimumLevel);

      console.log(` expected: ${expected}, safety+lead: ${BCGData.saftyWeeks + BCGData.LeadWeeks}`);
      await stockOverviewPage.verifyAndHighlightFromJson(
        programmeData[0].administrationSyringe[language], issuingData.wastage[language], BCGData.CurrentStockAboveMinimumLevel,);
      await stockOverviewPage.highlightTdAndVerifyTooltip(
        programmeData[0].administrationSyringe[language]
      );

      expect(expected).toBeGreaterThanOrEqual(BCGData.saftyWeeks + BCGData.LeadWeeks);
    });

    test(`Verify alert appears when stock is Zero`, async () => {
      const expected = await validateCalculateStockLevelsAndAlerts();
      expect(expected).toBeLessThanOrEqual(0);
    });

  });
});

/** Helper Function */
async function validateCalculateStockLevelsAndAlerts(CurrentStockThresholdLevel) {
  const targetPopulation = BCGData.target_population;
  const dosesPerTarget = BCGData.doses_per_target;
  const wastageRate = BCGData.wastage_rate;
  const estimatedCoverage = BCGData.estimated_coverage;

  const QtyNeededPerYear = targetPopulation * (estimatedCoverage / 100) * dosesPerTarget * (100 / (100 - wastageRate));
  const QtyNeededPerWeek = QtyNeededPerYear / 52;

  return Math.round(CurrentStockThresholdLevel / QtyNeededPerWeek);
}
