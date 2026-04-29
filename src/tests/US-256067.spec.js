import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { HomePage } from '../pages/homePage';
import { MasterDataPage } from '../pages/masterDatapage.js';
import { ProgrammeData } from '../pages/programmeData';
import { ArrivalPage } from '../pages/arrivalPage';
import { StoreData } from '../pages/StoreData';

const programmeDatanew = require('../testdata/InputData/ProgrammeData.json');
const StockOverviewPage = require('../pages/StockOverviewPage');
const masterData = require('../testdata/InputData/masterData.json');
const programDatanew = require('../testdata/InputData/programdatafornewvaccine.json');
const productTypeArrivalDataNew = require('../testdata/InputData/productTypeArrivalnew.json');
const productTypeIssueDataNew = require('../testdata/InputData/productTypeNewIssue.json');
const BCGData = require('../testdata/InputData/BCGImmunizationData.json');
const addLineToArrivalData = require('../testdata/addlinetoarrival.json');
const addLineToIssueData = require('../testdata/addLineToIssue.json');
const calculationService = require('../service/CalculationService');
const programmeData = require('../testdata/InputData/ProgrammeData.json');
const languages = ['en'];

languages.forEach(language => {

  test.describe(`Vaccination Flow - ${language}`, () => {

    test('Administrator Vaccination', async ({ page }) => {

      const loginPage = new LoginPage(page);
      const homePage = new HomePage(page);
      const masterDataPage = new MasterDataPage(page);
      const ProgrammeDatapage = new ProgrammeData(page);

      await loginPage.loginAs('sdAdmin', language);
      await homePage.verifyMenus();

      await masterDataPage.openAndVerifySafeInjectionEquipment();

      await masterDataPage.fillMasterDataForm(
        masterData,
        masterData.productNameAdministrator,
        masterData.productTypeAdministration
      );

      await homePage.logout();

      await loginPage.loginAs('syriaCountryAdmin', language);
      await homePage.verifyMenus();

      const result = await ProgrammeDatapage.createRoutineVaccination(
        masterData.productNameAdministrator,
        ProgrammeDatapage.administrationSyringeDropdown
      );

      expect(result?.replace(/[\u200E\u200F\u202A-\u202E]/g, '').trim())
        .toBe(masterData.productNameAdministrator);

      const result1 = await ProgrammeDatapage.createSupplyVaccination(
        masterData.productNameAdministrator,
        ProgrammeDatapage.administrationSyringeDropdown
      );

      expect(result1?.replace(/[\u200E\u200F\u202A-\u202E]/g, '').trim())
        .toBe(masterData.productNameAdministrator);
    });

    test('Dilution Vaccination', async ({ page }) => {

      const loginPage = new LoginPage(page);
      const homePage = new HomePage(page);
      const masterDataPage = new MasterDataPage(page);
      const ProgrammeDatapage = new ProgrammeData(page);

      await loginPage.loginAs('sdAdmin', language);
      await homePage.verifyMenus();

      await masterDataPage.openAndVerifySafeInjectionEquipment();

      await masterDataPage.fillMasterDataForm(
        masterData,
        masterData.productNameDilution,
        masterData.productTypeDilution
      );

      await homePage.logout();

      await loginPage.loginAs('syriaCountryAdmin', language);
      await homePage.verifyMenus();

      const result = await ProgrammeDatapage.createRoutineVaccination(
        masterData.productNameDilution,
        ProgrammeDatapage.syringesDropdown
      );

      expect(result?.replace(/[\u200E\u200F\u202A-\u202E]/g, '').trim())
        .toBe(masterData.productNameDilution);

      const result1 = await ProgrammeDatapage.createSupplyVaccination(
        masterData.productNameDilution,
        ProgrammeDatapage.syringesDropdown
      );

      expect(result1?.replace(/[\u200E\u200F\u202A-\u202E]/g, '').trim())
        .toBe(masterData.productNameDilution);
    });

    test('Others Vaccination', async ({ page }) => {

      const loginPage = new LoginPage(page);
      const homePage = new HomePage(page);
      const masterDataPage = new MasterDataPage(page);
      const ProgrammeDatapage = new ProgrammeData(page);

      await loginPage.loginAs('sdAdmin', language);
      await homePage.verifyMenus();

      await masterDataPage.openAndVerifySafeInjectionEquipment();

      await masterDataPage.fillMasterDataForm(
        masterData,
        masterData.productNameothers,
        masterData.productTypeOthers
      );

      await homePage.logout();

      await loginPage.loginAs('syriaCountryAdmin', language);
      await homePage.verifyMenus();

      const result1 = await ProgrammeDatapage.createOtherVaccination(
        masterData.productNameothers,
        ProgrammeDatapage.syringesDropdown
      );

      expect(result1?.replace(/[\u200E\u200F\u202A-\u202E]/g, '').trim())
        .toBe(masterData.productNameothers.replace(/[\u200E\u200F\u202A-\u202E]/g, '').trim());
    });

    test('Verify Alert for Supplies Vaccination', async ({ page }) => {

  const loginPage = new LoginPage(page);
      const homePage = new HomePage(page);
      const masterDataPage = new MasterDataPage(page);
      const ProgrammeDatapage = new ProgrammeData(page, language);
      const stockOverviewPage = new StockOverviewPage(page, language);
      const storeSetupPage = new StoreData(page, language);
      const arrivalPage = new ArrivalPage(page, language);

      await loginPage.loginAs('sdAdmin', language);
      await homePage.verifyMenus();

      await masterDataPage.openAndVerifySafeInjectionEquipment();

      await masterDataPage.fillMasterDataForm(
        masterData,
        masterData.productNameAdministrator,
        masterData.productTypeAdministration
      );

      await homePage.logout();

      await loginPage.loginAs('syriaCountryAdmin', language);
      await homePage.verifyMenus();

      const result = await ProgrammeDatapage.createSupplyVaccination(
        masterData.productNameAdministrator,
        ProgrammeDatapage.administrationSyringeDropdown 
      );

      expect(result?.replace(/[\u200E\u200F\u202A-\u202E]/g, '').trim())
        .toBe(masterData.productNameAdministrator);

      await ProgrammeDatapage.clickCancelButton();
     await ProgrammeDatapage.highlightAndClickAddSupplyVaccinations();
      await ProgrammeDatapage.fillPopupForm(programDatanew, language);
      await homePage.logout();

      await loginPage.loginAs('syriaStoreOperator', language);
       await storeSetupPage.selectStore(programmeData[0].Mainstore[language]);

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

      const expected = await calculationService.evaluateMinimumStockLevelForVaccines(
        BCGData,
        BCGData.CurrentStockBelowMinimumLevel
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

    test('Verify Alert for Routine Vaccination', async ({ page }) => {

      const loginPage = new LoginPage(page);
      const homePage = new HomePage(page);
      const masterDataPage = new MasterDataPage(page);
      const ProgrammeDatapage = new ProgrammeData(page, language);
      const stockOverviewPage = new StockOverviewPage(page, language);
      const storeSetupPage = new StoreData(page, language);
      const arrivalPage = new ArrivalPage(page, language);

      await loginPage.loginAs('sdAdmin', language);
      await homePage.verifyMenus();

      await masterDataPage.openAndVerifySafeInjectionEquipment();

      await masterDataPage.fillMasterDataForm(
        masterData,
        masterData.productNameAdministrator,
        masterData.productTypeAdministration
      );

      await homePage.logout();

      await loginPage.loginAs('syriaCountryAdmin', language);
      await homePage.verifyMenus();

      const result = await ProgrammeDatapage.createRoutineVaccination(
        masterData.productNameAdministrator,
        ProgrammeDatapage.administrationSyringeDropdown 
      );

      expect(result?.replace(/[\u200E\u200F\u202A-\u202E]/g, '').trim())
        .toBe(masterData.productNameAdministrator);

      await ProgrammeDatapage.clickCancelButton();
     await ProgrammeDatapage.highlightAndClickAdd();

      await ProgrammeDatapage.fillPopupForm(programDatanew, language);
      await arrivalPage.waitForLoadingToFinish();
      await homePage.logout();
      await loginPage.loginAs('syriaStoreOperator', language);
       await storeSetupPage.selectStore(programmeData[0].Mainstore[language]);

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

      const expected = await calculationService.evaluateMinimumStockLevelForVaccines(
        BCGData,
        BCGData.CurrentStockBelowMinimumLevel
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