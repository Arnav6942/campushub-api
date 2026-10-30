const { authHeader } = require('./helpers');

jest.mock('../src/db/pool', () => ({ query: jest.fn(), pool: { connect: jest.fn(), on: jest.fn() } }));

const request = require('supertest');
const db = require('../src/db/pool');
const { createApp } = require('../src/app');

const app = createApp();

afterEach(() => db.query.mockReset());

describe('GET /api/students/:id', () => {
  it('lets a student read their own record', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 5 }] }) // the signed-in student's record
      .mockResolvedValueOnce({ rows: [{ id: 5, name: 'Asha', phone: '98200 00000' }] });

    const res = await request(app).get('/api/students/5').set('Authorization', authHeader('student', 11));

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Asha');
  });

  it("stops a student from reading someone else's record", async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 5 }] });

    const res = await request(app).get('/api/students/9').set('Authorization', authHeader('student', 11));

    expect(res.status).toBe(403);
    expect(db.query).toHaveBeenCalledTimes(1); // the other student's data was never loaded
  });

  it('lets a teacher read any record', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 9, name: 'Ravi' }] });
    const res = await request(app).get('/api/students/9').set('Authorization', authHeader('teacher', 2));
    expect(res.status).toBe(200);
  });
});

describe('GET /api/students', () => {
  it('is only for staff', async () => {
    const res = await request(app).get('/api/students').set('Authorization', authHeader('student', 11));
    expect(res.status).toBe(403);
  });
});
