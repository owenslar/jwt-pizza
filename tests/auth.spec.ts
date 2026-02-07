import { test, expect } from 'playwright-test-coverage';
import { mockLogin, mockRegister, mockLogout } from './helperMocks';

test('reregister with same user', async ({ page }) => {
  await mockRegister(page, 'bob joe', 'bob@gmail.com', 'monkeypie');

  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('bob joe');
  await page.getByRole('textbox', { name: 'Email address' }).fill('bob@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('monkeypie');
  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.getByRole('link', { name: 'bj', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'bj', exact: true }).click();
  await expect(page.getByText('bob@gmail.com')).toBeVisible();
});

test('register', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const email = `bob${randomSuffix}@gmail.com`

  await mockRegister(page, 'bob joe', email, 'monkeypie');

  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('bob joe');
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('monkeypie');
  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.getByRole('link', { name: 'bj', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'bj', exact: true }).click();
  await expect(page.getByText(email)).toBeVisible();
});

test('login', async ({ page }) => {
  await mockLogin(page);

  await page.goto('http://localhost:5173/');

  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('bob@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('monkeypie');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'bj', exact: true }).click();
  await page.getByText('bob@gmail.com').click();
});

test('login as admin', async ({ page }) => {
  await mockLogin(page, 'a@jwt.com', 'admin', 'admin');

  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'bj', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
});

test('logout', async ({ page }) => {
  await mockLogin(page);
  await mockLogout(page);

  await page.goto('http://localhost:5173/');

  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('bob@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('monkeypie');
  await page.getByRole('button', { name: 'Login' }).click();
  
  await page.getByRole('link', { name: 'Logout' }).click();
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
});

test('view pages', async ({ page }) => {

  await page.goto('http://localhost:5173/');
  
  await page.getByRole('link', { name: 'About' }).click();
  await expect(page.getByText('The secret sauce')).toBeVisible();
  await page.getByRole('link', { name: 'History' }).click();
  await expect(page.getByText('Mama Rucci, my my')).toBeVisible();
});