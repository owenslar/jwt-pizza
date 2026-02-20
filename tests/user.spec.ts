import { test, expect } from 'playwright-test-coverage';
import {
  mockRegister,
  mockLogin,
  mockUpdateUser,
  mockGetOrders,
  mockLogout,
  mockGetUser,
} from './helperMocks';

test('updateUser', async ({ page }) => {
  const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
  await mockGetUser(page);
  await mockRegister(page, 'pizza diner', email, 'diner');
  await mockUpdateUser(page);
  await mockGetOrders(page);
  await mockLogout(page);
  await mockLogin(page, email, 'diner', 'diner', 'pizza diner');

  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Register' }).click();

  await page.getByRole('link', { name: 'pd' }).click();

  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('h3')).toContainText('Edit user');
  await page.getByRole('textbox').first().fill('pizza dinerx');
  await page.getByRole('button', { name: 'Update' }).click();

  await page.waitForSelector('[role="dialog"]', { state: 'hidden' });

  await expect(page.getByRole('main')).toContainText('pizza dinerx');
});

test('updatePassword', async ({ page }) => {
  const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
  const oldPassword = 'oldPassword123';
  const newPassword = 'newPassword456';

  await mockGetUser(page);
  await mockRegister(page, 'pizza diner', email, oldPassword);
  await mockUpdateUser(page);
  await mockGetOrders(page);
  await mockLogout(page);
  await mockLogin(page, email, newPassword, 'diner', 'pizza diner');

  // Register a new user
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(oldPassword);
  await page.getByRole('button', { name: 'Register' }).click();

  // Go to user profile and edit
  await page.getByRole('link', { name: 'pd' }).click();
  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('h3')).toContainText('Edit user');

  // Change password - need to provide email so backend getUser() works
  const textboxes = await page.getByRole('textbox').all();
  await textboxes[0].fill('pizza diner'); // name
  await textboxes[1].fill(email); // email (required for backend)
  await textboxes[2].fill(newPassword); // password
  await page.getByRole('button', { name: 'Update' }).click();

  await page.waitForSelector('[role="dialog"]', { state: 'hidden' });

  // Logout
  await page.getByRole('link', { name: 'Logout' }).click();

  // Try to login with old password - should fail
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(oldPassword);
  await page.getByRole('button', { name: 'Login' }).click();

  // Verify we're still on login page (login failed)
  await expect(
    page.getByRole('heading', { name: 'Welcome back' }),
  ).toBeVisible();

  // Login with new password - should succeed
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(newPassword);
  await page.getByRole('button', { name: 'Login' }).click();

  // Verify we're logged in
  await expect(page.getByRole('link', { name: 'pd' })).toBeVisible();
});

test('updateEmail', async ({ page }) => {
  const oldEmail = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
  const newEmail = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
  const password = 'testPassword123';

  await mockGetUser(page);
  await mockRegister(page, 'pizza diner', oldEmail, password);
  await mockUpdateUser(page);
  await mockGetOrders(page);
  await mockLogout(page);
  await mockLogin(page, newEmail, password, 'diner', 'pizza diner');

  // Register a new user
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
  await page.getByRole('textbox', { name: 'Email address' }).fill(oldEmail);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Register' }).click();

  // Go to user profile and edit
  await page.getByRole('link', { name: 'pd' }).click();
  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('h3')).toContainText('Edit user');

  // Change email - need to provide password so backend getUser() works
  const textboxes = await page.getByRole('textbox').all();
  await textboxes[0].fill('pizza diner'); // name
  await textboxes[1].fill(newEmail); // email
  await textboxes[2].fill(password); // password (required for backend)
  await page.getByRole('button', { name: 'Update' }).click();

  await page.waitForSelector('[role="dialog"]', { state: 'hidden' });

  // Verify new email is displayed in profile
  await expect(page.getByRole('main')).toContainText(newEmail);

  // Logout
  await page.getByRole('link', { name: 'Logout' }).click();

  // Try to login with old email - should fail
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(oldEmail);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();

  // Verify we're still on login page (login failed)
  await expect(
    page.getByRole('heading', { name: 'Welcome back' }),
  ).toBeVisible();

  // Login with new email - should succeed
  await page.getByRole('textbox', { name: 'Email address' }).fill(newEmail);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();

  // Verify we're logged in
  await expect(page.getByRole('link', { name: 'pd' })).toBeVisible();
});

