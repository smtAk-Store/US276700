
const { BaseComponent } = require('./BaseComponent');

class FilterComponent extends BaseComponent {

  async setTextFilter(label, value) {
    await this.page.getByLabel(label).fill(value);
  }

  async applyFilter() {
    await this.page.getByRole('button', { name: /apply/i }).click();
  }
}

module.exports = { FilterComponent };
