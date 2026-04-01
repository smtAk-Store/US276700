
import users from '../testdata/InputData/users.json';

export class LoginPage {

 
 
  constructor(page) {
    this.page = page;

    this.loginButton = page.getByRole('button', { name: /login/i });
    this.proceedLogin = page.getByRole('button', { name: /proceed to login/i });
    this.emailField = page.getByRole('textbox', { name: 'Email Address' });
    this.passwordField = page.getByRole('textbox', { name: 'Password' });
    this.signInButton = page.getByRole('button', { name: /sign in/i });
    this.englishLanguageButton = page.getByRole('button', { name: /english/i });
    this.frenchLanguageButton = page.getByRole('button', { name: /french/i });
    this.spanishLanguageButton = page.getByRole('button', { name: /spanish/i });
    this.portugueseLanguageButton = page.getByRole('button', { name: /portuguese/i });
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

  async loginAs(role,language) {
    const user = users.users[role];

    await this.openApplication();
    await this.selectLanguage(language);
    await this.login(user.email, user.password);
  }

 async selectLanguage(language) {
  const langCode = language.toLowerCase();

  console.log(`🌐 Selecting language: ${langCode}`);

  await this.page.waitForLoadState('domcontentloaded');

  // 1. Click the language dropdown to open it (the one showing "English")
  const languageDropdown = this.page.locator('button:has-text("English"), [role="button"]:has-text("English")')
    .or(this.page.getByRole('button').filter({ hasText: /English|Français|Español|Português/i }));

  await languageDropdown.waitFor({ state: 'visible', timeout: 15000 });
  await languageDropdown.click({ force: true });

  // Small wait for the menu to open
  await this.page.waitForTimeout(800);

  // 2. Now click the desired language option from the opened menu
  let optionLocator;

  switch (langCode) {
    case 'fr':
    case 'french':
      optionLocator = this.page.getByRole('option', { name: /french|français/i });
      break;
    case 'es':
    case 'spanish':
      optionLocator = this.page.getByRole('option', { name: /spanish|español/i });
      break;
    case 'pt':
    case 'portuguese':
      optionLocator = this.page.getByRole('option', { name: /portuguese|português/i });
      break;
    case 'en':
    case 'english':
    default:
      optionLocator = this.page.getByRole('option', { name: /english/i });
      break;
  }

  await optionLocator.waitFor({ state: 'visible', timeout: 10000 });
  await optionLocator.click();

  // Wait a bit for language to apply (if it changes UI text)
  await this.page.waitForTimeout(1500);

  console.log(`✅ Language set to ${langCode}`);
}
}