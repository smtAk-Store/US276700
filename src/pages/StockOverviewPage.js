const { translate } = require('../utils/translator');
const { FormComponent } = require('../components/FormComponent');
const { expect } = require('@playwright/test');

class StockOverviewPage {
  constructor(page, language) {
    this.page = page;
    this.form = new FormComponent(page);
    this.language = language;
  }

  // 📌 Locator: Menu items (used for navigation)
  // Finds all menu items using class 'MuiMenuItem-root'
  menuItem = () => this.page.locator("//span[contains(@class,'MuiMenuItem-root')]");

  // 📌 Navigate to Stock Overview Page
  async navigateTostockOverviewpage() {
    await this.menuItem().nth(0).click();
  }

   async verifyAndHighlightFromJson(value) {
    const locator = this.page.locator('tbody tr').filter({
      has: this.page.locator('td:nth-child(2)', { hasText: value })
    });
    const count = await locator.count();
    if (count > 0) {
      const element = locator.first();
      await element.scrollIntoViewIfNeeded();
      await element.evaluate(el => {
        el.style.border = '3px solid red';
        el.style.backgroundColor = 'yellow';
      });
     // await this.onElementFound(value);
      console.log(`"${value}" -> Element FOUND and highlighted`);
    } else {
     // console.log(`"${value}" -> Element NOT FOUND`);
      
    }
      await this.page.pause();
   }
  async openFormAndDoSomething() {
    await this.openIssuingForm();
  
  } 
}

// Export the class
module.exports = StockOverviewPage;