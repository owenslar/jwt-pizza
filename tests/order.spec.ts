import { test, expect } from 'playwright-test-coverage';
import { mockGetMenu, mockGetFranchises } from './helperMocks';

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