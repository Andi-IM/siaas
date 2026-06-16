import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import fetch from 'node-fetch';

vi.mock('node-fetch', () => {
  return {
    default: vi.fn(),
  };
});

const mockFetch = fetch as any;

describe('SIAAS API Server', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GITHUB_PAT = 'test_token';
    delete process.env.MISTRAL_API_KEY;
  });

  describe('GET /', () => {
    it('should return health check message', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.text).toBe('SIAAS API is running');
    });
  });

  describe('GET /updater', () => {
    it('should return updater data when GitHub response is ok', async () => {
      const dummyData = { version: '1.1.0', notes: 'Bug fixes' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => dummyData,
      });

      const res = await request(app).get('/updater');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(dummyData);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('releases/latest/download/updater.json')
      );
    });

    it('should return 204 when update is not found (404 from GitHub)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const res = await request(app).get('/updater');
      expect(res.status).toBe(204);
    });

    it('should return 500 when GitHub fails with another status code', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 502,
      });

      const res = await request(app).get('/updater');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Internal server error while fetching update.' });
    });
  });

  describe('POST /issues', () => {
    it('should return 500 if GITHUB_PAT is missing', async () => {
      delete process.env.GITHUB_PAT;

      const res = await request(app)
        .post('/issues')
        .send({ title: 'Test Bug', body: 'Description' });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'GitHub PAT is not configured on the server.' });
    });

    it('should return 400 if title is missing', async () => {
      const res = await request(app)
        .post('/issues')
        .send({ body: 'Description' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Missing title or body' });
    });

    it('should return 400 if body is missing', async () => {
      const res = await request(app)
        .post('/issues')
        .send({ title: 'Test Bug' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Missing title or body' });
    });

    it('should create a GitHub issue and return 201 without AI when MISTRAL_API_KEY is not set', async () => {
      const dummyIssue = { html_url: 'https://github.com/test/issues/1' };
      delete process.env.MISTRAL_API_KEY;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => dummyIssue,
      });

      const res = await request(app)
        .post('/issues')
        .send({ title: 'Test Bug', body: 'Description', logs: 'some logs' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        message: 'Issue created successfully',
        url: dummyIssue.html_url,
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/issues'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'token test_token',
          }),
        })
      );
      const reqBodyJson = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(reqBodyJson.body).not.toContain('AI Bug Analysis');
    });

    it('should enrich issue with Mistral-7B analysis and return 201 when MISTRAL_API_KEY is configured', async () => {
      process.env.MISTRAL_API_KEY = 'test_mistral_key';
      const dummyIssue = { html_url: 'https://github.com/test/issues/1' };
      const dummyMistralResponse = {
        choices: [
          {
            message: {
              content: 'AI Generated Analysis content here.',
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => dummyMistralResponse,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => dummyIssue,
      });

      const res = await request(app)
        .post('/issues')
        .send({ title: 'Test Bug', body: 'Description', logs: 'some logs' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        message: 'Issue created successfully',
        url: dummyIssue.html_url,
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);

      expect(mockFetch.mock.calls[0][0]).toBe('https://api.mistral.ai/v1/chat/completions');
      expect(mockFetch.mock.calls[0][1]).toEqual(
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test_mistral_key',
          }),
        })
      );

      expect(mockFetch.mock.calls[1][0]).toContain('/issues');
      const gitReqBodyJson = JSON.parse(mockFetch.mock.calls[1][1].body);
      expect(gitReqBodyJson.body).toContain('🤖 AI Bug Analysis (Mistral-7B)');
      expect(gitReqBodyJson.body).toContain('AI Generated Analysis content here.');
      expect(gitReqBodyJson.body).toContain('### Attached Logs');
    });

    it('should degrade gracefully and create issue without AI if Mistral API fails', async () => {
      process.env.MISTRAL_API_KEY = 'test_mistral_key';
      const dummyIssue = { html_url: 'https://github.com/test/issues/1' };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Error',
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => dummyIssue,
      });

      const res = await request(app)
        .post('/issues')
        .send({ title: 'Test Bug', body: 'Description', logs: 'some logs' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        message: 'Issue created successfully',
        url: dummyIssue.html_url,
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);

      const gitReqBodyJson = JSON.parse(mockFetch.mock.calls[1][1].body);
      expect(gitReqBodyJson.body).not.toContain('🤖 AI Bug Analysis');
      expect(gitReqBodyJson.body).toContain('### Attached Logs');
    });

    it('should return GitHub response status if creation fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      });

      const res = await request(app)
        .post('/issues')
        .send({ title: 'Test Bug', body: 'Description' });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Failed to create GitHub issue' });
    });
  });
});
