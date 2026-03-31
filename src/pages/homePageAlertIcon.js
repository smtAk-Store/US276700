import { expect } from '@playwright/test';
const { FormComponent } = require('../components/FormComponent');

class HomePageAlertIcon {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;
        this.alertIcon = page.locator("//span[contains(@class,'MuiBadge-badge')]/preceding::button[1]");
        this.firstSMTNumber = page.locator("//span[@class='smtNo']").first(); 
    }
     async clickAlertAndFirstSMT() {
        // 1️⃣ Click the alert icon
        await this.alertIcon.click();

        // 2️⃣ Store the SMT number text
        const firstSMT = await this.firstSMTNumber.textContent();
        console.log("firstSMT :"+ firstSMT)

        // 3️⃣ Click the SMT number itself
        await this.firstSMTNumber.click();
  
        // 4️⃣ Return the stored SMT number
        return firstSMT;
        
    }
    
}

module.exports = { HomePageAlertIcon };
