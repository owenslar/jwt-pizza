import { sleep, check, fail } from 'k6';
import http from 'k6/http';
import jsonpath from 'https://jslib.k6.io/jsonpath/1.0.2/index.js';

export const options = {
  cloud: {
    distribution: {
      'amazon:us:ashburn': { loadZone: 'amazon:us:ashburn', percent: 100 },
    },
    apm: [],
  },
  thresholds: {},
  scenarios: {
    Login_and_Purchase: {
      executor: 'ramping-vus',
      gracefulStop: '30s',
      stages: [
        { target: 20, duration: '1m' },
        { target: 30, duration: '2m' },
        { target: 10, duration: '40s' },
        { target: 0, duration: '10s' },
      ],
      gracefulRampDown: '30s',
      exec: 'login_and_Purchase',
    },
  },
};

export function login_and_Purchase() {
  let response;

  const vars = {};

  // Login
  response = http.put(
    'https://pizza-service.owenlarson.click/api/auth',
    '{"email":"d@jwt.com","password":"diner"}',
    {
      headers: {
        'sec-ch-ua-platform': '"Android"',
        'sec-ch-ua':
          '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
        'Content-Type': 'application/json',
        'sec-ch-ua-mobile': '?1',
      },
    },
  );
  if (
    !check(response, {
      'status equals 200': (response) => response.status.toString() === '200',
    })
  ) {
    console.log(response.body);
    fail('Login as *not* 200');
  } else {
    console.log('user login succeded');
  }

  vars['token'] = jsonpath.query(response.json(), '$.token')[0];

  sleep(3);

  // Get Menu
  response = http.get('https://pizza-service.owenlarson.click/api/order/menu', {
    headers: {
      'sec-ch-ua-platform': '"Android"',
      Authorization: `Bearer ${vars['token']}`,
      'sec-ch-ua':
        '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
      'Content-Type': 'application/json',
      'sec-ch-ua-mobile': '?1',
    },
  });

  // Get Franchise
  response = http.get(
    'https://pizza-service.owenlarson.click/api/franchise?page=0&limit=20&name=*',
    {
      headers: {
        'sec-ch-ua-platform': '"Android"',
        Authorization: `Bearer ${vars['token']}`,
        'sec-ch-ua':
          '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
        'Content-Type': 'application/json',
        'sec-ch-ua-mobile': '?1',
      },
    },
  );
  sleep(1);

  // Get user
  response = http.get('https://pizza-service.owenlarson.click/api/user/me', {
    headers: {
      'sec-ch-ua-platform': '"Android"',
      Authorization: `Bearer ${vars['token']}`,
      'sec-ch-ua':
        '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
      'Content-Type': 'application/json',
      'sec-ch-ua-mobile': '?1',
    },
  });
  sleep(2);

  // Buy Pizzas
  response = http.post(
    'https://pizza-service.owenlarson.click/api/order',
    '{"items":[{"menuId":1,"description":"Veggie","price":0.0038},{"menuId":2,"description":"Pepperoni","price":0.0042},{"menuId":4,"description":"Crusty","price":0.0028},{"menuId":4,"description":"Crusty","price":0.0028}],"storeId":"1","franchiseId":1}',
    {
      headers: {
        'sec-ch-ua-platform': '"Android"',
        Authorization: `Bearer ${vars['token']}`,
        'sec-ch-ua':
          '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
        'Content-Type': 'application/json',
        'sec-ch-ua-mobile': '?1',
      },
    },
  );
  if (!check(response, { 'purchase status is 200': (r) => r.status === 200 })) {
    console.log(response.body);
    fail('Purchase failed');
  } else {
    console.log('purchase succeeded');
  }

  vars['orderJwt'] = jsonpath.query(response.json(), '$.jwt')[0];

  sleep(1);

  // Verify Pizza
  response = http.post(
    'https://pizza-factory.cs329.click/api/order/verify',
    JSON.stringify({
      jwt: vars['orderJwt'],
    }),
    {
      headers: {
        'sec-ch-ua-platform': '"Android"',
        Authorization: `Bearer ${vars['token']}`,
        'sec-ch-ua':
          '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
        'Content-Type': 'application/json',
        'sec-ch-ua-mobile': '?1',
      },
    },
  );

  if (!check(response, { 'verify status is 200': (r) => r.status === 200 })) {
    console.log(response.body);
    fail('Verification failed');
  } else {
    console.log('Verification succeeded');
  }
  sleep(2);
}
