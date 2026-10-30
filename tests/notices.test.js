const { authHeader } = require('./helpers');

jest.mock('../src/db/pool', () => ({ query: jest.fn(), pool: { connect: jest.fn(), on: jest.fn() } }));

const request = require('supertest');
const db = require('../src/db/pool');
const { createApp } = require('../src/app');

const app = createApp();

afterEach(() => db.query.mockReset());

describe('GET /api/notices', () => {
  it('only asks for the audiences a student may see', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    await request(app).get('/api/notices').set('Authorization', authHeader('student'));
    expect(db.query.mock.calls[0][1]).toEqual([['all', 'students']]);
  });
});

describe('POST /api/notices', () => {
  it('is not open to students', async () => {
    const res = await request(app)
      .post('/api/notices')
      .set('Authorization', authHeader('student'))
      .send({ title: 'Free food', body: 'In the canteen' });
    expect(res.status).toBe(403);
  });
});
