
const { TableComponent } = require('../components/TableComponent');
const { FormComponent } = require('../components/FormComponent');
const { FilterComponent } = require('../components/FilterComponent');

class UsersPage {
  constructor(page) {
    this.page = page;
    this.table = new TableComponent(page);
    this.form = new FormComponent(page);
    this.filter = new FilterComponent(page);
  }

  async navigate() {
    await this.page.goto('/users');
  }

  async createUser(name, email, role) {
    await this.page.getByRole('button', { name: 'Add User' }).click();
    await this.form.fillInputByLabel('Name', name);
    await this.form.fillInputByLabel('Email', email);
    await this.form.selectDropdownByLabel('Role', role);
    await this.form.submit();
  }

  async searchUser(name) {
    await this.filter.setTextFilter('Name', name);
    await this.filter.applyFilter();
  }

  async validateUserPresent(name) {
    await this.table.isRowPresent(name);
  }
}

module.exports = { UsersPage };
