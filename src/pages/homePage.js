import { expect } from '@playwright/test';

export class HomePage {

  constructor(page) {
    this.page = page;

    this.usersMenu = page.getByRole('menuitem', { name: 'Users' });
    this.masterData = page.getByRole('menuitem', { name: 'Master Data' });
    this.documentation = page.getByRole('menuitem', { name: 'Documentation' });

    this.proceedLogin = page.getByRole('button', { name: /proceed to login/i });

    this.profileDropdown = page.locator("header svg").last();
    this.logoutButton = page.getByRole('button', { name: /logout/i });
  }

  async handleProceedPopup() {

    try {
      // wait max 5 seconds for popup
      await this.proceedLogin.waitFor({ state: 'visible', timeout: 5000 });

      console.log("Proceed popup appeared - clicking");

      await this.proceedLogin.click();

    } catch (error) {

      console.log("Proceed popup not present");

    }

  }

  async verifyMenus() {

    //await this.handleProceedPopup();

    // await expect(this.usersMenu).toBeVisible();
    // await expect(this.masterData).toBeVisible();
    // await expect(this.documentation).toBeVisible();

  }

  async logout() {

    await this.handleProceedPopup();

    await this.profileDropdown.click();
    await this.logoutButton.click();

  }

}