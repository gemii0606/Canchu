const { Sequelize, DataTypes } = require('sequelize');
const User = require('../utils/models/model'); // 假設 User 模型定義在 User.js 中
const {signUpUser} = require('../controller/users_controller'); // 假設 signUpUser 函式定義在 signUpUser.js 中

// 使用 Sequelize 的 Mock 驅動程式來模擬資料庫連接
const sequelizeMock = new Sequelize('sqlite::memory:', { logging: false });
jest.spyOn(sequelizeMock, 'query').mockImplementation((query) => {
  // 在這裡寫你的偽造資料庫查詢邏輯
  if (query.includes('SELECT * FROM "users" WHERE "email" = ?')) {
    return null;
  } else if (query.includes('INSERT INTO "users"')) {
    return [{ id: 1, name: 'John', email: 'john@example.com', password: 'hashed_password', provider: 'native', picture: null }];
  }
});

describe('signUpUser', () => {
  test('should create a new user and return access token and user data', async () => {
    const req = {
      body: {
        name: 'John',
        email: 'john@example.com',
        password: 'password',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await signUpUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: {
        access_token: expect.any(String),
        user: {
          id: 1,
          provider: 'native',
          name: 'John',
          email: 'john@example.com',
          picture: null,
        },
      },
    });
  });

  test('should return 400 if required fields are missing', async () => {
    const req = {
      body: {},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await signUpUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'You should not leave empty!' });
  });

  test('should return 400 if email is not valid', async () => {
    const req = {
      body: {
        name: 'John',
        email: 'invalid_email',
        password: 'password',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await signUpUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Please fill the correct email adress!' });
  });

  test('should return 403 if email address already exists', async () => {
    const req = {
      body: {
        name: 'John',
        email: 'john@example.com',
        password: 'password',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // 使用 Sequelize 的 Mock 驅動程式來模擬資料庫中已存在的使用者
    jest.spyOn(sequelizeMock, 'query').mockImplementation((query) => {
      if (query.includes('SELECT * FROM "users" WHERE "email" = ?')) {
        return [{ id: 1, name: 'Existing User', email: 'john@example.com' }];
      } else {
        return null;
      }
    });

    await signUpUser(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'email adress has already exist!' });
  });
});