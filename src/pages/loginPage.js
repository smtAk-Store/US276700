
import users from '../testdata/InputData/users.json';

export class LoginPage {



  constructor(page) {
    this.page = page;
    this.loginButton = page.locator('button.MuiButton-text');
    this.proceedLogin = page.locator('button.btn-login');
    this.emailField = page.locator('#signInName');   
    this.passwordField = page.locator('#password'); 
  this.signInButton = page.locator('#next');
    this.englishLanguageButton = page.getByRole('button', { name: /english/i });
    this.frenchLanguageButton = page.getByRole('button', { name: /french/i });
    this.portugueseLanguageButton = page.getByRole('button', { name: /portuguese/i });
    this.spanishLanguageButton = page.getByRole('button', { name: /العربية/i });
  }

  async openApplication() {
    await this.page.goto('/');
  }

  async login(email, password) {
    await this.loginButton.click();
    await this.proceedLogin.click();
    await this.emailField.fill(email);
    await this.passwordField.fill(password);
    await this.signInButton.click();

    await this.page.waitForURL('**/ui-home');
  }

  async loginAs(role, language) {
    const user = users.users[role];

    await this.openApplication();
    await this.selectLanguage(language);
    await this.login(user.email, user.password);
  }

  async selectLanguage(language) {
  const langCode = language.toLowerCase();

  console.log(`🌐 Selecting language: ${langCode}`);

  await this.page.waitForLoadState('domcontentloaded');

  // ✅ Always works (no text dependency)
  const languageDropdown = this.page.locator(
    'div[role="button"][aria-haspopup="listbox"]'
  ).first();

  await languageDropdown.waitFor({ state: 'visible', timeout: 15000 });
  await languageDropdown.click();

  // small wait
  await this.page.waitForTimeout(500);

  // ✅ Map language (es → ar)
  let value;
  switch (langCode) {
    case 'fr':
      value = 'fr';
      break;
    case 'pt':
      value = 'pt';
      break;
    case 'es':
      value = 'ar'; // Spanish mapped to Arabic
      break;
    case 'en':
    default:
      value = 'en';
      break;
  }

  // ✅ Use stable attribute (THIS FIXES EVERYTHING)
  const option = this.page.locator(
    `li[role="option"][data-value="${value}"]`
  );

  await option.waitFor({ state: 'visible', timeout: 10000 });
  await option.click();

  await this.page.waitForTimeout(1500);

  console.log(`✅ Language set to ${langCode}`);
}
}