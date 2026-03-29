const { translate } = require('../utils/translator');
const { FormComponent } = require('../components/FormComponent');
const { log } = require('node:console');
const { expect } = require('@playwright/test');

class StockOverviewPage {
  constructor(page, language) {
    this.page = page;
    this.form = new FormComponent(page);
    this.language = language;
  }

  menuItem = () => this.page.locator("//span[contains(@class,'MuiMenuItem-root')]");

  async navigateTostockOverviewpage() {
    await this.menuItem().nth(0).click();
  }
}

// Export the class directly
module.exports = StockOverviewPage;