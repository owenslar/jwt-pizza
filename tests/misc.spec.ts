import { test, expect } from 'playwright-test-coverage';
import { mockGetDocs } from './helperMocks';

test('view pages', async ({ page }) => {

  await page.goto('http://localhost:5173/');
  
  await page.getByRole('link', { name: 'About' }).click();
  await expect(page.getByText('The secret sauce')).toBeVisible();
  await page.getByRole('link', { name: 'History' }).click();
  await expect(page.getByText('Mama Rucci, my my')).toBeVisible();
});

test('view API documentation', async ({ page }) => {
  await mockGetDocs(page);

  await page.goto('http://localhost:5173/docs/service');
  
  // Should see the docs page heading
  await expect(page.getByRole('heading', { name: 'JWT Pizza API' })).toBeVisible();
  
  // Should see endpoint documentation
  await expect(page.getByText('[GET] /api/order/menu')).toBeVisible();
  await expect(page.getByText('Retrieve the list of available pizzas')).toBeVisible();
  
  await expect(page.getByText('[POST] /api/order')).toBeVisible();
  await expect(page.getByText('Create a new order')).toBeVisible();
  
  // Should see authentication indicator for protected routes
  await expect(page.getByText('🔐')).toBeVisible();
  
  // Should see example requests
  await expect(page.getByText('Example request').first()).toBeVisible();
  await expect(page.getByText(/curl.*\/api\/order\/menu/)).toBeVisible();
  
  // Should see response examples
  await expect(page.getByText('Response', { exact: true }).first()).toBeVisible();
});
