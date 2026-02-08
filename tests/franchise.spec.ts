import { test, expect } from 'playwright-test-coverage';
import { 
  mockLogin, 
  mockGetFranchise,
  mockCreateStore,
  mockCloseStore
} from './helperMocks';

test('view franchise as diner with no franchise', async ({ page }) => {
  await mockLogin(page);

  await page.goto('http://localhost:5173/');
  
  // Login as diner
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('bob@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('monkeypie');
  await page.getByRole('button', { name: 'Login' }).click();
  
  // Navigate to franchise dashboard
  await page.getByRole('link', { name: 'Franchise' }).first().click();
  
  // Should see "So you want a piece of this" message for non-franchisees
  await expect(page.getByText('So you want a piece of the pie?')).toBeVisible();
  await expect(page.getByText('Unleash Your Potential')).toBeVisible();
});

test('view franchise as franchisee', async ({ page }) => {
  await mockLogin(page, 'f@jwt.com', 'franchisee', 'franchisee');
  await mockGetFranchise(page);

  await page.goto('http://localhost:5173/');
  
  // Login as franchisee
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('franchisee');
  await page.getByRole('button', { name: 'Login' }).click();
  
  // Navigate to franchise dashboard
  await page.getByRole('link', { name: 'Franchise' }).first().click();
  
  // Should see franchise name
  await expect(page.getByRole('heading', { name: 'pizzaPocket' })).toBeVisible();
  
  // Should see stores in table
  await expect(page.getByText('SLC')).toBeVisible();
  await expect(page.getByText('Provo')).toBeVisible();
  await expect(page.getByText('0.123 ₿')).toBeVisible();
  await expect(page.getByText('0.234 ₿')).toBeVisible();
});

test('create store as franchisee', async ({ page }) => {
  await mockLogin(page, 'f@jwt.com', 'franchisee', 'franchisee');
  await mockGetFranchise(page);
  await mockCreateStore(page);

  await page.goto('http://localhost:5173/');
  
  // Login as franchisee
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('franchisee');
  await page.getByRole('button', { name: 'Login' }).click();
  
  // Navigate to franchise dashboard
  await page.getByRole('link', { name: 'Franchise' }).first().click();
  
  // Click create store button
  await page.getByRole('button', { name: 'Create store' }).click();
  
  // Fill in store name
  await page.getByPlaceholder('store name').fill('Orem');
  
  // Submit
  await page.getByRole('button', { name: 'Create' }).click();
  
  // Should navigate back to franchise dashboard
  await expect(page.getByRole('heading', { name: 'pizzaPocket' })).toBeVisible();
});

test('close store as franchisee', async ({ page }) => {
  await mockLogin(page, 'f@jwt.com', 'franchisee', 'franchisee');
  await mockGetFranchise(page);
  await mockCloseStore(page);

  await page.goto('http://localhost:5173/');
  
  // Login as franchisee
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('franchisee');
  await page.getByRole('button', { name: 'Login' }).click();
  
  // Navigate to franchise dashboard
  await page.getByRole('link', { name: 'Franchise' }).first().click();
  
  // Click close button for first store
  await page.getByRole('button', { name: 'Close' }).first().click();
  
  // Should see confirmation page
  await expect(page.getByText('Are you sure you want to close')).toBeVisible();
  await expect(page.getByText('SLC')).toBeVisible();
  
  // Confirm close
  await page.getByRole('button', { name: 'Close' }).click();
  
  // Should navigate back to franchise dashboard
  await expect(page.getByRole('heading', { name: 'pizzaPocket' })).toBeVisible();
});