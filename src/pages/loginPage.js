
import users from '../testdata/InputData/users.json';

export class LoginPage {

 
 
  constructor(page) {
    this.page = page;

    this.loginButton = page.getByRole('button', { name: /login/i });
    this.proceedLogin = page.getByRole('button', { name: /proceed to login/i });
    this.emailField = page.getByRole('textbox', { name: 'Email Address' });
    this.passwordField = page.getByRole('textbox', { name: 'Password' });
    this.signInButton = page.getByRole('button', { name: /sign in/i });
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

  async loginAs(role) {
    const user = users.users[role];

    await this.openApplication();
    await this.login(user.email, user.password);
  }
}