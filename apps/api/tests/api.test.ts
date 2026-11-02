import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('MOMENTUM Backend API & Auth Acceptance Tests', () => {
  it('GET /api/v1/health -> Returns healthy service status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('healthy');
    expect(res.body.data.service).toBe('momentum-api');
    expect(res.headers['x-request-id']).toBeDefined();
  });

  it('POST /api/v1/auth/register -> Creates user and issues session cookie', async () => {
    const email = `designer_${Date.now()}@momentum.app`;
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email,
        password: 'Password123!',
        displayName: 'Spatial Designer',
        timezone: 'Asia/Kolkata'
      });

    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe(email);
    expect(res.body.data.user.displayName).toBe('Spatial Designer');
    expect(res.body.data.token).toBeDefined();

    // Verify Set-Cookie header contains momentum_session
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain('momentum_session');
  });

  it('POST /api/v1/auth/register -> Rejects duplicate email with 409 Conflict', async () => {
    const email = 'duplicate@momentum.app';
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email,
        password: 'Password123!',
        displayName: 'Original User'
      });

    const duplicateRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email,
        password: 'Password123!',
        displayName: 'Impostor'
      });

    expect(duplicateRes.status).toBe(409);
    expect(duplicateRes.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
  });

  it('POST /api/v1/auth/login -> Rejects invalid credentials with 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'creator@momentum.app',
        password: 'WrongPassword!'
      });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('POST /api/v1/auth/login -> Authenticates valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'creator@momentum.app',
        password: 'Momentum2026!'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('creator@momentum.app');
    expect(res.body.data.token).toBeDefined();
  });

  it('PATCH /api/v1/auth/preferences -> Updates user spatial preferences', async () => {
    const res = await request(app)
      .patch('/api/v1/auth/preferences')
      .send({
        defaultEnvironment: 'flow',
        snapInterval: 30,
        reducedMotion: true
      });

    expect(res.status).toBe(200);
    expect(res.body.data.defaultEnvironment).toBe('flow');
    expect(res.body.data.snapInterval).toBe(30);
    expect(res.body.data.reducedMotion).toBe(true);
  });

  it('GET /api/v1/events -> Returns scoped calendar events', async () => {
    const res = await request(app).get('/api/v1/events');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('POST /api/v1/events -> Validates and creates a new temporal commitment', async () => {
    const res = await request(app)
      .post('/api/v1/events')
      .send({
        title: 'Quantum Waveform Simulation',
        description: 'Simulate high-frequency harmonic manifolds.',
        categoryId: 'cat-work',
        startAt: '2026-11-03T10:00:00+05:30',
        endAt: '2026-11-03T12:00:00+05:30',
        timezone: 'Asia/Kolkata',
        allDay: false
      });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Quantum Waveform Simulation');
    expect(res.body.data.id).toBeDefined();
  });

  it('POST /api/v1/scenarios/:id/apply -> Atomically commits alternate scenario', async () => {
    const res = await request(app).post('/api/v1/scenarios/scenario-a/apply');
    expect(res.status).toBe(200);
    expect(res.body.data.success).toBe(true);
    expect(res.body.data.appliedScenarioId).toBe('scenario-a');
  });
});
