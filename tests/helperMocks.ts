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

export async function mockGetUser(page: Page) {
  await page.route('*/**/api/user/me', async (route) => {
    if (route.request().method() === 'GET') {
      const userRes = {
        id: 3,
        name: 'bob joe',
        email: 'bob@gmail.com',
        roles: [{ role: 'diner' }],
      };
      await route.fulfill({ json: userRes });
    } else {
      await route.fallback();
    }
  });
}

export async function mockCreateOrder(page: Page) {
  await page.route('*/**/api/order', async (route) => {
    if (route.request().method() === 'POST') {
      const orderReq = route.request().postDataJSON();
      const orderRes = {
        order: {
          id: 1,
          franchiseId: orderReq.franchiseId,
          storeId: orderReq.storeId,
          date: '2024-06-05T05:14:40.000Z',
          items: orderReq.items,
        },
        jwt: 'eyJpYXQ',
      };
      expect(await route.request().headerValue('authorization')).toBe('Bearer abcdef');
      await route.fulfill({ json: orderRes });
    } else {
      await route.fallback();
    }
  });
}

export async function mockVerifyOrder(page: Page) {
  await page.route('*/**/api/order/verify', async (route) => {
    if (route.request().method() === 'POST') {
      const verifyRes = {
        message: 'valid',
        payload: {
          vendor: {
            id: 'jwt-pizza',
            name: 'JWT Pizza',
          },
          diner: {
            id: 3,
            name: 'bob joe',
            email: 'bob@gmail.com',
          },
          order: {
            items: [
              { description: 'Veggie', price: 0.0038 },
              { description: 'Pepperoni', price: 0.0042 },
            ],
            storeId: '1',
            franchiseId: 1,
            id: 1,
          },
        },
      };
      await route.fulfill({ json: verifyRes });
    } else {
      await route.fallback();
    }
  });
}

export async function mockGetOrders(page: Page) {
  await page.route('*/**/api/order', async (route) => {
    if (route.request().method() === 'GET') {
      const ordersRes = {
        dinerId: 3,
        orders: [
          {
            id: 1,
            franchiseId: 1,
            storeId: 1,
            date: '2024-06-05T05:14:40.000Z',
            items: [
              { id: 1, menuId: 1, description: 'Veggie', price: 0.0038 },
              { id: 2, menuId: 2, description: 'Pepperoni', price: 0.0042 },
            ],
          },
        ],
        page: 1,
      };
      expect(await route.request().headerValue('authorization')).toBe('Bearer abcdef');
      await route.fulfill({ json: ordersRes });
    } else {
      await route.fallback();
    }
  });
}

export async function mockGetFranchise(page: Page, userId: number = 3) {
  await page.route(`*/**/api/franchise/${userId}`, async (route) => {
    if (route.request().method() === 'GET') {
      const franchiseRes = [
        {
          id: 1,
          name: 'pizzaPocket',
          admins: [{ id: 3, name: 'bob joe', email: 'bob@gmail.com' }],
          stores: [
            { id: 1, name: 'SLC', totalRevenue: 0.123 },
            { id: 2, name: 'Provo', totalRevenue: 0.234 },
          ],
        },
      ];
      expect(await route.request().headerValue('authorization')).toBe('Bearer abcdef');
      await route.fulfill({ json: franchiseRes });
    } else {
      await route.fallback();
    }
  });
}

export async function mockCreateStore(page: Page) {
  await page.route('*/**/api/franchise/*/store', async (route) => {
    if (route.request().method() === 'POST') {
      const storeReq = route.request().postDataJSON();
      const storeRes = {
        id: 200,
        name: storeReq.name,
        totalRevenue: 0,
      };
      expect(await route.request().headerValue('authorization')).toBe('Bearer abcdef');
      await route.fulfill({ json: storeRes });
    } else {
      await route.fallback();
    }
  });
}

export async function mockCloseStore(page: Page) {
  await page.route('*/**/api/franchise/*/store/*', async (route) => {
    if (route.request().method() === 'DELETE') {
      expect(await route.request().headerValue('authorization')).toBe('Bearer abcdef');
      await route.fulfill({ json: { message: 'store closed' } });
    } else {
      await route.fallback();
    }
  });
}

export async function mockGetAllFranchises(page: Page) {
  await page.route('*/**/api/franchise?*', async (route) => {
    if (route.request().method() === 'GET') {
      const franchisesRes = {
        franchises: [
          {
            id: 1,
            name: 'pizzaPocket',
            admins: [{ id: 3, name: 'pizza franchisee', email: 'f@jwt.com' }],
            stores: [
              { id: 1, name: 'SLC', totalRevenue: 0.123 },
              { id: 2, name: 'Provo', totalRevenue: 0.234 },
            ],
          },
          {
            id: 2,
            name: 'LotaPizza',
            admins: [{ id: 4, name: 'lot franchisee', email: 'lot@jwt.com' }],
            stores: [{ id: 3, name: 'Spanish Fork', totalRevenue: 0.056 }],
          },
        ],
        more: false,
      };
      expect(await route.request().headerValue('authorization')).toBe('Bearer abcdef');
      await route.fulfill({ json: franchisesRes });
    } else {
      await route.fallback();
    }
  });
}

export async function mockCreateFranchise(page: Page) {
  await page.route('*/**/api/franchise', async (route) => {
    if (route.request().method() === 'POST') {
      const franchiseReq = route.request().postDataJSON();
      const franchiseRes = {
        id: 100,
        name: franchiseReq.name,
        admins: franchiseReq.admins,
        stores: [],
      };
      expect(await route.request().headerValue('authorization')).toBe('Bearer abcdef');
      await route.fulfill({ json: franchiseRes });
    } else {
      await route.fallback();
    }
  });
}

export async function mockCloseFranchise(page: Page) {
  await page.route('*/**/api/franchise/*', async (route) => {
    if (route.request().method() === 'DELETE' && !route.request().url().includes('/store')) {
      expect(await route.request().headerValue('authorization')).toBe('Bearer abcdef');
      await route.fulfill({ json: { message: 'franchise closed' } });
    } else {
      await route.fallback();
    }
  });
}

export async function mockGetDocs(page: Page, docType: string = 'service') {
  await page.route('*/**/api/docs', async (route) => {
    if (route.request().method() === 'GET') {
      const docsRes = {
        version: '20220504',
        endpoints: [
          {
            method: 'GET',
            path: '/api/order/menu',
            description: 'Retrieve the list of available pizzas',
            example: 'curl localhost:3000/api/order/menu',
            response: [
              { id: 1, title: 'Veggie', image: 'pizza1.png', price: 0.0038, description: 'A garden of delight' },
            ],
            requiresAuth: false,
          },
          {
            method: 'POST',
            path: '/api/order',
            description: 'Create a new order',
            example: 'curl -X POST localhost:3000/api/order',
            response: { order: { id: 1 }, jwt: 'eyJhbGciOiJS...' },
            requiresAuth: true,
          },
        ],
      };
      await route.fulfill({ json: docsRes });
    } else {
      await route.fallback();
    }
  });
}