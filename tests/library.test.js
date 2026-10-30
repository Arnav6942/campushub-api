const { authHeader } = require('./helpers');

jest.mock('../src/db/pool', () => ({ query: jest.fn(), pool: { connect: jest.fn(), on: jest.fn() } }));

const request = require('supertest');
const db = require('../src/db/pool');
const { createApp } = require('../src/app');
const { calculateFine, FINE_PER_DAY } = require('../src/modules/library/library.service');

const app = createApp();

afterEach(() => db.query.mockReset());

describe('calculateFine', () => {
  it('is zero when the book comes back on time', () => {
    expect(calculateFine('2026-10-10', new Date('2026-10-10T10:00:00Z'))).toBe(0);
  });

  it('charges for every full late day', () => {
    expect(calculateFine('2026-10-10', new Date('2026-10-13T12:00:00Z'))).toBe(3 * FINE_PER_DAY);
  });
});

describe('GET /api/library/books', () => {
  it('lists books for any signed-in user', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 1, title: 'Clean Code', copies_available: 2 }] });
    const res = await request(app).get('/api/library/books').set('Authorization', authHeader('student'));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe('POST /api/library/loans', () => {
  it('cannot be used by students to issue books to themselves', async () => {
    const res = await request(app)
      .post('/api/library/loans')
      .set('Authorization', authHeader('student'))
      .send({ bookId: 1, studentId: 5 });
    expect(res.status).toBe(403);
  });
});
