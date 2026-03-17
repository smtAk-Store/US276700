const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './src/tests',
  timeout: 80000,
  use: {
    baseURL: 'https://uni-sd-smt-dev.azurewebsites.net',
    headless: false,         // show browser
    launchOptions: {
      slowMo: 300           // 1000ms = 1 second between actions
    },
    video: 'on',           // or 'retain-on-failure' to save only failed tests
    trace: 'on',           // or 'on-first-retry', 'retain-on-failure'
    screenshot: 'on',      // optional, screenshot on failure
  }
});