const { expect } = require('@playwright/test');

function generateUniqueSMT(baseSMT) {
  const timestamp = Date.now();   // milliseconds unique value
  return `${baseSMT}-${timestamp}`;
}

function getCurrentDate() {
  const today = new Date();

  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();

  return `${day}-${month}-${year}`;
}

async function verifyButtonEnabled(locator) {
  await expect(locator).toBeEnabled();
}
async function clickElement(locator) {
  await locator.waitFor({ state: 'visible' });
  await locator.click();
}

module.exports = { generateUniqueSMT, getCurrentDate, verifyButtonEnabled, clickElement };