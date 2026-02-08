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

test('view 404 not found page', async ({ page }) => {
  await page.goto('http://localhost:5173/this-page-does-not-exist');
  
  // Should see not found page
  await expect(page.getByRole('heading', { name: 'Oops' })).toBeVisible();
  await expect(page.getByText('It looks like we have dropped a pizza on the floor')).toBeVisible();
});

test('order now button works on home page', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  
  // Click order now button
  await page.getByRole('button', { name: 'Order now' }).click();
  
  // Should navigate to menu page
  await expect(page.getByText('Awesome is a click away')).toBeVisible();
});
