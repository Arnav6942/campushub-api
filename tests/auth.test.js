const { authHeader } = require('./helpers');

jest.mock('../src/db/pool', () => ({ query: jest.fn(), pool: { connect: jest.fn(), on: jest.fn() } }));

const request = require('supertest');
const db = require('../src/db/pool');
const { createApp } = require('../src/app');
const { hashPassword } = require('../src/utils/passwords');

const app = createApp();

afterEach(() => db.query.mockReset());

describe('POST /api/auth/login', () => {
  it('signs in with the right password', async () => {
    const hash = await hashPassword('correct horse battery staple');
    db.query.mockResolvedValueOnce({ rows: [{ id: 7, name: 'Asha', email: 'asha@college.edu', role: 'student', password_hash: hash }] });

    const res = await request(app).post('/api/auth/login').send({ email: 'asha@college.edu', password: 'correct horse battery staple' });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toEqual({ id: 7, name: 'Asha', email: 'asha@college.edu', role: 'student' });
  });

  it('gives the same answer for a wrong password and an unknown email', async () => {
    const hash = await hashPassword('correct horse battery staple');
    db.query.mockResolvedValueOnce({ rows: [{ id: 7, name: 'Asha', email: 'asha@college.edu', role: 'student', password_hash: hash }] });
    const wrong = await request(app).post('/api/auth/login').send({ email: 'asha@college.edu', password: 'not the right one' });

    db.query.mockResolvedValueOnce({ rows: [] });
    const unknown = await request(app).post('/api/auth/login').send({ email: 'nobody@college.edu', password: 'whatever it is' });

    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.body.error).toBe(unknown.body.error);
  });

  it('rejects a request without an email', async () => {
    const res = await request(app).post('/api/auth/login').send({ password: 'something long' });
    expect(res.status).toBe(400);
    expect(res.body.details).toContain('email is required');
  });
});

describe('POST /api/auth/register', () => {
  it('always creates a student account', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] }) // no existing user
      .mockResolvedValueOnce({ rows: [{ id: 9, name: 'Ravi', email: 'ravi@college.edu', role: 'student' }] });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ravi', email: 'ravi@college.edu', password: 'a long enough passphrase', role: 'admin' });

    expect(res.status).toBe(201);
    expect(res.body.role).toBe('student');
    expect(db.query.mock.calls[1][0]).toContain("'student'");
  });
});

describe('GET /api/auth/me', () => {
  it('needs a token', async () => {
    expect((await request(app).get('/api/auth/me')).status).toBe(401);
  });

  it('returns the profile for a valid token', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 3, name: 'Meera', email: 'meera@college.edu', role: 'teacher' }] });
    const res = await request(app).get('/api/auth/me').set('Authorization', authHeader('teacher', 3));
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Meera');
  });
});
