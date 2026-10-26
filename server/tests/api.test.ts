import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.ts';
import { initDatabase, deleteAllScans } from '../services/db.service.ts';

const app = createApp();

describe('PhishGuard REST API Endpoints', () => {
  beforeAll(async () => {
    await initDatabase();
    await deleteAllScans();
  });

  afterAll(async () => {
    await deleteAllScans();
  });

  it('GET /api/health returns healthy application status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.app).toBe('PhishGuard');
    expect(res.body.database).toBeDefined();
  });

  it('POST /api/scans rejects invalid or empty URLs with 400', async () => {
    const emptyRes = await request(app).post('/api/scans').send({ url: '' });
    expect(emptyRes.status).toBe(400);
    expect(emptyRes.body.success).toBe(false);

    const invalidRes = await request(app).post('/api/scans').send({ url: 'javascript:alert(1)' });
    expect(invalidRes.status).toBe(400);
    expect(invalidRes.body.success).toBe(false);
  });

  it('POST /api/scans analyzes and persists a valid URL with 201', async () => {
    const res = await request(app)
      .post('/api/scans')
      .send({ url: 'https://paypal.com.verify-billing.site/login?token=secret123' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.riskScore).toBeGreaterThan(0);
    expect(res.body.data.hostname).toBe('paypal.com.verify-billing.site');
    expect(decodeURIComponent(res.body.data.sanitizedUrl)).toContain('[REDACTED]');
    expect(res.body.data.sourceStatus.googleSafeBrowsing).toBe('NOT_CONFIGURED');
  });

  it('GET /api/scans returns paginated results and honors search and filters', async () => {
    // Insert another record
    await request(app).post('/api/scans').send({ url: 'https://secure-bank.example.org' });

    const listRes = await request(app).get('/api/scans?page=1&limit=5');
    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(Array.isArray(listRes.body.data)).toBe(true);
    expect(listRes.body.pagination.total).toBeGreaterThanOrEqual(2);

    // Search filter
    const searchRes = await request(app).get('/api/scans?search=verify-billing');
    expect(searchRes.status).toBe(200);
    expect(searchRes.body.data.length).toBeGreaterThanOrEqual(1);
    expect(searchRes.body.data[0].hostname).toContain('verify-billing');
  });

  it('GET /api/scans/:id retrieves specific scan record or returns 404', async () => {
    const createRes = await request(app).post('/api/scans').send({ url: 'http://insecure-domain.org' });
    const id = createRes.body.data._id;

    const getRes = await request(app).get(`/api/scans/${id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.hostname).toBe('insecure-domain.org');

    const notFoundRes = await request(app).get('/api/scans/660000000000000000000000');
    expect(notFoundRes.status).toBe(404);
  });

  it('GET /api/analytics returns accurate aggregated metrics', async () => {
    const res = await request(app).get('/api/analytics');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalScans).toBeGreaterThan(0);
    expect(Array.isArray(res.body.data.riskDistribution)).toBe(true);
    expect(Array.isArray(res.body.data.topIndicators)).toBe(true);
  });

  it('DELETE /api/scans/:id deletes an individual record', async () => {
    const createRes = await request(app).post('/api/scans').send({ url: 'https://to-be-deleted.com' });
    const id = createRes.body.data._id;

    const delRes = await request(app).delete(`/api/scans/${id}`);
    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);

    const getRes = await request(app).get(`/api/scans/${id}`);
    expect(getRes.status).toBe(404);
  });

  it('DELETE /api/scans removes all records', async () => {
    const delAllRes = await request(app).delete('/api/scans');
    expect(delAllRes.status).toBe(200);
    expect(delAllRes.body.success).toBe(true);

    const listRes = await request(app).get('/api/scans');
    expect(listRes.body.pagination.total).toBe(0);
  });
});
