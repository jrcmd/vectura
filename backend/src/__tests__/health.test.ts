import request from 'supertest';
import { createServer } from '../server';

describe('GET /api/health', () => {
  it('should return { ok: true }', async () => {
    const app = createServer();

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
