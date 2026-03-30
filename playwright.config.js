const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './src/tests',
  timeout: 180000,
  use: {
    baseURL: 'https://uni-sd-smt-dev.azurewebsites.net',
    headless: false,
    launchOptions: {
      slowMo: 500
    },
    video: 'on',
    trace: 'on',
    screenshot: 'on',
  },


  reporter: [
    ['html'],                   
    ['list']                     
  ],

   open: 'on-failure',       
   open: 'always',            
   open: 'never'            
});