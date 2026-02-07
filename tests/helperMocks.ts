import { expect } from 'playwright-test-coverage';
import type { Page } from '@playwright/test';

export async function mockLogin(page: Page, email = 'bob@gmail.com', password = 'monkeypie', role = 'diner') {
  await page.route('*/**/api/auth', async (route) => {
    if (route.request().method() === 'PUT') {
      const loginReq = { email, password };
      const loginRes = {
        user: {
          id: 3,
          name: 'bob joe',
          email,
          roles: [{ role }],
        },
        token: 'abcdef',
      };
      expect(route.request().postDataJSON()).toMatchObject(loginReq);
      await route.fulfill({ json: loginRes });
    } else {
      await route.fallback();
    }
  });
}

export async function mockRegister(page: Page, name = 'bob joe', email = 'bob@gmail.com', password = 'monkeypie', role = 'diner') {
  await page.route('*/**/api/auth', async (route) => {
    if (route.request().method() === 'POST') {
      const loginReq = { name, email, password };
      const loginRes = {
        user: {
          id: 3,
          name: name,
          email: email,
          roles: [{ role }],
        },
        token: 'abcdef',
      };
      expect(route.request().postDataJSON()).toMatchObject(loginReq);
      await route.fulfill({ json: loginRes });
    } else {
      await route.fallback();
    }
  });
}

export async function mockLogout(page: Page) {
  await page.route('*/**/api/auth', async (route) => {
    if (route.request().method() === 'DELETE') {
      const loginRes = {
        message: "logout successful",
      };
      expect(await route.request().headerValue('authorization')).toBe('Bearer abcdef');
      await route.fulfill({ json: loginRes });
    } else {
      await route.fallback();
    }
  });
}

export async function mockGetMenu(page: Page) {
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

export async function mockGetFranchises(page: Page) {
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