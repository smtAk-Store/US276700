const { test } = require('@playwright/test');
const { ArrivalPage } = require('../pages/arrivalPage');
const { IssuingPage } = require('../pages/Issuingpage');
const testData = require('../testdata/addlinetoarrival.json');
const addLineToIssueData = require('../testdata/IssuingTab.json');
const productData = require('../testdata/InputData/productArrival.json');
const productTypeArrivalData = require('../testdata/InputData/addProductTypeArrival.json');
import { LoginPage } from '../pages/loginPage';
import { HomePage } from '../pages/homePage';
const productIssuingTab = require('../testdata/InputData/productIssuingTab.json');
const { ArrivalProductDialogPage } = require('../pages/arrivalProductDialoguePage');
const { StoreData } = require('../pages/StoreData');
const programmeData = require('../testdata/InputData/ProgrammeData.json');
const { HomePageAlertIcon } = require('../pages/homePageAlertIcon');

//const languages = ['en', 'fr', 'es', 'pt'];

const languages = ['en'];
const arrivalTypes = [
    "ARRIVAL",
    // "EMERGENCY",
    //    "OTHERS",
    //    "RETURN",
    //    "STARTING BALANCE"
];

test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);

    await loginPage.loginAs('storeOperator');
    await homePage.verifyMenus();
});

test.describe('Create New Arrival and Validate buttons', () => {

    languages.forEach(language => {

        arrivalTypes.forEach(type => {

            test(`${type} addlinetoarrival in ${language}`, async ({ page }) => {

                const arrivalPage = new ArrivalPage(page, language);

                // Select French language if needed
                if (language === 'fr') {
                    await arrivalPage.selectLangaugeFrench();
                } else if (language === 'pt') {
                    await arrivalPage.selectLangaugePortugal();
                } else if (language === 'es') {
                    await arrivalPage.selectLangaugeArabic();
                }

                const data = { ...testData.Emergency, receiptType: type };
                await arrivalPage.openArrivalForm();
                await arrivalPage.fillArrivalForm(data);

                const dialog = new ArrivalProductDialogPage(page);

                await dialog.addProductToArrival(productData, language);

                await arrivalPage.validateButtonEnabled();
            });

        });

    });

});

test.describe('New Arrival creation and verify Deletion pop up behaviour', () => {

    languages.forEach(language => {

        arrivalTypes.forEach(type => {

            test(`${type} arrival in ${language}`, async ({ page }) => {


                const arrivalPage = new ArrivalPage(page, language);

                if (language === 'fr') {
                    await arrivalPage.selectLangaugeFrench();
                } else if (language === 'pt') {
                    await arrivalPage.selectLangaugePortugal();
                } else if (language === 'es') {
                    await arrivalPage.selectLangaugeArabic();
                }

                const data = { ...testData.Emergency, receiptType: type };
                await arrivalPage.openArrivalForm();

                await arrivalPage.fillArrivalForm(data);

                const dialog = new ArrivalProductDialogPage(page);
                await dialog.addProductToArrival(productData, language);

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
});

test.describe('Finalize New Arrival and verify not able to delete', () => {
    languages.forEach(language => {
        arrivalTypes.forEach(type => {
            test(`${type} arrival in ${language}`, async ({ page }) => {
                const arrivalPage = new ArrivalPage(page, language);
                if (language === 'fr') {
                    await arrivalPage.selectLangaugeFrench();
                } else if (language === 'pt') {
                    await arrivalPage.selectLangaugePortugal();
                } else if (language === 'es') {
                    await arrivalPage.selectLangaugeArabic();
                }

                const data = { ...testData.Emergency, receiptType: type };
                await arrivalPage.openArrivalForm();

                //await arrivalPage.fillArrivalForm(data);

                const dialog = new ArrivalProductDialogPage(page);
                await dialog.addProductToArrival(productData, language);

                await arrivalPage.waitForLoadingToFinish();

                await arrivalPage.validateButtonEnabled();
                await arrivalPage.validateDeletButtonEnabled();

                await arrivalPage.clickFinalizeVerifyPopup();
                await arrivalPage.confirmationDialog.clickConfirm();
                await arrivalPage.verifyFinalizeSuccessMessage();
                await arrivalPage.verifyArrivalInTable(data);
            });

        });

    });

});
test.describe('Automatic Approval and Verification of Pending state', () => {

    languages.forEach(language => {

        arrivalTypes.forEach(type => {

            test(`${type} arrival in ${language} - add line items`, async ({ page }) => {

                const arrivalPage = new ArrivalPage(page, language);
                if (language === 'fr') {
                    await arrivalPage.selectLangaugeFrench();
                } else if (language === 'pt') {
                    await arrivalPage.selectLangaugePortugal();
                } else if (language === 'es') {
                    await arrivalPage.selectLangaugeArabic();
                }
                await arrivalPage.openArrivalForm();
                const data = testData.SimpleArrival;
                const loginPage = new LoginPage(page);
                const homePage = new HomePage(page);
                const storePage = new StoreData(page, language);
                const homeAlert = new HomePageAlertIcon(page);
                const [data2] = programmeData;
                
                await arrivalPage.fillArrivalFormCRROnly(data);
                const dialog = new ArrivalProductDialogPage(page);
                await dialog.addProductToArrivalCRR(productTypeArrivalData, language);
                await arrivalPage.waitForLoadingToFinish();
                await arrivalPage.clickFinalizeVerifyPopup();
                await arrivalPage.confirmationDialog.clickConfirm();
                await arrivalPage.verifyFinalizeSuccessMessage();
                const issuingPage = new IssuingPage(page, language);
                const issuingScenario = { ...addLineToIssueData.requisition };
                const [product] = productIssuingTab;
                await issuingPage.openIssuingForm();
                await issuingPage.fillIssuingFormCRROnly(issuingScenario);
                await issuingPage.addProductToIssuingTabPopup(product, language);
                await issuingPage.clickFinalizeVerifyPopupinIssuingTab();
                await homePage.logout();
                await loginPage.loginAs('storeOperator1');
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




