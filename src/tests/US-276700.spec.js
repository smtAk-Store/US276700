const { test } = require('@playwright/test');
const { ArrivalPage } = require('../pages/arrivalPage');
const testData = require('../testdata/arrival.json');
const productData = require('../testdata/InputData/productArrival.json');
import { LoginPage } from '../pages/loginPage';
import { HomePage } from '../pages/homePage';
const { ArrivalProductDialogPage } = require('../pages/arrivalProductDialoguePage');


const languages = ['en'];

const arrivalTypes = [
    "ARRIVAL",
    // "EMERGENCY",
    // "OTHERS",
    // "RETURN",
    // "STARTING BALANCE"
];

test.beforeEach(async ({ page }) => {

    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);

    await loginPage.loginAs('storeOperator');

    await homePage.verifyMenus();

});

test.describe('Arrival creation', () => {

    languages.forEach(language => {

        arrivalTypes.forEach(type => {

            test(`${type} arrival in ${language}`, async ({ page }) => {


                const arrivalPage = new ArrivalPage(page, language);

                if (language === 'fr') {

                    await arrivalPage.selectLangauge();
                }
                // } else if (language === 'pt') {
                //   await this.profileDropdown.click();
                //     await page.locator('li[role="option"]').nth(2).click();
                // } else if (language === 'ar') {
                //     await this.profileDropdown.click();
                //     await page.locator('li[role="option"]').nth(3).click();
                // } 




                const data = { ...testData.Emergency, receiptType: type };
                await arrivalPage.openArrivalForm();

                await arrivalPage.fillArrivalForm(data);

                const dialog = new ArrivalProductDialogPage(page);
                await dialog.addProductToArrival(productData);

                await arrivalPage.validateButtonEnabled()
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

                    await arrivalPage.selectLangauge();
                }

                const data = { ...testData.Emergency, receiptType: type };
                await arrivalPage.openArrivalForm();

                await arrivalPage.fillArrivalForm(data);

                const dialog = new ArrivalProductDialogPage(page);
                await dialog.addProductToArrival(productData);

                await arrivalPage.waitForLoadingToFinish();

                await arrivalPage.validateButtonEnabled();
                 await arrivalPage.validateDeletButtonEnabled();
                 await arrivalPage.clickDeleteAndVerifyPopup();
                  await arrivalPage.clickCancelButtonVerifyDeleteButtonEnabled();
                   await arrivalPage.clickDeleteAndVerifyPopup();
                     await arrivalPage.confirmationDialog.clickConfirm();
                     await arrivalPage.validateButtonDisabled();
            });

        });

    });

});

