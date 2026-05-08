const { test } = require('@playwright/test');

// ---------------- PAGES ----------------
const { ArrivalPage } = require('../pages/arrivalPage');
const { IssuingPage } = require('../pages/Issuingpage');
const StockOverviewPage = require('../pages/StockOverviewPage');

const { LoginPage } = require('../pages/loginPage');
const { HomePage } = require('../pages/homePage');
const { StoreData } = require('../pages/StoreData');
const { ArrivalProductDialogPage } = require('../pages/arrivalProductDialoguePage');
const { HomePageAlertIcon } = require('../pages/homePageAlertIcon');
const { ReportPage } = require('../pages/reportPage');

// ---------------- TEST DATA ----------------
const testData = require('../testdata/addlinetoarrival.json');
const addLineToIssueData = require('../testdata/addLineToIssue.json');

const productTypeArrivalData = require('../testdata/InputData/addProductTypeArrival.json');
const productIssuingTab = require('../testdata/InputData/productIssuingTab.json');

const programmeData = require('../testdata/InputData/ProgrammeData.json');
const BCGData = require('../testdata/InputData/BCGImmunizationData.json');

// ---------------- CONFIG ----------------
const languages = ['en'];
const arrivalTypes = ["ARRIVAL"];

// =======================================================

test.describe('@regression12 ISSUING AUTOMATION', () => {

  languages.forEach(language => {

    test.beforeEach(async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.loginAs('storeOperator', language);
    });

    // =======================================================
    // 1. CREATE ARRIVAL
    // =======================================================
    test.describe('US-276700:TC-01 : Create New Arrival and Validate Finalize Button Enabled', () => {

      arrivalTypes.forEach(type => {

        test(`${type} addlinetoarrival in ${language}`, async ({ page }) => {

          const arrivalPage = new ArrivalPage(page, language);
          const data = { ...testData.Emergency, receiptType: type };

          await arrivalPage.openArrivalForm();
          await arrivalPage.fillArrivalForm(data);

          const dialog = new ArrivalProductDialogPage(page);

          await dialog.addProductToArrival(
            productTypeArrivalData,
            language,
            'Vaccines',
            BCGData.CurrentStockBelowMinimumLevel
          );

          await arrivalPage.waitForLoadingToFinish();
          await arrivalPage.validateButtonEnabled();
        });

      });

    });

    // =======================================================
    // 2. DELETE FLOW
    // =======================================================
    test.describe('US-276700:TC-02  :  Create Arrival  and Deletion Popup Behaviour validate success message', () => {

      arrivalTypes.forEach(type => {

        test(`${type} arrival delete flow in ${language}`, async ({ page }) => {

          const arrivalPage = new ArrivalPage(page, language);
          const data = { ...testData.Emergency, receiptType: type };

          await arrivalPage.openArrivalForm();
          await arrivalPage.fillArrivalForm(data);

          const dialog = new ArrivalProductDialogPage(page);

          await dialog.addProductToArrival(
            productTypeArrivalData,
            language,
            'Vaccines',
            BCGData.CurrentStockBelowMinimumLevel
          );

          await arrivalPage.waitForLoadingToFinish();

          await arrivalPage.validateButtonEnabled();
          await arrivalPage.validateDeletButtonEnabled();
          await arrivalPage.clickDeleteAndVerifyPopup();
          await arrivalPage.clickCancelButtonVerifyDeleteButtonEnabled();
          await arrivalPage.clickDeleteAndVerifyPopup();
          await arrivalPage.confirmationDialog.clickConfirm();
          await arrivalPage.verifyDeleteSuccessMessage();
        });

      });

    });

    // =======================================================
    // 3. FINALIZE FLOW
    // =======================================================
    test.describe('US-276700:TC-03 : Create Arrival and Finalize  and Verify Success message', () => {

      arrivalTypes.forEach(type => {

        test(`${type} finalize in ${language}`, async ({ page }) => {

          const arrivalPage = new ArrivalPage(page, language);
          const data = { ...testData.Emergency, receiptType: type };

          await arrivalPage.openArrivalForm();
          await arrivalPage.fillArrivalForm(data);

          const dialog = new ArrivalProductDialogPage(page);

          await dialog.addProductToArrival(
            productTypeArrivalData,
            language,
            'Vaccines',
            BCGData.CurrentStockBelowMinimumLevel
          );

          await arrivalPage.waitForLoadingToFinish();

          await arrivalPage.validateButtonEnabled();
          await arrivalPage.validateDeletButtonEnabled();

          await arrivalPage.clickFinalizeVerifyPopup();
          await arrivalPage.confirmationDialog.clickConfirm();
          await arrivalPage.verifyFinalizeSuccessMessage();
        });

      });

    });

    // =======================================================
    // 4. AUTOMATIC APPROVAL + ISSUING FLOW
    // =======================================================
    test.describe('US-276700:TC-04 : Verify Automatic Approval of the issue and verify the Alert', () => {

      arrivalTypes.forEach(type => {

        test(`${type} arrival - add line items ${language}`, async ({ page }) => {

          const stockOverviewPageLocal = new StockOverviewPage(page);

          const arrivalPage = new ArrivalPage(page, language);
          const issuingPage = new IssuingPage(page, language);

          const loginPage = new LoginPage(page);
          const homePage = new HomePage(page);
          const storePage = new StoreData(page, language);
          const homeAlert = new HomePageAlertIcon(page);

          const [data2] = programmeData;
          const productType = 'Vaccines';

          const data = { ...testData.Emergency, receiptType: type };

          await arrivalPage.openArrivalForm();
          await arrivalPage.fillArrivalFormCRROnly(data);

          const dialog = new ArrivalProductDialogPage(page);

          await dialog.addProductToArrival(
            productTypeArrivalData,
            language,
            productType,
            BCGData.CurrentStockBelowMinimumLevel
          );

          await arrivalPage.waitForLoadingToFinish();
          await arrivalPage.clickFinalizeVerifyPopup();
          await arrivalPage.confirmationDialog.clickConfirm();
          await arrivalPage.verifyFinalizeSuccessMessage();

          const issuingScenario = { ...addLineToIssueData.requisition[language] };
          const [product] = productIssuingTab;

          await issuingPage.openIssuingForm();
          await issuingPage.fillIssuingFormCRROnly(issuingScenario);
          await issuingPage.addProductToIssuingTabPopup(product, language);
          await issuingPage.clickFinalizeVerifyPopupinIssuingTab();
         await arrivalPage.confirmationDialog.clickConfirm();
          await homePage.logout();
          await loginPage.loginAs('storeOperator1', language);
          await storePage.selectStore(data2.store[language]);

          const storedSMT = await homeAlert.clickAlertAndFirstSMT();

          await arrivalPage.validateDeletButtonEnabled();
          await arrivalPage.switchTabs();
          await arrivalPage.filterBySMT(storedSMT);
          await arrivalPage.highlightSecondRowCells();

        });

      });

    });

  });

});