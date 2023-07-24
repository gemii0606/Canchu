// __tests__/signup.test.js
const request = require('supertest');
const app = require('../app'); // 假設你的Express應用程序主文件名為app.js
const { User } = require('../utils/models/model');

describe('User API', () => {
  // 測試用戶註冊API
  it('should register a new user', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'testPassword',
    };

    // 在測試之前，確保該用戶不存在
    const existingUser = await User.findOne({ where: { email: userData.email } });
    expect(existingUser).toBeNull();

    // 發送POST請求到API端點
    const response = await request(app)
      .post('/api/users')
      .send(userData);

    // 確認回應狀態碼是否為200
    expect(response.status).toBe(200);

    // 確認回應內容是否包含access_token和user資訊
    expect(response.body.data).toHaveProperty('access_token');
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data.user.name).toBe(userData.name);
    expect(response.body.data.user.email).toBe(userData.email);
    expect(response.body.data.user.picture).toBeNull();

    // 確認用戶已成功創建
    const createdUser = await User.findOne({ where: { email: userData.email } });
    expect(createdUser).toBeTruthy();
  });

  // 可以編寫其他測試用例，測試不同的API端點或功能
});