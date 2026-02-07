import { test, expect } from 'playwright-test-coverage';
import { mockGetMenu, mockGetFranchises, mockLogin, mockGetUser, mockCreateOrder } from './helperMocks';

test('view menu as guest', async ({ page }) => {
  await mockGetMenu(page);
  await mockGetFranchises(page);

  await page.goto('http://localhost:5173/');
  
  // Navigate to menu
  await page.getByRole('link', { name: 'Order' }).click();
  
  // Verify menu items are visible
  await expect(page.getByText('Veggie')).toBeVisible();
  await expect(page.getByText('Pepperoni')).toBeVisible();
  await expect(page.getByText('Margarita')).toBeVisible();
});

test('order pizza flow', async ({ page }) => {
  await mockLogin(page);
  await mockGetUser(page);
  await mockGetMenu(page);
  await mockGetFranchises(page);
  await mockCreateOrder(page);

  await page.goto('http://localhost:5173/');
  
  // Login first
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('bob@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('monkeypie');
  await page.getByRole('button', { name: 'Login' }).click();
  
  // Navigate to menu
  await page.getByRole('link', { name: 'Order' }).click();
  
  // Select a store
  await page.locator('select').selectOption({ index: 1 });
  
  // Add pizzas to order
  await page.getByRole('button', { name: 'Veggie' }).click();
  await page.getByRole('button', { name: 'Pepperoni' }).click();
  
  // Go to checkout
  await page.getByRole('button', { name: 'Checkout' }).click();
  
  // Verify we're on payment page
  await expect(page.getByText('Send me those 2 pizzas right now!')).toBeVisible();
  
  // Complete payment
  await page.getByRole('button', { name: 'Pay now' }).click();
  
  // Verify we're on delivery page
  await expect(page.getByText('Here is your JWT Pizza!')).toBeVisible();
});