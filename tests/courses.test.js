const { authHeader } = require('./helpers');

jest.mock('../src/db/pool', () => ({ query: jest.fn(), pool: { connect: jest.fn(), on: jest.fn() } }));

const request = require('supertest');
const db = require('../src/db/pool');
const { createApp } = require('../src/app');

const app = createApp();

afterEach(() => db.query.mockReset());

describe('GET /api/courses', () => {
  it('needs a signed-in user', async () => {
    expect((await request(app).get('/api/courses')).status).toBe(401);
  });

  it('lists the course catalogue', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 1, code: 'CS101', title: 'Programming Fundamentals', department: 'CS', credits: 4 }] });
    const res = await request(app).get('/api/courses').set('Authorization', authHeader('student'));
    expect(res.status).toBe(200);
    expect(res.body[0].code).toBe('CS101');
  });
});

describe('POST /api/courses', () => {
  it('is admin-only', async () => {
    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', authHeader('teacher'))
      .send({ code: 'CS999', title: 'Anything', department: 'CS', credits: 3 });
    expect(res.status).toBe(403);
  });

  it('validates the course code', async () => {
    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', authHeader('admin'))
      .send({ code: 'not a code', title: 'Anything', department: 'CS', credits: 3 });
    expect(res.status).toBe(400);
  });
});