test('updateUserAsAdmin', async ({ page }) => {
  const email = `admin${Math.floor(Math.random() * 10000)}@jwt.com`;

  await mockGetUser(page);
  await mockLogin(page, 'a@jwt.com', 'admin', 'admin', 'Admin');
  await mockUpdateUser(page);
  await mockGetOrders(page);

  // Register and login as admin (assuming admin account exists)
  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();

  // Reset name to 'Admin' in case previous test run left it changed
  const profileLink = page.locator('a[href="/diner-dashboard"]');
  await profileLink.click();
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('textbox').first().fill('Admin');
  await page.getByRole('button', { name: 'Update' }).click();
  await page.waitForSelector('[role="dialog"]', { state: 'hidden' });

  // Go to admin profile
  await page.getByRole('link', { name: 'A', exact: true }).click();

  // Edit profile
  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('h3')).toContainText('Edit user');
  await page.getByRole('textbox').first().fill('Admin Updated');
  await page.getByRole('button', { name: 'Update' }).click();

  await page.waitForSelector('[role="dialog"]', { state: 'hidden' });

  // Verify the name changed
  await expect(page.getByRole('main')).toContainText('Admin Updated');

  // Revert the change
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('textbox').first().fill('Admin');
  await page.getByRole('button', { name: 'Update' }).click();

  await page.waitForSelector('[role="dialog"]', { state: 'hidden' });
});

test('updateUserAsFranchisee', async ({ page }) => {
  const email = `franchisee${Math.floor(Math.random() * 10000)}@jwt.com`;

  await mockGetUser(page);
  await mockLogin(
    page,
    'f@jwt.com',
    'franchisee',
    'franchisee',
    'pizza franchisee',
  );
  await mockUpdateUser(page);
  await mockGetOrders(page);

  // Login as franchisee (assuming franchisee account exists)
  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('franchisee');
  await page.getByRole('button', { name: 'Login' }).click();

  // Reset name to 'pizza franchisee' in case previous test run left it changed
  const profileLink = page.locator('a[href="/diner-dashboard"]');
  await profileLink.click();
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('textbox').first().fill('pizza franchisee');
  await page.getByRole('button', { name: 'Update' }).click();
  await page.waitForSelector('[role="dialog"]', { state: 'hidden' });

  // Go to franchisee profile
  await page.getByRole('link', { name: 'pf', exact: true }).click();

  // Edit profile
  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('h3')).toContainText('Edit user');
  await page.getByRole('textbox').first().fill('Franchisee Updated');
  await page.getByRole('button', { name: 'Update' }).click();

  await page.waitForSelector('[role="dialog"]', { state: 'hidden' });

  // Verify the name changed
  await expect(page.getByRole('main')).toContainText('Franchisee Updated');

  // Revert the change
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('textbox').first().fill('Franchisee');
  await page.getByRole('button', { name: 'Update' }).click();

  await page.waitForSelector('[role="dialog"]', { state: 'hidden' });
});

test('listUsersAsAdmin', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();

  await page.getByRole('columnheader', { name: 'Name', exact: true }).click();
  await expect(
    page.getByRole('textbox', { name: 'Filter users' }),
  ).toBeVisible();

  await expect(page.getByRole('cell', { name: 'Admin' }).first()).toBeVisible();

  await expect(
    page.getByRole('cell', { name: 'a@jwt.com' }).first(),
  ).toBeVisible();
});

test('filterUsersAsAdmin', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();

  await page.getByRole('textbox', { name: 'Filter users' }).fill('Admin');
  await page.getByRole('button', { name: 'Submit' }).first().click();

  await expect(
    page.getByRole('cell', { name: 'Admin', exact: true }),
  ).toBeVisible();
});
