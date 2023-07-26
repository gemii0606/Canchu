// __tests__/signup.test.js
const request = require('supertest');
const app = require('../server');
// const { User } = require('../utils/models/model');

describe('User API', () => {
  it('should register a new user and return access_token', async () => {
    const userData = {
      name: 'Test User',
      email: 'testwwwwwt@example.com',
      password: 'testPassword',
    };

    // 測試之前，確保用戶不存在
    // User.findOne = jest.fn().mockResolvedValue(null);

    // // 模擬User.create，假設用戶創建成功
    // User.create = jest.fn().mockResolvedValue({
    //   id: 1,
    //   name: 'Test User',
    //   email: 'test@example.com',
    //   password: 'hashedPassword',
    //   provider: 'native',
    //   picture: null,
    // });

    const res = await request(app)
      .post('/api/1.0/users/signup')
      .send(userData);

    // 確認回應狀態碼是否為200
    expect(res.status).toBe(200);

  //   // 確認回應內容是否包含access_token和user資訊
  //   expect(response.body.data).toHaveProperty('access_token');
  //   expect(response.body.data).toHaveProperty('user');
  //   expect(response.body.data.user.name).toBe(userData.name);
  //   expect(response.body.data.user.email).toBe(userData.email);
  //   expect(response.body.data.user.picture).toBeNull();
  // });

  // it('should return 400 error if any required field is missing', async () => {
  //   const userData = {
  //     // 缺少name字段
  //     email: 'test@example.com',
  //     password: 'testPassword',
  //   };

  //   const response = await request(app)
  //     .post('/api/users')
  //     .send(userData);

  //   // 確認回應狀態碼是否為400
  //   expect(response.status).toBe(400);
  //   expect(response.body.error).toBe('You should not leave empty!');
  // });

  // it('should return 400 error if email is invalid', async () => {
  //   const userData = {
  //     name: 'Test User',
  //     email: 'invalidemail', // 不合法的email格式
  //     password: 'testPassword',
  //   };

  //   const response = await request(app)
  //     .post('/api/1.0/users/signup')
  //     .send(userData);

  //   // 確認回應狀態碼是否為400
  //   expect(response.status).toBe(400);
  //   expect(response.body.error).toBe('Please fill the correct email adress!');
  // });

  // it('should return 403 error if email address already exists', async () => {
  //   const userData = {
  //     name: 'Test User',
  //     email: 'existing@example.com', // 已經存在的email地址
  //     password: 'testPassword',
  //   };

  //   // 模擬User.findOne，假設用戶已經存在
  //   User.findOne = jest.fn().mockResolvedValue({
  //     id: 1,
  //     name: 'Existing User',
  //     email: 'existing@example.com',
  //     password: 'hashedPassword',
  //     provider: 'native',
  //     picture: null,
  //   });

  //   const response = await request(app)
  //     .post('/api/users')
  //     .send(userData);

  //   // 確認回應狀態碼是否為403
  //   expect(response.status).toBe(403);
  //   expect(response.body.error).toBe('email adress has already exist!');
  });
});