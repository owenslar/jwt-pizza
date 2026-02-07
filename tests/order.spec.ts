import { test, expect } from 'playwright-test-coverage';
import type { Page } from '@playwright/test';

async function mockGetMenu(page: Page) {
  await page.route('*/**/api/order/menu', async (route) => {
    if (route.request().method() === 'GET') {
      const menuRes = [
        { id: 1, title: 'Veggie', image: 'pizza1.png', price: 0.0038, description: 'A garden of delight' },
        { id: 2, title: 'Pepperoni', image: 'pizza2.png', price: 0.0042, description: 'Spicy treat' },
        { id: 3, title: 'Margarita', image: 'pizza3.png', price: 0.0035, description: 'Essential classic' },
      ];
      await route.fulfill({ json: menuRes });
    } else {
      await route.fallback();
    }
  });
}

async function mockGetFranchises(page: Page) {
  await page.route('*/**/api/franchise*', async (route) => {
    if (route.request().method() === 'GET') {
      const franchisesRes = {
        franchises: [
          {
            id: 1,
            name: 'pizzaPocket',
            stores: [
              { id: 1, name: 'SLC', totalRevenue: 0.123 },
              { id: 2, name: 'Provo', totalRevenue: 0.234 },
            ],
          },
          {
            id: 2,
            name: 'LotaPizza',
            stores: [{ id: 3, name: 'Spanish Fork', totalRevenue: 0.056 }],
          },
        ],
      };
      await route.fulfill({ json: franchisesRes });
    } else {
      await route.fallback();
    }
  });
}

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