
const { test } = require('@playwright/test');
const { UsersPage } = require('../pages/UsersPage');

// test('Admin can create user', async ({ page }) => {
//   const usersPage = new UsersPage(page);

//   await usersPage.navigate();

//   await usersPage.createUser(
//     'John Doe',
//     'john.doe@test.com',
//     'Store Operator'
//   );

//   await usersPage.searchUser('John Doe');
//   await usersPage.validateUserPresent('John Doe');
// });
