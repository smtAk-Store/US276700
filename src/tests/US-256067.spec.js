import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { HomePage } from '../pages/homePage';
import { MasterDataPage } from '../pages/masterDatapage.js';
import { ProgrammeData } from '../pages/programmeData';

const masterData = require('../testdata/InputData/masterData.json');

const languages = ['en'];

languages.forEach(language => {

  test.describe(`Vaccination Flow - ${language}`, () => {

    test('Administrator Vaccination', async ({ page }) => {

      const loginPage = new LoginPage(page);
      const homePage = new HomePage(page);
      const masterDataPage = new MasterDataPage(page);
      const programmeData = new ProgrammeData(page);

      await loginPage.loginAs('sdAdmin', language);
      await homePage.verifyMenus();

      await masterDataPage.openAndVerifySafeInjectionEquipment();

      await masterDataPage.fillMasterDataForm(
        masterData,
        masterData.productNameAdministrator,
        masterData.productTypeAdministration
      );

      await homePage.logout();

      await loginPage.loginAs('countryAdminVietnam', language);
      await homePage.verifyMenus();

      const result = await programmeData.createRoutineVaccination(
        masterData.productNameAdministrator,
        programmeData.administrationSyringeDropdown
      );

      expect(
        result?.replace(/[\u200E\u200F\u202A-\u202E]/g, '').trim()
      ).toBe(masterData.productNameAdministrator);

      const result1 = await programmeData.createSupplyVaccination(
        masterData.productNameAdministrator,
        programmeData.administrationSyringeDropdown
      );

      expect(
        result1?.replace(/[\u200E\u200F\u202A-\u202E]/g, '').trim()
      ).toBe(masterData.productNameAdministrator);
    });


    test('Dilution Vaccination', async ({ page }) => {

      const loginPage = new LoginPage(page);
      const homePage = new HomePage(page);
      const masterDataPage = new MasterDataPage(page);
      const programmeData = new ProgrammeData(page);

      await loginPage.loginAs('sdAdmin', language);
      await homePage.verifyMenus();

      await masterDataPage.openAndVerifySafeInjectionEquipment();

      await masterDataPage.fillMasterDataForm(
        masterData,
        masterData.productNameDilution,
        masterData.productTypeDilution
      );

      await homePage.logout();

      await loginPage.loginAs('countryAdminVietnam', language);
      await homePage.verifyMenus();

      const result = await programmeData.createRoutineVaccination(
        masterData.productNameDilution,
        programmeData.syringesDropdown
      );

      expect(
        result?.replace(/[\u200E\u200F\u202A-\u202E]/g, '').trim()
      ).toBe(masterData.productNameDilution);

      const result1 = await programmeData.createSupplyVaccination(
        masterData.productNameDilution,
        programmeData.syringesDropdown
      );

      expect(
        result1?.replace(/[\u200E\u200F\u202A-\u202E]/g, '').trim()
      ).toBe(masterData.productNameDilution);
    });


    test('Others Vaccination', async ({ page }) => {

      const loginPage = new LoginPage(page);
      const homePage = new HomePage(page);
      const masterDataPage = new MasterDataPage(page);
      const programmeData = new ProgrammeData(page);

      await loginPage.loginAs('sdAdmin', language);
      await homePage.verifyMenus();

      await masterDataPage.openAndVerifySafeInjectionEquipment();

      await masterDataPage.fillMasterDataForm(
        masterData,
        masterData.productNameothers,
        masterData.productTypeOthers
      );

      await homePage.logout();

      await loginPage.loginAs('countryAdminVietnam', language);
      await homePage.verifyMenus();

      const result1 = await programmeData.createOtherVaccination(
        masterData.productNameothers,
        programmeData.syringesDropdown
      );

      expect(
        result1?.replace(/[\u200E\u200F\u202A-\u202E]/g, '').trim()
      ).toBe(
        masterData.productNameothers
          ?.replace(/[\u200E\u200F\u202A-\u202E]/g, '')
          .trim()
      );
    });

  });

});